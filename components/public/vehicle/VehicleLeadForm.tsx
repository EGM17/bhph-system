'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'

interface VehicleLeadFormProps {
  vehicleId: string
  vehicleTitle: string
  vehicleSlug: string
  locale: string
}

interface FormState {
  name: string
  email: string
  phone: string
  message: string
}

type Status = 'idle' | 'submitting' | 'success' | 'error'

export default function VehicleLeadForm({
  vehicleId,
  vehicleTitle,
  vehicleSlug,
  locale,
}: VehicleLeadFormProps) {
  const t = useTranslations('vehicleDetail.contactForm')
  const [form, setForm] = useState<FormState>({ name: '', email: '', phone: '', message: '' })
  const [status, setStatus] = useState<Status>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault()

    if (!form.name.trim() || !form.email.trim() || !form.phone.trim()) return

    setStatus('submitting')
    setErrorMsg('')

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...form,
          vehicleId,
          vehicleTitle,
          vehicleSlug,
          source: 'vehicle_detail',
          language: locale,
        }),
      })

      if (!res.ok) throw new Error('Request failed')

      setStatus('success')
      setForm({ name: '', email: '', phone: '', message: '' })
    } catch {
      setStatus('error')
      setErrorMsg(t('error'))
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <h3 className="text-base font-semibold text-gray-900 mb-1">{t('title')}</h3>
      <p className="text-sm text-gray-500 mb-4">{t('subtitle')}</p>

      {status === 'success' ? (
        <div className="bg-green-50 border border-green-200 rounded-lg px-4 py-3 text-sm text-green-700 font-medium">
          {t('success')}
        </div>
      ) : (
        <div className="space-y-3">
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder={t('name')}
            className="input-field text-sm py-2.5"
            required
            disabled={status === 'submitting'}
            autoComplete="name"
          />
          <input
            type="email"
            name="email"
            value={form.email}
            onChange={handleChange}
            placeholder={t('email')}
            className="input-field text-sm py-2.5"
            required
            disabled={status === 'submitting'}
            autoComplete="email"
          />
          <input
            type="tel"
            name="phone"
            value={form.phone}
            onChange={handleChange}
            placeholder={t('phone')}
            className="input-field text-sm py-2.5"
            required
            disabled={status === 'submitting'}
            autoComplete="tel"
          />
          <textarea
            name="message"
            value={form.message}
            onChange={handleChange}
            placeholder={t('message')}
            rows={3}
            className="input-field text-sm py-2.5 resize-none"
            disabled={status === 'submitting'}
          />

          {status === 'error' && (
            <p className="text-sm text-red-600">{errorMsg}</p>
          )}

          <button
            onClick={handleSubmit}
            disabled={status === 'submitting' || !form.name || !form.email || !form.phone}
            className="btn-outline-blue w-full justify-center text-sm disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {status === 'submitting' ? t('sending') : t('submit')}
          </button>
        </div>
      )}
    </div>
  )
}
