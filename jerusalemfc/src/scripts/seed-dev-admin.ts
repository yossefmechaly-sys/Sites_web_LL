// Crée le compte admin de développement local à partir de DEV_ADMIN_EMAIL / DEV_ADMIN_PASSWORD (.env).
import { getPayload } from 'payload'
import config from '@payload-config'

const email = process.env.DEV_ADMIN_EMAIL
const password = process.env.DEV_ADMIN_PASSWORD
if (!email || !password) throw new Error('DEV_ADMIN_EMAIL et DEV_ADMIN_PASSWORD requis dans .env')

const payload = await getPayload({ config })
const existing = await payload.find({ collection: 'users', where: { email: { equals: email } }, limit: 1 })
if (!existing.totalDocs) {
  await payload.create({ collection: 'users', data: { email, password } })
  payload.logger.info(`Compte ${email} créé`)
}
process.exit(0)
