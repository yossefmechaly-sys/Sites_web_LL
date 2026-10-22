// Crée (ou réinitialise le mot de passe de) un compte administrateur, et supprime les comptes
// de test « @jerusalemfc.test » créés pendant le développement.
// Usage (sur le serveur) :
//   ADMIN_EMAIL=prenom@exemple.com ADMIN_PASSWORD='un-mot-de-passe-long' npm run create-admin

import { getPayload } from 'payload'
import config from '@payload-config'

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase()
const password = process.env.ADMIN_PASSWORD
if (!email || !password) throw new Error('ADMIN_EMAIL et ADMIN_PASSWORD sont requis')
if (password.length < 12) throw new Error('Mot de passe trop court (12 caractères minimum)')

const payload = await getPayload({ config })

const existing = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1 })
if (existing.docs[0]) {
  await payload.update({ collection: 'users', id: existing.docs[0].id, data: { password } })
  payload.logger.info(`Mot de passe de ${email} réinitialisé`)
} else {
  await payload.create({ collection: 'users', data: { email, password } })
  payload.logger.info(`Compte ${email} créé`)
}

const test = await payload.delete({ collection: 'users', where: { email: { like: '@jerusalemfc.test' } } })
if (test.docs.length) payload.logger.info(`${test.docs.length} compte(s) de test supprimé(s)`)

process.exit(0)
