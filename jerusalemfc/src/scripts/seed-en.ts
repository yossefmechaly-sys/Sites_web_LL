// Contenu anglais (traduit du français). Les images des listes reprennent celles de la version française.
// Ne remplace jamais un contenu anglais déjà saisi. Le contenu anglais absent s'affiche en français.
// Usage : npm run seed:en

import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })
const rel = (v: unknown) => (v && typeof v === 'object' ? (v as { id: number }).id : (v as number | null))

// --- Accueil
const homeEn = await payload.findGlobal({ slug: 'home', locale: 'en', fallbackLocale: false, depth: 0 })
if (!homeEn.behind?.title) {
  const fr = await payload.findGlobal({ slug: 'home', locale: 'fr', depth: 0 })
  const cards = fr.behind?.cards ?? []
  const clubCards = fr.club?.cards ?? []
  await payload.updateGlobal({
    slug: 'home',
    locale: 'en',
    data: {
      results: { kicker: 'results', title: 'Current season' },
      behind: {
        kicker: 'behind the scenes',
        title: 'Club life',
        joinLabel: 'Become a supporter',
        joinSub: 'Support the club and follow every match',
        cards: [
          { title: 'Songs', sub: 'The club’s songs', image: rel(cards[0]?.image), link: 'songs' },
          { title: 'Torah & football', sub: 'Words of Torah from JFC players', image: rel(cards[1]?.image), link: 'torah' },
          { title: 'Vision', sub: 'Emblem, colours and values of the club', image: rel(cards[2]?.image), link: 'club' },
        ],
      },
      story: {
        title: 'Our story',
        columns: [
          {
            text: 'Jerusalem Football Club aims to build winning teams that live by the laws of the Torah. These values are passed on within the club before and after every training session and every match. They are the very essence of our success.',
          },
          {
            text: 'Football has become the most followed sport in the world. It attracts more and more young people, boys and girls, in every country. The game, the strategy, the structure, the physical and technical performance have become a passion shared by millions.',
          },
          {
            text: 'We therefore want to share the best image of Jerusalem through the most popular sport on the planet. Our behaviour on the pitch, our communication and our decisions bear witness to our values.',
          },
        ],
      },
      cta: { title: 'Going further together', button: 'Join Jerusalem Football Club' },
      shop: {
        kicker: 'the shop',
        title: 'Official shirt',
        items: [{ text: 'Name and number can be personalised' }, { text: 'Several sizes available' }, { text: 'Two colours' }],
        button: 'Order',
      },
      club: {
        kicker: 'the club',
        title: 'The story of Jerusalem FC',
        cards: [
          {
            title: 'Vision and values',
            text: 'Our goal is to move forward slowly but surely, pushing ourselves on the pitch at every training session and every match, for the joy of players, families and supporters.',
            image: rel(clubCards[0]?.image),
            link: 'club',
          },
          {
            title: 'The club emblem',
            text: 'White, blue, the Star of David, the crown, the laurel, the football, the Torah and Derech Eretz.',
            image: rel(clubCards[1]?.image),
            link: 'club',
          },
        ],
      },
      team: { kicker: 'line-up', title: 'The team', playersLabel: 'The players', staffLabel: 'The staff' },
      videos: { kicker: 'music', title: 'Songs & chants', items: (fr.videos?.items ?? []).map((v) => ({ youtubeId: v.youtubeId, title: v.title })) },
      partners: { title: 'Club partners' },
      newsletter: {
        title: 'Follow the club',
        sub: 'Get the latest Jerusalem Football Club news and results.',
        button: 'Subscribe',
        success: 'Thank you! You are now subscribed.',
      },
    },
  })
  payload.logger.info('Accueil : anglais rempli')
}

