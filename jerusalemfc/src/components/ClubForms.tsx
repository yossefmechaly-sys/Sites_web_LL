'use client'

import React, { useActionState } from 'react'

import { join, preOrder, type FormState } from '@/app/(frontend)/[locale]/actions'

// Formulaires de la boutique (précommande) et de l'adhésion.

type Messages = { submit: string; success: string; invalid: string; error: string }

function Status({ state, m }: { state: FormState; m: Messages }) {
  if (state.status !== 'invalid' && state.status !== 'error') return null
  return (
    <p className="club-form__message club-form__message--error" role="alert">
      {state.status === 'invalid' ? m.invalid : m.error}
    </p>
  )
}

// Champ piège pour les robots, invisible pour les visiteurs
const Trap = () => <input className="newsletter__trap" type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden />

export function PreOrderForm({
  locale,
  labels,
  m,
}: {
  locale: string
  labels: { name: string; phone: string; email: string; details: string; accept: string }
  m: Messages
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(preOrder, { status: 'idle' })
  if (state.status === 'success')
    return (
      <p className="club-form__message" role="status">
        {m.success}
      </p>
    )
  return (
    <form className="club-form" action={action}>
      <input type="hidden" name="locale" value={locale} />
      <Trap />
      <div className="club-form__row club-form__row--3">
        <input name="name" required placeholder={labels.name} aria-label={labels.name} autoComplete="name" />
        <input name="phone" type="tel" required placeholder={labels.phone} aria-label={labels.phone} autoComplete="tel" />
        <input name="email" type="email" placeholder={labels.email} aria-label={labels.email} autoComplete="email" />
      </div>
      <textarea name="details" required rows={8} placeholder={labels.details} aria-label={labels.details} />
      <label className="club-form__check">
        <input type="checkbox" name="accept" required /> {labels.accept}
      </label>
      <button type="submit" className="btn btn--grey" disabled={pending}>
        {m.submit}
      </button>
      <Status state={state} m={m} />
    </form>
  )
}

export function JoinForm({
  locale,
  labels,
  m,
}: {
  locale: string
  labels: { lastName: string; firstName: string; email: string; phone: string }
  m: Messages
}) {
  const [state, action, pending] = useActionState<FormState, FormData>(join, { status: 'idle' })
  if (state.status === 'success')
    return (
      <p className="club-form__message" role="status">
        {m.success}
      </p>
    )
  return (
    <form className="club-form club-form--light" action={action}>
      <input type="hidden" name="locale" value={locale} />
      <Trap />
      <div className="club-form__row">
        <input name="lastName" required placeholder={labels.lastName} aria-label={labels.lastName} autoComplete="family-name" />
        <input name="firstName" required placeholder={labels.firstName} aria-label={labels.firstName} autoComplete="given-name" />
      </div>
      <div className="club-form__row">
        <input name="email" type="email" required placeholder={labels.email} aria-label={labels.email} autoComplete="email" />
        <input name="phone" type="tel" placeholder={labels.phone} aria-label={labels.phone} autoComplete="tel" />
      </div>
      <button type="submit" className="btn btn--gold btn--lg" disabled={pending}>
        {m.submit}
      </button>
      <Status state={state} m={m} />
    </form>
  )
}
