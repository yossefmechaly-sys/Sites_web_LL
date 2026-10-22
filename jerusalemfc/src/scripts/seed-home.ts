// Remplit la page d'accueil (global « home ») avec le contenu repris de l'ancien site.
// Ne fait rien si l'accueil a déjà du contenu : les modifications faites dans l'admin sont préservées.
// Usage : npm run seed:home

import path from 'node:path'

import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })

const existing = await payload.findGlobal({ slug: 'home', locale: 'he', depth: 0 })
if (existing.hero?.slides?.length) {
  payload.logger.info('Accueil déjà rempli : rien à faire.')
  process.exit(0)
}

// Images de public/images importées une seule fois dans la médiathèque
const mediaIds = new Map<string, number>()
async function media(file: string, alt: string): Promise<number> {
  if (mediaIds.has(file)) return mediaIds.get(file)!
  const found = await payload.find({ collection: 'media', where: { filename: { equals: file } }, limit: 1 })
  const id =
    found.docs[0]?.id ??
    (await payload.create({ collection: 'media', data: { alt }, filePath: path.resolve('public/images', file) })).id
  mediaIds.set(file, id)
  return id
}

const img = {
  hero1: await media('hero-1.jpg', 'Jerusalem FC'),
  hero2: await media('hero-2.jpg', 'Jerusalem FC'),
  songs: await media('chants.jpg', 'שירי הקבוצה'),
  torah: await media('torah-foot.jpg', 'תורה וכדורגל'),
  vision: await media('vision.jpg', 'החזון שלנו'),
  cta: await media('supporteurs.jpg', 'Supporters'),
  shop: await media('maillots.jpg', 'Maillots Jerusalem FC'),
  club1: await media('club-1.jpg', 'Jerusalem FC'),
  club2: await media('club-2.jpg', 'Jerusalem FC'),
  players: await media('joueurs.png', 'השחקנים'),
  staff: await media('staff.png', 'הסגל'),
}
const partners = [
  { name: 'Optical Center', logo: await media('partenaire-optical-center.png', 'Optical Center'), width: 80 },
  { name: 'Third Temple', logo: await media('partenaire-third-temple.png', 'Third Temple'), width: 150 },
  { name: 'Kikar HaMusica', logo: await media('partenaire-kikar.jpg', 'Kikar HaMusica'), width: 120 },
  { name: 'Hebrew Music Museum', logo: await media('partenaire-musee-musique.jpg', 'Hebrew Music Museum'), width: 150 },
]
const gallery = []
for (let i = 1; i <= 8; i++) gallery.push({ image: await media(`galerie-${i}.jpg`, 'Jerusalem FC') })

const videos = [
  { youtubeId: 'aaiHSJduqCM', title: 'שיר של מ.כ. ירושלים' },
  { youtubeId: '_9atxI8jmF8', title: 'שיר חדש של מ.כ. ירושלים' },
  { youtubeId: 'OQuxwiHz96M', title: 'נותנים לב למועדון' },
]

// Hébreu (langue par défaut) : contient aussi les champs communs aux deux langues
await payload.updateGlobal({
  slug: 'home',
  locale: 'he',
  data: {
    hero: { slides: [{ image: img.hero1 }, { image: img.hero2 }] },
    results: { kicker: 'התוצאות', title: '' },
    behind: {
      kicker: 'מאחורי הקלעים',
      title: 'המועדון',
      joinLabel: 'הצטרף למועדון האוהדים',
      joinSub: 'עקבו אחר כל המשחקים',
      cards: [
        { title: 'שירי הקבוצה', sub: 'השירים של האוהדים', image: img.songs, link: 'songs' },
        { title: 'תורה וכדורגל', sub: 'הדברי תורה של השחקנים', image: img.torah, link: 'torah' },
        { title: 'החזון שלנו', sub: 'הערכים והחזון שלנו', image: img.vision, link: 'club' },
      ],
    },
    story: {
      title: 'הקבוצה',
      // Ordre de l'ancien site : le dernier paragraphe est le plus proche du logo
      columns: [
        {
          text: 'ברצוננו להפיץ באמצעות הספורט המפורסם ביותר בעולם על פני כדור הארץ תמונה יפה של ירושלים. ההתנהגות שלנו על המגרש במהלך האימונים והמשחקים, התקשורת בינינו וההחלטות שלנו יעידו על הערכים שלנו.',
        },
        {
          text: 'כדורגל הפך לספורט הכי פופולרי בעולם. הוא מושך אליו צעירים, בנים ובנות בכל העולם. המשחק, האסטרטגיה, המסגרת, והביצועים הפיזיים וטכניים הפכו לתשוקה משותפת של מיליוני בני אדם.',
        },
        {
          text: 'מטרת המועדון כדורגל ירושלים הינו לבנות קבוצות מנצחות שיתנהגו לפי חוקי ומצוות התורה. הערכים הללו יועברו בתוך המועדון לפני ואחרי כל אימון וכל משחק. הם יהיו מקור ההצלחה שלנו.',
        },
      ],
    },
    cta: { title: 'לא מפחד מדרך ארוכה', button: 'הצטרף למועדון האוהדים', background: img.cta },
    shop: {
      kicker: 'החנות',
      title: 'חולצות של הקבוצה',
      items: [{ text: 'מספר גדלים זמינים' }, { text: 'צבעים שונים' }],
      button: 'להזמנות',
      image: img.shop,
    },
    club: {
      kicker: 'המועדון',
      title: 'החזון שלנו',
      cards: [
        { title: 'האמנה', image: img.club2, link: 'club' },
        { title: 'החזון שלנו', image: img.club1, link: 'club' },
      ],
    },
    team: {
      kicker: 'מ.כ. ירושלים',
      title: 'הקבוצה',
      playersLabel: 'השחקנים',
      playersImage: img.players,
      staffLabel: 'הסגל',
      staffImage: img.staff,
    },
    videos: { kicker: 'מ.כ. ירושלים', title: 'תורה וכדורגל', items: videos },
    partners: { title: 'השותפים שלנו', logos: partners },
    newsletter: {
      title: 'עקבו אחרינו',
      sub: 'קבלו את כל החדשות של הקבוצה במייל',
      button: 'לשלוח',
      success: 'תודה! נרשמת בהצלחה.',
    },
    gallery: { images: gallery },
  },
})

