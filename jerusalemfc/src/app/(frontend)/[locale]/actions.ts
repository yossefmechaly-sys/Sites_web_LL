'use server'

import { getPayload } from 'payload'

import config from '@/payload.config'
import { isLocale } from '@/i18n/config'

export type SubscribeState = { status: 'idle' | 'success' | 'invalid' | 'error' }

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

// Inscription à la newsletter depuis l'accueil.
export async function subscribe(_prev: SubscribeState, form: FormData): Promise<SubscribeState> {
  // Champ piège invisible : rempli uniquement par les robots, on fait comme si tout allait bien
  if (String(form.get('website') ?? '')) return { status: 'success' }

  const email = String(form.get('email') ?? '')
    .trim()
    .toLowerCase()
  const locale = String(form.get('locale') ?? '')
  if (!EMAIL.test(email) || email.length > 254) return { status: 'invalid' }

  const payload = await getPayload({ config: await config })
  try {
    const existing = await payload.count({ collection: 'subscribers', where: { email: { equals: email } } })
    // Déjà inscrit : même réponse qu'une nouvelle inscription (ne révèle pas qui est inscrit)
    if (existing.totalDocs === 0) {
      await payload.create({
        collection: 'subscribers',
        data: { email, locale: isLocale(locale) ? locale : undefined },
        overrideAccess: true,
      })
    }
    return { status: 'success' }
  } catch (err) {
    payload.logger.error(`Inscription newsletter échouée : ${(err as Error).message}`)
    return { status: 'error' }
  }
}

export type FormState = { status: 'idle' | 'success' | 'invalid' | 'error' }

const field = (form: FormData, name: string, max = 200) => String(form.get(name) ?? '').trim().slice(0, max)
const PHONE = /^[+\d][\d\s().-]{6,19}$/

// Précommande depuis la page boutique : enregistrée dans l'admin, le club recontacte le client.
export async function preOrder(_prev: FormState, form: FormData): Promise<FormState> {
  if (field(form, 'website')) return { status: 'success' }
  const name = field(form, 'name')
  const phone = field(form, 'phone', 30)
  const email = field(form, 'email', 254).toLowerCase()
  const details = field(form, 'details', 2000)
  const locale = field(form, 'locale', 5)
  if (!name || !PHONE.test(phone) || (email && !EMAIL.test(email)) || !details || form.get('accept') !== 'on')
    return { status: 'invalid' }

  const payload = await getPayload({ config: await config })
  try {
    await payload.create({
      collection: 'pre-orders',
      data: { name, phone, email: email || undefined, details, locale: isLocale(locale) ? locale : undefined },
      overrideAccess: true,
    })
    return { status: 'success' }
  } catch (err) {
    payload.logger.error(`Précommande échouée : ${(err as Error).message}`)
    return { status: 'error' }
  }
}

// Adhésion gratuite au club.
export async function join(_prev: FormState, form: FormData): Promise<FormState> {
  if (field(form, 'website')) return { status: 'success' }
  const lastName = field(form, 'lastName')
  const firstName = field(form, 'firstName')
  const email = field(form, 'email', 254).toLowerCase()
  const phone = field(form, 'phone', 30)
  const locale = field(form, 'locale', 5)
  if (!lastName || !firstName || !EMAIL.test(email) || (phone && !PHONE.test(phone))) return { status: 'invalid' }

  const payload = await getPayload({ config: await config })
  try {
    // Déjà adhérent : même réponse (ne révèle pas qui est inscrit)
    if ((await payload.count({ collection: 'members', where: { email: { equals: email } } })).totalDocs === 0) {
      await payload.create({
        collection: 'members',
        data: { lastName, firstName, email, phone: phone || undefined, locale: isLocale(locale) ? locale : undefined },
        overrideAccess: true,
      })
    }
    return { status: 'success' }
  } catch (err) {
    payload.logger.error(`Adhésion échouée : ${(err as Error).message}`)
    return { status: 'error' }
  }
}
