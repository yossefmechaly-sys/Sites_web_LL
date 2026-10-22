'use client'

import React, { useActionState } from 'react'

import { subscribe, type SubscribeState } from '@/app/(frontend)/[locale]/actions'

type Labels = { placeholder: string; button: string; success: string; invalid: string; error: string }

export function NewsletterForm({ locale, labels }: { locale: string; labels: Labels }) {
  const [state, action, pending] = useActionState<SubscribeState, FormData>(subscribe, { status: 'idle' })

  if (state.status === 'success')
    return (
      <p className="newsletter__message" role="status">
        {labels.success}
      </p>
    )

  return (
    <>
      <form className="newsletter__form" action={action}>
        <input type="hidden" name="locale" value={locale} />
        {/* Champ piège pour les robots, invisible pour les visiteurs */}
        <input className="newsletter__trap" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden />
        <input type="email" name="email" dir="auto" required placeholder={labels.placeholder} aria-label="Email" />
        <button type="submit" disabled={pending}>
          {labels.button}
        </button>
      </form>
      {(state.status === 'invalid' || state.status === 'error') && (
        <p className="newsletter__message newsletter__message--error" role="alert">
          {state.status === 'invalid' ? labels.invalid : labels.error}
        </p>
      )}
    </>
  )
}