// Français : seuls les champs traduits
await payload.updateGlobal({
  slug: 'home',
  locale: 'fr',
  data: {
    results: { kicker: 'les résultats', title: 'Saison en cours' },
    behind: {
      kicker: 'les coulisses',
      title: 'La vie du club',
      joinLabel: 'Devenir supporter',
      joinSub: 'Soutenez le Club et suivez tous les matchs',
      cards: [
        { title: 'Chants', sub: 'Les chansons du club', image: img.songs, link: 'songs' },
        { title: 'Torah et foot', sub: 'Les paroles de Torah des joueurs du JFC', image: img.torah, link: 'torah' },
        { title: 'Vision', sub: 'Emblème, couleurs et valeurs du club', image: img.vision, link: 'club' },
      ],
    },
    story: {
      title: "L'histoire",
      columns: [
        {
          text: 'Le Jerusalem Football Club a pour objectif de construire des équipes gagnantes qui se comporteront suivant les lois de la Torah. Ces valeurs seront transmises au sein du club avant et après chaque entrainement et chaque match. Elles seront l’essence même de notre réussite.',
        },
        {
          text: 'Le Football est devenu le sport le plus suivi dans le monde. Il attise de plus en plus les jeunes, garçons et filles dans tous les pays. Le jeu, la stratégie, la structure, les performances physiques et techniques sont devenus une passion partagée par des millions d’humains.',
        },
        {
          text: 'Ainsi, nous souhaitons diffuser la meilleure image de Jerusalem à travers le sport le plus médiatisé de la planète. Notre comportement sur le terrain, notre communication et nos décisions porteront le témoignage de nos valeurs.',
        },
      ],
    },
    cta: { title: 'Aller plus loin ensemble', button: 'Adhérer au Jerusalem Football Club' },
    shop: {
      kicker: 'la boutique',
      title: 'Maillot officiel',
      items: [
        { text: 'Nom et numéro personnalisables' },
        { text: 'Plusieurs tailles disponibles' },
        { text: 'Deux couleurs' },
      ],
      button: 'Commander',
    },
    club: {
      kicker: 'le club',
      title: 'Histoire du Jerusalem FC',
      cards: [
        {
          title: 'Vision et valeurs',
          text: 'Notre but est d’avancer doucement mais surement, tout en nous surpassant sur le terrain à chaque entrainement et à chaque match pour la joie des joueurs, des familles et des supporters.',
          image: img.club2,
          link: 'club',
        },
        {
          title: "L'emblème du club",
          text: 'Le Blanc, le Bleu, L’étoile de David, La couronne, Le laurier, le Ballon de Foot, la Torah et le Dere’h Erets',
          image: img.club1,
          link: 'club',
        },
      ],
    },
    team: { kicker: 'composition de', title: "L'équipe", playersLabel: 'Les joueurs', staffLabel: 'Le staff' },
    videos: { kicker: 'musique', title: 'Chants & slogans', items: videos },
    partners: { title: 'Les partenaires du club' },
    newsletter: {
      title: 'Suivez le club',
      sub: 'Recevez les dernières actualités du Jerusalem Football Club et suivez les résultats.',
      button: "S'inscrire",
      success: 'Merci ! Votre inscription est enregistrée.',
    },
  },
})

payload.logger.info(`Accueil rempli (${mediaIds.size} images importées dans la médiathèque).`)
process.exit(0)
