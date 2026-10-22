import { revalidatePath } from 'next/cache'

// Vide le cache des pages (ISR). Appelé par l'import des matchs, qui tourne hors du serveur Next.js
// et ne peut donc pas le faire lui-même. Protégé par REVALIDATE_SECRET (et limité à 127.0.0.1 par Nginx).
export async function POST(request: Request) {
  const secret = process.env.REVALIDATE_SECRET
  if (!secret || request.headers.get('x-revalidate-secret') !== secret) {
    return new Response('Forbidden', { status: 403 })
  }
  revalidatePath('/', 'layout')
  return Response.json({ revalidated: true, at: new Date().toISOString() })
}
