'use client'

import { useState } from 'react'

interface ContactPageFormProps {
  locale: string
  source: string
  submitLabel?: string
}

interface FormState {
  name: string
  email: string
  phone: string
  message: string
}

type Status = 'idle' | 'submitting' | 'success' | 'error'

export default function ContactPageForm({
  locale,
  source,
  submitLabel,
}: ContactPageFormProps) {
  const isEs = locale === 'es'
  const [form, setForm] = useState<FormState>({ name: '', email: '', phone: '', message: '' })
  const [status, setStatus] = useState<Status>('idle')

  const labels = {
    name: isEs ? 'Nombre completo' : 'Full name',
    email: isEs ? 'Correo electrónico' : 'Email',
    phone: isEs ? 'Teléfono' : 'Phone',
    message: isEs ? 'Mensaje' : 'Message',
    submit: submitLabel ?? (isEs ? 'Enviar mensaje' : 'Send message'),
    sending: isEs ? 'Enviando...' : 'Sending...',
    success: isEs
      ? 'Mensaje enviado. Te contactaremos en breve.'
      : 'Message sent. We will contact you shortly.',
    error: isEs
      ? 'Error al enviar. Por favor intenta de nuevo.'
      : 'Failed to send. Please try again.',
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setStatus('submitting')

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, source, language: locale }),
      })
      if (!res.ok) throw new Error()
      setStatus('success')
      setForm({ name: '', email: '', phone: '', message: '' })
    } catch {
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="bg-green-50 border border-green-200 rounded-xl px-5 py-6 text-center text-green-700 font-medium">
        {labels.success}
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl border border-gray-200 p-6 space-y-4" noValidate>
      <input
        type="text"
        name="name"
        value={form.name}
        onChange={handleChange}
        placeholder={labels.name}
        required
        disabled={status === 'submitting'}
        className="input-field"
        autoComplete="name"
      />
      <input
        type="email"
        name="email"
        value={form.email}
        onChange={handleChange}
        placeholder={labels.email}
        required
        disabled={status === 'submitting'}
        className="input-field"
        autoComplete="email"
      />
      <input
        type="tel"
        name="phone"
        value={form.phone}
        onChange={handleChange}
        placeholder={labels.phone}
        required
        disabled={status === 'submitting'}
        className="input-field"
        autoComplete="tel"
      />
      <textarea
        name="message"
        value={form.message}
        onChange={handleChange}
        placeholder={labels.message}
        rows={4}
        disabled={status === 'submitting'}
        className="input-field resize-none"
      />

      {status === 'error' && (
        <p role="alert" className="text-sm text-red-600">{labels.error}</p>
      )}

      <button
        type="submit"
        disabled={status === 'submitting' || !form.name || !form.email || !form.phone}
        className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {status === 'submitting' ? labels.sending : labels.submit}
      </button>
    </form>
  )
}