// --- Le club
const clubEn = await payload.findGlobal({ slug: 'club-page', locale: 'en', fallbackLocale: false, depth: 0 })
if (!clubEn.emblems?.items?.length) {
  await payload.updateGlobal({
    slug: 'club-page',
    locale: 'en',
    data: {
      emblems: {
        kicker: 'discover',
        title: 'The emblems',
        items: [
          { title: 'White', text: 'Like the purity and holiness of Jerusalem.' },
          { title: 'Blue', text: 'Like the blue thread of the tallit, which reminds us of the mitzvot.' },
          { title: 'The Star of David', text: 'Like the flag of the State of Israel, the shield of King David.' },
          {
            title: 'The crown',
            text: 'It represents the kingship of Jerusalem, inspired by its founder King David. It is also the jewel called “Yerushalayim shel zahav” worn by Rabbi Akiva’s wife, a golden crown representing the walls of Jerusalem.',
          },
          { title: 'The laurel', text: 'A plant, recalling our bond with the pitch and with nature. A symbol of peace and victory.' },
          { title: 'The football', text: 'What unites us and makes us vibrate. It remains the central, unifying element of our logo.' },
        ],
      },
      vision: {
        kicker: 'going further',
        title: 'Our vision',
        text: [
          'Jerusalem Football Club aims to build winning teams that live by the laws of the Torah. These values are passed on within the club before and after every training session and every match. They are the very essence of our success.',
          'Football has become the most followed sport in the world. It attracts more and more young people, boys and girls, in every country. The game, the strategy, the structure, the physical and technical performance have become a passion shared by millions.',
          'We therefore want to share the best image of Jerusalem through the most popular sport on the planet. Our behaviour on the pitch, our communication and our decisions bear witness to our values.',
          'Our goal is to move forward slowly but surely, pushing ourselves on the pitch at every training session and every match, for the joy of players, families and supporters. We will train tomorrow’s players within the club and, over time, recruit players to keep strengthening our team.',
        ].join('\n\n'),
        button: 'See the standings',
      },
      charter: {
        kicker: 'read',
        title: 'The charter',
        items: [
          'We respect every human being, whatever their differences, religious or ideological background.',
          'Before every training session and every match, a 5-minute Torah lesson is given to the players of all teams. At the end of each session, in the dressing room, the coach links the lesson to what happened on the pitch. This sets us apart from other teams and guarantees the values passed on to players and supporters.',
          'Jerusalem FC members share a taste for effort, commitment, surpassing themselves and the will to win.',
          'A healthy lifestyle and respect for one’s own body are essential to give one’s best for the team. We tolerate no misconduct and educate our players in harmony with the club’s values.',
          'Collective trust, team unity and group cohesion always come before personal interest.',
          'Loyalty to Jerusalem FC is an essential condition for the club’s durability and progress.',
          'Anger, pride, arrogance and selfishness are not part of our club’s values. Any harmful behaviour is severely punished, up to exclusion from the club.',
          'Jerusalem FC helps share a beautiful image of Jerusalem, city of peace and capital of the State of Israel.',
          'The management and staff are tasked with helping players develop their human potential as well as their physical and mental abilities.',
          'Despite all our efforts, courage and professionalism, results depend on God, creator of humanity. Let us stay humble whatever the results, learn from our mistakes and pray that our unity remains strong.',
        ].map((text) => ({ text })),
      },
    },
  })
  payload.logger.info('Le club : anglais rempli')
}

// --- Chants et Torah
const songsFr = await payload.findGlobal({ slug: 'songs-page', locale: 'fr', depth: 0 })
const songsEn = await payload.findGlobal({ slug: 'songs-page', locale: 'en', fallbackLocale: false, depth: 0 })
if (!songsEn.title) {
  await payload.updateGlobal({
    slug: 'songs-page',
    locale: 'en',
    data: {
      kicker: 'JFC in songs',
      title: 'Songs & chants',
      intro:
        'Sport is above all about joy, good spirits and relaxation. Music is at the heart of Jerusalem Football Club before and after every match. Listen to and share the JFC songs.',
      videos: (songsFr.videos ?? []).map((v) => ({ youtubeId: v.youtubeId })),
      channelLabel: 'Follow the club on YouTube',
    },
  })
  payload.logger.info('Chants : anglais rempli')
}
const torahEn = await payload.findGlobal({ slug: 'torah-page', locale: 'en', fallbackLocale: false, depth: 0 })
if (!torahEn.title) {
  await payload.updateGlobal({
    slug: 'torah-page',
    locale: 'en',
    data: {
      kicker: 'JFC from above',
      title: 'Torah & football',
      intro: 'The Torah is the source of inspiration that accompanies the whole Jerusalem Football Club team at every match.',
      videos: [
        { youtubeId: 'e4iQmM9uptY', caption: 'A Jewish story: kugel, strudel and football' },
        { youtubeId: 'bj3790FJvLQ', caption: 'Being famous while keeping Shabbat and the mitzvot' },
        { youtubeId: 'rBCsJZAWO0Y', caption: 'Football in Israel or football abroad: the same thing?' },
      ],
    },
  })
  payload.logger.info('Torah : anglais rempli')
}

