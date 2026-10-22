// Correspondances avec l'ancien site WordPress (SportsPress), utilisées par les scripts de reprise.

export const WP_BASE = 'https://jerusalemfc.co.il'

// id Fédération → équipe SportsPress (id de la version hébraïque) et nom français.
// Les id WP diffèrent entre /he et /fr (traductions distinctes) : correspondance faite à la main.
export const IFA_TO_WP: Record<string, { wpHe?: number; frName: string }> = {
  '7348': { wpHe: 3477, frName: 'FC Jerusalem' },
  '1121': { wpHe: 3839, frName: 'Maccabi Kyriat Malakhi' },
  '6848': { wpHe: 5542, frName: 'Beitar Nordia' },
  '5013': { wpHe: 5923, frName: 'MS Dimona' },
  '6860': { wpHe: 5914, frName: 'Shimshon Tel Aviv' },
  '1002': { wpHe: 5906, frName: 'Maccabi Yavné' },
  '2261': { wpHe: 5926, frName: 'Hapoel Azor' },
  '6922': { wpHe: 5912, frName: 'Maccabi Ashdod FC' },
  '2208': { wpHe: 5897, frName: 'Hapoel Herzliya Ironi' },
  '7066': { wpHe: 5900, frName: 'Tseïre Tira' },
  '7617': { wpHe: 5551, frName: 'F.C. Sderot' },
  '2211': { wpHe: 5903, frName: 'Hapoel Marmorek Rehovot' },
  '8012': { wpHe: 6009, frName: 'FC Kfar Saba' },
  '6837': { wpHe: 5917, frName: 'Holon Yeremiyaou FC' },
  '2194': { wpHe: 6012, frName: 'Hapoel Nir Ramat Hasharon' },
  '6743': { wpHe: 5040, frName: 'Beitar Gan Yavne' },
  '7521': { wpHe: 5700, frName: 'Maccabi Kyriat Gat' },
  // Absentes de l'ancien site : noms translittérés dans le même style, pas de logo
  '2256': { frName: 'Hapoel Mahané Yehouda' },
  '4237': { frName: 'Ironi Beit Shemesh' },
  '2186': { frName: 'Hapoel Hadera' },
}

// Équipe SportsPress : id hébreu → id français, quand ils diffèrent (vérifié sur les noms).
// Les autres équipes ont le même id dans les deux langues.
export const WP_TEAM_FR_ID: Record<number, number> = {
  6155: 6108,
  6012: 5997,
  6009: 6000,
  5914: 5908,
  5912: 5914,
  5909: 5911,
  5906: 5905,
  5903: 5902,
  5900: 5899,
  5897: 5895,
  5890: 5892,
  5797: 5761,
  5703: 5676,
  5700: 5680,
  5697: 5683,
  5557: 5498,
  5554: 5489,
  5551: 5486,
  5548: 5501,
  5545: 5492,
  5542: 5495,
  5537: 5479,
}

// Ligue SportsPress (id hébreu) → nom français repris de la version française de l'ancien site
export const WP_LEAGUE_FR: Record<number, string> = {
  152: "Coupe d'Israel",
  160: 'Ligua Aleph Sud',
  151: 'Ligua Beit Sud Aleph',
  148: 'Ligua Beit Sud Beit',
  147: 'Ligua Guimel',
  158: 'Playoff 2023-2024',
  150: 'Playoff Elione Ligua Beit',
  149: "Playoff Ta'hton Ligua Beit",
}

// Saison SportsPress déjà couverte par l'import Fédération pour cette ligue (Liga Alef Sud 2025/26)
export const WP_SKIP = { season: 164, league: 160 }
