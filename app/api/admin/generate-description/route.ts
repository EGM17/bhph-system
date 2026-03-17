export const dynamic = 'force-dynamic'

import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { vehicleData, tone, focus, language } = await request.json()

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini API key not configured.' }, { status: 500 })
    }

    const toneInstructions: Record<string, string> = {
      professional: 'Use a professional, trustworthy tone. Focus on reliability and value.',
      friendly: 'Use a warm, friendly and conversational tone. Make it approachable.',
      urgent: 'Create a sense of urgency. Highlight limited availability and great deal.',
      enthusiastic: 'Use an enthusiastic, exciting tone. Make the reader feel excited about this vehicle.',
    }

    const focusInstructions: Record<string, string> = {
      features: 'Focus primarily on the vehicle features, specs, and equipment.',
      financing: 'Emphasize the easy financing, low payments, and no credit check required.',
      family: 'Highlight how this vehicle is perfect for families — space, safety, reliability.',
      value: 'Focus on the great value, low price, and what the buyer gets for their money.',
    }

    const isSpanish = language === 'es'

    const vehicleInfo = [
      vehicleData.year && vehicleData.make && vehicleData.model
        ? `Vehicle: ${vehicleData.year} ${vehicleData.make} ${vehicleData.model}${vehicleData.trim ? ' ' + vehicleData.trim : ''}`
        : null,
      vehicleData.mileage ? `Mileage: ${Number(vehicleData.mileage).toLocaleString()} miles` : null,
      vehicleData.color ? `Color: ${vehicleData.color}` : null,
      vehicleData.bodyClass ? `Body: ${vehicleData.bodyClass}` : null,
      vehicleData.engine ? `Engine: ${vehicleData.engine}` : null,
      vehicleData.transmission ? `Transmission: ${vehicleData.transmission}` : null,
      vehicleData.drivetrain ? `Drivetrain: ${vehicleData.drivetrain}` : null,
      vehicleData.fuelType ? `Fuel: ${vehicleData.fuelType}` : null,
      vehicleData.mpg ? `MPG: ${vehicleData.mpg}` : null,
      vehicleData.doors ? `Doors: ${vehicleData.doors}` : null,
      vehicleData.financingType === 'in-house' && vehicleData.monthlyPayment
        ? `Monthly payment from: $${vehicleData.monthlyPayment}/mo`
        : null,
      vehicleData.financingType === 'in-house' && vehicleData.downPayment
        ? `Down payment from: $${vehicleData.downPayment}`
        : null,
      vehicleData.financingType === 'in-house'
        ? 'Financing: In-house financing available, no credit check required, no SSN, no ITIN needed'
        : null,
      vehicleData.price ? `Cash price: $${vehicleData.price}` : null,
    ].filter(Boolean).join('\n')

    const prompt = isSpanish
      ? `Eres un experto en ventas de autos usados en Salem, Oregon. Escribe una descripción atractiva en ESPAÑOL para el siguiente vehículo.

${vehicleInfo}

Instrucciones de tono: ${toneInstructions[tone] || toneInstructions.friendly}
Instrucciones de enfoque: ${focusInstructions[focus] || focusInstructions.features}

Escribe 2-3 párrafos cortos (máximo 120 palabras en total). No uses listas ni bullets. Solo texto corrido. No incluyas precios ni pagos exactos a menos que estén en los datos. Termina con una llamada a la acción para contactarnos o visitar el concesionario en Salem, Oregon.`
      : `You are an expert used car salesperson in Salem, Oregon. Write an attractive description in ENGLISH for the following vehicle.

${vehicleInfo}

Tone instructions: ${toneInstructions[tone] || toneInstructions.friendly}
Focus instructions: ${focusInstructions[focus] || focusInstructions.features}

Write 2-3 short paragraphs (maximum 120 words total). No lists or bullets. Plain text only. Do not include exact prices or payments unless they are in the data. End with a call to action to contact us or visit the dealership in Salem, Oregon.`

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.8,
            maxOutputTokens: 300,
          },
        }),
      }
    )

    if (!res.ok) {
      const err = await res.text()
      console.error('[Gemini API error]', err)
      return NextResponse.json({ error: 'Failed to generate description.' }, { status: 500 })
    }

    const data = await res.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? ''

    return NextResponse.json({ description: text.trim() })
  } catch (error) {
    console.error('[POST /api/admin/generate-description]', error)
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 })
  }
}