// --- Mentions légales
const legalEn = await payload.findGlobal({ slug: 'legal-page', locale: 'en', fallbackLocale: false, depth: 0 })
if (!legalEn.sections?.length) {
  await payload.updateGlobal({
    slug: 'legal-page',
    locale: 'en',
    data: {
      title: 'Legal notice',
      sections: [
        {
          heading: 'Website publisher',
          body: 'jerusalemfc.co.il is the official website of Jerusalem Football Club (מ.כ. ירושלים).\n\nIt is published and built by TOBEWEB, Hillel 12, Jerusalem, Israel.\nPublication director: Franck Kahloun.\nContact: contact@tobeweb.eu – +972 2 500 26 14.',
        },
        {
          heading: 'Hosting',
          body: 'The website is hosted by Amazon Web Services, Inc., 410 Terry Avenue North, Seattle, WA 98109-5210, USA (aws.amazon.com).',
        },
        {
          heading: 'Intellectual property',
          body: 'The website content (texts, photos, videos, club logo and emblem) belongs to Jerusalem Football Club or to its authors. Any full or partial reproduction or reuse without prior permission is prohibited.\n\nMatch results and fixtures come from the public information of the Israel Football Association.',
        },
        {
          heading: 'Personal data',
          body: 'The website forms (newsletter, membership, pre-order) only collect the information needed for your request: name, email address, phone number and order details. The club uses it to handle your request and, if you subscribed, to send you its news. It is never sold or passed on to third parties.\n\nData is kept for as long as needed to handle your request, and until you unsubscribe for the newsletter.\n\nUnder the Israeli Privacy Protection Law and the EU General Data Protection Regulation (GDPR), you have the right to access, correct, delete and object to the use of your data. To exercise it, write to contact@tobeweb.eu.',
        },
        {
          heading: 'Cookies',
          body: 'The website sets a technical cookie (“jfc_consent”) that remembers your choice for 6 months, as well as a session cookie reserved for the site administrators.\n\nOnly with your consent, the website uses Google Analytics to measure its traffic (“_ga” cookies, kept for 13 months at most).\n\nYouTube videos are only loaded when you click on them; YouTube may then set its own cookies.\n\nYou can change your choice at any time with the “Cookies” link at the bottom of every page.',
        },
      ],
    },
  })
  payload.logger.info('Mentions légales : anglais rempli')
}

// --- Fonctions du staff
const ROLES: Record<string, string> = {
  'le président': 'President',
  'directeur général': 'General manager',
  entraineur: 'Head coach',
  'entraîneur adjoint': 'Assistant coach',
  'coach sportif': 'Fitness coach',
  'responsable logistique': 'Logistics manager',
  'entraineur gardien': 'Goalkeeping coach',
  'préparateur physique': 'Physical trainer',
  magasinier: 'Kit manager',
}
const staffFr = await payload.find({ collection: 'staff', locale: 'fr', limit: 0, pagination: false, depth: 0 })
for (const s of staffFr.docs) {
  const en = await payload.findByID({ collection: 'staff', id: s.id, locale: 'en', fallbackLocale: false, depth: 0 })
  if (en.role) continue
  await payload.update({ collection: 'staff', id: s.id, locale: 'en', data: { name: s.name, role: ROLES[s.role] ?? s.role } })
}

// --- Produits
const PRODUCTS: Record<string, { name: string; description?: string }> = {
  'Maillot domicile': { name: 'Home shirt', description: 'Official club shirt for home matches, 100% cotton.' },
  'Maillot extérieur': { name: 'Away shirt', description: 'Official club shirt for away matches, 100% cotton.' },
  Ballon: { name: 'Ball' },
  Echarpe: { name: 'Scarf' },
  Veste: { name: 'Jacket' },
}
const productsFr = await payload.find({ collection: 'products', locale: 'fr', limit: 0, pagination: false, depth: 0 })
for (const p of productsFr.docs) {
  const en = await payload.findByID({ collection: 'products', id: p.id, locale: 'en', fallbackLocale: false, depth: 0 })
  if (en.name || !PRODUCTS[p.name]) continue
  await payload.update({ collection: 'products', id: p.id, locale: 'en', data: PRODUCTS[p.name] })
}

// --- Noms des ligues
const seasonsFr = await payload.find({ collection: 'seasons', locale: 'fr', limit: 0, pagination: false, depth: 0 })
for (const s of seasonsFr.docs) {
  const en = await payload.findByID({ collection: 'seasons', id: s.id, locale: 'en', fallbackLocale: false, depth: 0 })
  if (en.leagueName) continue
  const name = s.leagueName
    .replace("Coupe d'Israel", 'Israel State Cup')
    .replace(/Ligua/g, 'Liga')
    .replace('Aleph', 'Alef')
    .replace(/Sud/g, 'South')
    .replace('South Beit', 'South B')
    .replace('South Aleph', 'South A')
    .replace("Ta'hton", 'lower')
    .replace('Elione', 'upper')
  await payload.update({ collection: 'seasons', id: s.id, locale: 'en', data: { leagueName: name } })
}

payload.logger.info('Contenu anglais : terminé')
process.exit(0)
