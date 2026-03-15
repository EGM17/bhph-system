import { NextRequest, NextResponse } from 'next/server'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import type { ApiResponse } from '@/types'

// Basic input sanitizer — strips HTML tags
function sanitize(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.replace(/<[^>]*>/g, '').trim().slice(0, 1000)
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

function isValidPhone(phone: string): boolean {
  return /^\+?[\d\s\-().]{7,20}$/.test(phone)
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<{ id: string }>>> {
  try {
    const body = await request.json()

    const name = sanitize(body.name)
    const email = sanitize(body.email)
    const phone = sanitize(body.phone)
    const message = sanitize(body.message)
    const vehicleId = sanitize(body.vehicleId)
    const vehicleTitle = sanitize(body.vehicleTitle)
    const vehicleSlug = sanitize(body.vehicleSlug)
    const source = sanitize(body.source) || 'contact_page'
    const language = body.language === 'es' ? 'es' : 'en'

    // Validate required fields
    if (!name || !email || !phone) {
      return NextResponse.json(
        { success: false, error: 'Name, email, and phone are required.' },
        { status: 400 }
      )
    }

    if (!isValidEmail(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address.' },
        { status: 400 }
      )
    }

    if (!isValidPhone(phone)) {
      return NextResponse.json(
        { success: false, error: 'Invalid phone number.' },
        { status: 400 }
      )
    }

    // Save to Firestore
    const docRef = await addDoc(collection(db, 'leads'), {
      name,
      email,
      phone,
      message,
      vehicleId: vehicleId || null,
      vehicleTitle: vehicleTitle || null,
      vehicleSlug: vehicleSlug || null,
      source,
      language,
      status: 'new',
      createdAt: serverTimestamp(),
    })

    // Send email notification (non-blocking — we don't await this)
    sendEmailNotification({ name, email, phone, message, vehicleTitle, source }).catch(
      (err) => console.error('[Lead email notification failed]', err)
    )

    return NextResponse.json({ success: true, data: { id: docRef.id } }, { status: 201 })
  } catch (error) {
    console.error('[POST /api/leads]', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error.' },
      { status: 500 }
    )
  }
}

async function sendEmailNotification(data: {
  name: string
  email: string
  phone: string
  message: string
  vehicleTitle: string
  source: string
}) {
  const emailUser = process.env.EMAIL_USER
  const emailPassword = process.env.EMAIL_PASSWORD
  const emailTo = process.env.EMAIL_TO

  if (!emailUser || !emailPassword || !emailTo) return

  // Dynamic import to avoid bundling nodemailer on the client
  const nodemailer = await import('nodemailer')

  const transporter = nodemailer.default.createTransport({
    host: process.env.EMAIL_HOST ?? 'smtp.gmail.com',
    port: Number(process.env.EMAIL_PORT ?? 587),
    secure: false,
    auth: { user: emailUser, pass: emailPassword },
  })

  await transporter.sendMail({
    from: `"El Compa Guero Leads" <${emailUser}>`,
    to: emailTo,
    subject: `New lead${data.vehicleTitle ? ` — ${data.vehicleTitle}` : ''}: ${data.name}`,
    text: `
New lead received from ${data.source}

Name: ${data.name}
Email: ${data.email}
Phone: ${data.phone}
Vehicle: ${data.vehicleTitle || 'N/A'}
Message: ${data.message || 'No message'}
    `.trim(),
    html: `
<h2>New Lead — El Compa Guero Auto Sales</h2>
<table>
  <tr><td><strong>Name:</strong></td><td>${data.name}</td></tr>
  <tr><td><strong>Email:</strong></td><td>${data.email}</td></tr>
  <tr><td><strong>Phone:</strong></td><td>${data.phone}</td></tr>
  <tr><td><strong>Vehicle:</strong></td><td>${data.vehicleTitle || 'N/A'}</td></tr>
  <tr><td><strong>Source:</strong></td><td>${data.source}</td></tr>
  <tr><td><strong>Message:</strong></td><td>${data.message || '—'}</td></tr>
</table>
    `,
  })
}
