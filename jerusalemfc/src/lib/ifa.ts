// Lecture des matchs d'une ligue sur football.org.il (Fédération israélienne).
// Pas d'API officielle : on lit les fragments HTML que le site charge lui-même.

import { execFile } from 'node:child_process'
import { promisify } from 'node:util'

const execFileAsync = promisify(execFile)

const BASE = 'https://www.football.org.il'
const MAX_ROUNDS = 40

// Sans user-agent de navigateur, le site répond 403.
const HEADERS: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36',
  'Accept-Language': 'he-IL,he;q=0.9',
}

export type IfaGame = {
  gameId: string | null
  round: number
  date: string | null // AAAA-MM-JJ
  time: string | null // HH:MM, null si pas encore fixée
  venue: string | null
  home: { id: string; name: string }
  away: { id: string; name: string }
  score: { home: number; away: number } | null
}

// Cloudflare bloque l'empreinte TLS de fetch() (Node) mais laisse passer curl.
// Si un jour ça casse aussi, repli prévu sur un navigateur headless.
async function httpGet(url: string): Promise<string> {
  const args = ['-s', '--compressed', '-w', '\n%{http_code}']
  for (const [k, v] of Object.entries(HEADERS)) args.push('-H', `${k}: ${v}`)
  const { stdout } = await execFileAsync('curl', [...args, url], { maxBuffer: 20 * 1024 * 1024 })
  const cut = stdout.lastIndexOf('\n')
  const status = Number(stdout.slice(cut + 1))
  if (status !== 200) throw new Error(`HTTP ${status} sur ${url}`)
  return stdout.slice(0, cut)
}

const decode = (s: string) =>
  s
    .replace(/&nbsp;/g, ' ')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')

const stripTags = (s: string) => decode(s.replace(/<[^>]*>/g, '')).replace(/\s+/g, ' ').trim()

export function parseRound(html: string, round: number): IfaGame[] {
  const games: IfaGame[] = []
  // Chaque match est un <a class='table_row ...'> (avec lien vers la fiche) ou un <div class="table_row ">,
  // portant data-team1 / data-team2 : on découpe sur ces ouvertures de balise.
  const chunks = html.split(/(?=<(?:a|div)\s[^>]*class=["']table_row[\s"'])/).slice(1)
  for (const chunk of chunks) {
    const open = chunk.match(/^<[^>]*>/)![0]
    const homeId = open.match(/data-team1='(\d+)'/)?.[1]
    const awayId = open.match(/data-team2='(\d+)'/)?.[1]
    if (!homeId || !awayId) continue
    const href = open.match(/href="([^"]*)"/)?.[1]
    const body = chunk.slice(open.length)
    const cols = [...body.matchAll(/<div class='table_col[^']*'>([\s\S]*?)<\/div>/g)].map((c) =>
      stripTags(c[1].replace(/<span class='sr-only'>[^<]*<\/span>/g, '')),
    )
    const teams = [...body.matchAll(/<span class="team-name-text">([\s\S]*?)<\/span>/g)].map((t) =>
      stripTags(t[1]).replace(/\s*-\s*$/, ''),
    )
    const [date, , venue, time, result] = cols
    const score = result?.match(/^(\d+)\s*-\s*(\d+)$/)
    // La cellule date peut contenir un statut collé (ex. « 18/10/הפסקה2026 » : match interrompu) :
    // on n'en garde que les chiffres jour/mois/année
    const digits = (date ?? '').replace(/[^\d/]/g, '')
    const [, d, mo, y] = digits.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/) ?? []
    games.push({
      gameId: href?.match(/game_id=(\d+)/)?.[1] ?? null,
      round,
      date: y ? `${y}-${mo.padStart(2, '0')}-${d.padStart(2, '0')}` : null,
      time: /^\d{1,2}:\d{2}$/.test(time ?? '') ? time : null, // sinon « טרם נקבע » (pas encore fixé)
      venue: venue || null,
      home: { id: homeId, name: teams[0] },
      away: { id: awayId, name: teams[1] },
      // Piège : la liste affiche « extérieur - domicile » (vérifié sur la fiche du match 1062302,
      // Dimona 0 : Kiryat Gat 5 affiché « 5 - 0 »).
      score: score ? { home: Number(score[2]), away: Number(score[1]) } : null,
    })
  }
  return games
}

export async function fetchSeasonGames(leagueId: number, seasonId: number): Promise<IfaGame[]> {
  const games: IfaGame[] = []
  for (let round = 1; round <= MAX_ROUNDS; round++) {
    const xml = await httpGet(
      `${BASE}/Components.asmx/LeagueGamesList?league_id=${leagueId}&season_id=${seasonId}` +
        `&box=10&round_id=${round}&componentTitle=x`,
    )
    const html = decode(xml.match(/<HtmlData>([\s\S]*)<\/HtmlData>/)?.[1] ?? '')
    if (!html || /not valid/.test(html)) continue // tour absent (ex. numérotation des play-offs)
    games.push(...parseRound(html, round))
    await new Promise((r) => setTimeout(r, 300)) // rester poli avec le serveur
  }
  return games
}

// « 2026-10-19 » + « 19:30 » heure d'Israël → Date UTC (gère l'heure d'été).
export function israelTimeToUtc(date: string, time: string | null): Date {
  const [y, m, d] = date.split('-').map(Number)
  const [hh, mm] = (time ?? '00:00').split(':').map(Number)
  const asUtc = Date.UTC(y, m - 1, d, hh, mm)
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Jerusalem',
      hourCycle: 'h23',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })
      .formatToParts(new Date(asUtc))
      .map((p) => [p.type, p.value]),
  )
  const shown = Date.UTC(+parts.year, +parts.month - 1, +parts.day, +parts.hour, +parts.minute)
  return new Date(asUtc - (shown - asUtc))
}
