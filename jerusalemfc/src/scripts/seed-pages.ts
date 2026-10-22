// Remplit les pages « Le club », « Chants » et « Torah & foot » avec le contenu repris de l'ancien site.
// Une page déjà remplie n'est pas modifiée (les changements faits dans l'admin sont préservés).
// Usage : npm run seed:pages

import path from 'node:path'

import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })

async function media(file: string, alt: string): Promise<number> {
  const found = await payload.find({ collection: 'media', where: { filename: { equals: file } }, limit: 1 })
  return (
    found.docs[0]?.id ??
    (await payload.create({ collection: 'media', data: { alt }, filePath: path.resolve('public/images', file) })).id
  )
}

// --- Le club
const club = await payload.findGlobal({ slug: 'club-page', locale: 'he', depth: 0 })
if (!club.emblems?.items?.length) {
  await payload.updateGlobal({
    slug: 'club-page',
    locale: 'he',
    data: {
      emblems: {
        kicker: 'לגלות',
        title: 'הסמלים',
        image: await media('club-montage.jpg', 'Jerusalem FC'),
        items: [
          { title: 'לבן', text: 'כמו הטהרה והקדושה של ירושלים' },
          { title: 'כחול', text: 'כמו חוט התכלת של הטלית שמזכיר לנו את המצוות' },
          { title: 'מגן דוד', text: 'כמו דגל ישראל, המגן של דוד המלך' },
          {
            title: 'הכתר',
            text: 'הוא מייצג את מלכות ירושלים, בהשראת מייסד, דוד המלך. זהו גם התכשיט הנקרא “ירושלים של זהב”, אשר אשתו של רבי עקיבא הייתה עונדת, כתר זהב המייצג את חומות ירושלים',
          },
          { title: 'הדפנה', text: 'הצמח, כדי להזכיר את היחס שלנו עם האדמה, עם המגרש, ועם הטבע. סמל של השלום ושל הניצחון' },
          { title: 'הכדור', text: 'מה שמאחד אותנו, מה שגורם לנו לרטוט. הוא מהווה המרכיב המרכזי והמחבר של הלוגו שלנו' },
        ],
      },
      vision: {
        kicker: 'מאחורי הקלעים',
        title: 'החזון שלנו',
        text: [
          'מטרת המועדון כדורגל ירושלים הינו לבנות קבוצות מנצחות שיתנהגו לפי חוקי ומצוות התורה.',
          'הערכים הללו יועברו בתוך המועדון לפני ואחרי כל אימון וכל משחק. הם יהיו מקור ההצלחה שלנו. כדורגל הפך לספורט הכי פופולרי בעולם.',
          'הוא מושך אליו צעירים, בנים ובנות בכל העולם. המשחק, האסטרטגיה, המסגרת, והביצועים הפיזיים וטכניים הפכו לתשוקה משותפת של מיליוני בני אדם. לכן, ברצוננו להפיץ באמצעות הספורט המפורסם ביותר בעולם על פני כדור הארץ תמונה יפה של ירושלים.',
          'ההתנהגות שלנו על המגרש במהלך האימונים והמשחקים, התקשורת בינינו וההחלטות שלנו יעידו על הערכים שלנו. מטרתנו הינה להתקדם לאט אבל בטוח ולאתגר את עצמנו כל אימון וכל משחק מחדש, לשמחתם של השחקנים, של משפחתם ושל האוהדים.',
          'אנחנו נכשיר את השחקנים של מחר ועם הזמן נגייס שחקנים כדי להתחזק באופן תמידי.',
        ].join('\n\n'),
        button: 'הטבלה',
      },
      charter: {
        kicker: 'קריאה',
        title: 'האמנה',
        items: [
          'אנחנו מכבדים כל אדם ואדם, ללא תלות בדת ובאידאולוגיה שלו',
          'לפני כל אימון וכל משחק, שיעור תורה של 5 דקות יועבר לשחקנים של כלל הקבוצות. בסוף האימון, בחדר ההלבשה, המאמן יקשר בין מה שנאמר בשיעור תורה לבין מה שהתרחש על המגרש. שיעורים אלו מעידים על הערכים שמועברים לשחקנים ולאוהדים',
          'לכל חברי המועדון יש כוח רצון, הם אוהבים להתאמץ, לאתגר את עצמם והם רוצים לנצח',
          'אורך החיים והכבוד העצמי הינם נכסים חיוניים כדי לתת את המיטב לטובת הקבוצה. אנחנו לא נאפשר התנהגות שאינה ראויה וברצוננו ליצור אווירה הרמונית סביב הערכים שלנו',
          'האמונה בין השחקנים, שיתוף הפעולה והאיחוד ביניהם תמיד יעברו לפני האינטרסים של כל אחד',
          'נאמנות של השחקנים כלפי המועדון הינו תנאי הכרחי לניצחונה ושלומה של המ.כ. ירושלים',
          'כעס, גאווה ואנוכיות אינם חלק מהערכים שלנו. כל התנהגות שאינה ראויה תיענש עד להדחה מהמועדון',
          'ה -Jerusalem Football Club לוקחים חלק בהפצתה של תמונה יפה וטובה של ירושלים, עיר של שלום ועיר הבירה של מדינת ישראל',
          'צוות הניהול והמאמנים אחראיים לאפשר לשחקנים לצמוח, להרחיב את הפוטנציאל שלהם ולפתח את היכולות הפיזיות והמנטליות שלהם',
          'למרות כל המאמצים, האומץ והמקצועיות שלנו, התוצאות תלויות בהקב”ה. אנחנו נשאר ענווים ללא תלות בתוצאה, נלמד מהטעויות ונתפלל כדי להישאר מאוחדים תמיד',
        ].map((text) => ({ text })),
      },
    },
  })
  await payload.updateGlobal({
    slug: 'club-page',
    locale: 'fr',
    data: {
      emblems: {
        kicker: 'découvrir',
        title: 'Les emblèmes',
        items: [
          { title: 'Blanc', text: 'Comme la pureté, la sainteté de Jérusalem' },
          { title: 'Bleu', text: 'Comme le fil d’azur du talith qui nous rappelle les mitsvot.' },
          { title: 'L’étoile de David', text: 'Comme le drapeau de l’Etat d’Israel, le bouclier du Roi David.' },
          {
            title: 'La couronne',
            text: 'Elle représente la royauté de Jérusalem, inspiré par son fondateur le Roi David. C’est également le bijou appelé « Yerushalaim chel zahav », que portait la femme de Rabbi Akiva, couronne en or qui représente les murailles de Jérusalem.',
          },
          { title: 'Le laurier', text: 'Plante, pour rappeler notre rapport au terrain et à la nature. Symbole de paix et de victoire.' },
          {
            title: 'Le ballon de football',
            text: 'Ce qui nous unit, qui nous fait vibrer. Il reste l’élément central et fédérateur de notre logo.',
          },
        ],
      },
      vision: {
        kicker: 'aller plus loin',
        title: 'Notre vision',
        text: [
          'Le Jerusalem Football Club a pour objectif de construire des équipes gagnantes qui se comporteront suivant les lois de la Torah. Ces valeurs seront transmises au sein du club avant et après chaque entrainement et chaque match. Elles seront l’essence même de notre réussite.',
          'Le Football est devenu le sport le plus suivi dans le monde. Il attise de plus en plus les jeunes, garçons et filles dans tous les pays. Le jeu, la stratégie, la structure, les performances physiques et techniques sont devenus une passion partagée par des millions d’humains.',
          'Ainsi, nous souhaitons diffuser la meilleure image de Jerusalem à travers le sport le plus médiatisé de la planète. Notre comportement sur le terrain, notre communication et nos décisions porteront le témoignage de nos valeurs.',
          'Notre but est d’avancer doucement mais surement, tout en nous surpassant sur le terrain à chaque entrainement et à chaque match pour la joie des joueurs, des familles et des supporters. Nous formerons au sein du club les joueurs de demain et nous recruterons au fil du temps des joueurs pour renforcer continuellement notre équipe.',
        ].join('\n\n'),
        button: 'Voir le classement',
      },
      charter: {
        kicker: 'lire',
        title: 'La charte',
        items: [
          'Nous respectons chaque être humain, quelque soit sa différence, son appartenance religieuse ou idéologique.',
          'Avant chaque entrainement et chaque match un cours de torah de 5 minutes est transmis aux joueurs de toutes les équipes. A la fin de chaque entrainement, dans les vestiaires l’entraineur fait une synthèse entre le cours précèdent et ce qui s’est passé sur le terrain. Cet élément essentiel de différentiation des autres équipes est le gage des valeurs qui sont transmises aux joueurs et aux supporters.',
          'Les membres du Jerusalem FC partagent le gout de l’effort, l’engagement, le dépassement de soi et la volonté de gagner.',
          'L’hygiène de vie et le respect de son propre corps sont des atouts indispensables pour donner le meilleur de soi pour le bien de l’équipe. Nous ne tolérons aucun débordement et faisons en sorte d’éduquer nos joueurs en harmonie avec les valeurs du club.',
          'La confiance collective, l’unité de l’équipe et la cohésion au sein du groupe passent toujours avant l’intérêt personnel.',
          'La fidélité envers le Jerusalem FC est une condition essentielle à la pérennité et à la progression du club.',
          'La colère, l’orgueil, l’arrogance et l’égoïsme ne font pas partie des valeurs de notre club. Tout comportement néfaste est sévèrement puni, pouvant aller jusqu’à l’exclusion du club.',
          'Le Jerusalem FC participe à diffuser une belle image de Jerusalem, ville de paix et capitale de l’Etat d’Israël.',
          'L’équipe dirigeante et le personnel ont pour mission de permettre aux joueurs de développer leur potentiel humain, ainsi que leurs capacités physiques et mentales.',
          'Malgré tous nos efforts, notre courage et notre professionnalisme, les résultats dépendent de D.ieu, créateur de l’humanité. Restons humble quel que soit les résultats, apprenons de nos erreurs et prions pour que notre unité reste forte.',
        ].map((text) => ({ text })),
      },
    },
  })
  payload.logger.info('Page « Le club » remplie')
}

// --- Chants
const SONGS = ['aaiHSJduqCM', '_9atxI8jmF8', '76xX25QgZ3Q', 'OCm4DvF6fK4', 'OQuxwiHz96M', 'RfnZxWaHT3M', '3Pu9cbjDh_E', 'Di1HQOG-osk']
const songs = await payload.findGlobal({ slug: 'songs-page', locale: 'he', depth: 0 })
if (!songs.videos?.length) {
  const channelUrl = 'https://www.youtube.com/channel/UCV4aRiu0KJnTTfkpKM4PO_w'
  await payload.updateGlobal({
    slug: 'songs-page',
    locale: 'he',
    data: {
      kicker: 'שירי מ.כ.ירושלים',
      title: 'שירי הקבוצה',
      videos: SONGS.map((youtubeId) => ({ youtubeId })),
      channelLabel: 'הערוץ היוטוב של הקבוצה',
      channelUrl,
    },
  })
  await payload.updateGlobal({
    slug: 'songs-page',
    locale: 'fr',
    data: {
      kicker: 'le jfc en chansons',
      title: 'Chants & slogans',
      intro:
        'Le sport est avant tout de la joie, de la bonne humeur et de la détente. La musique est au coeur du Jerusalem Football Club avant ou après un match. Ecoutez et partagez les musiques du JFC.',
      videos: SONGS.map((youtubeId) => ({ youtubeId })),
      channelLabel: 'Suivre le club sur youtube',
    },
  })
  payload.logger.info('Page « Chants » remplie')
}

// --- Torah & foot
const torah = await payload.findGlobal({ slug: 'torah-page', locale: 'he', depth: 0 })
if (!torah.videos?.length) {
  await payload.updateGlobal({
    slug: 'torah-page',
    locale: 'he',
    data: {
      kicker: 'תורה - מ.כ.ירושלים',
      title: 'תורה וכדורגל',
      intro:
        'לפני כל אימון וכל משחק, שיעור תורה של 5 דקות יועבר לשחקנים של כלל הקבוצות. בסוף האימון, בחדר ההלבשה, המאמן יקשר בין מה שנאמר בשיעור תורה לבין מה שהתרחש על המגרש. שיעורים אלו מעידים על הערכים שמועברים לשחקנים ולאוהדים',
      videos: [
        { youtubeId: 'e4iQmM9uptY', caption: 'סיפורים יהודיים – קוגל שטרודל וכדורגל' },
        { youtubeId: 'bj3790FJvLQ', caption: 'איך להיות גם שחקן או זמר וגם שומר תורה ומצוות' },
        { youtubeId: 'rBCsJZAWO0Y', caption: 'כדורגל בארץ או כדורגל בעולם , אותו דבר ?' },
      ],
    },
  })
  await payload.updateGlobal({
    slug: 'torah-page',
    locale: 'fr',
    data: {
      kicker: "le jfc d'en haut",
      title: 'Torah & foot',
      intro: 'La Torah est la source d’inspiration et accompagne toute l’équipe du Jerusalem Football Club à chaque rencontre.',
      videos: [
        { youtubeId: 'e4iQmM9uptY', caption: 'histoire juive: kougel, shtroudel et football' },
        { youtubeId: 'bj3790FJvLQ', caption: 'Etre célèbre en gardant le Shabat et les Mitsvot' },
        { youtubeId: 'rBCsJZAWO0Y', caption: 'Réflexion sur Le foot en Israël ou le foot à l’étranger' },
      ],
    },
  })
  payload.logger.info('Page « Torah & foot » remplie')
}

// --- Boutique
if ((await payload.count({ collection: 'products' })).totalDocs === 0) {
  const sizes = '12, 14, 16, 18, S, M, L, XL'
  const products = [
    {
      he: { name: 'חולצת בית', description: 'החולצה הרשמית של המועדון למשחקי הבית, 100% כותנה.' },
      fr: { name: 'Maillot domicile', description: 'Maillot officiel du Club des rencontres à domicile, 100% coton.' },
      image: 'produit-maillot-blanc.jpg', price: 200, sizes, kind: 'featured' as const,
    },
    {
      he: { name: 'חולצת חוץ', description: 'החולצה הרשמית של המועדון למשחקי החוץ, 100% כותנה.' },
      fr: { name: 'Maillot extérieur', description: "Maillot officiel du Club des rencontres à l'extérieur, 100% coton." },
      image: 'produit-maillot-bleu.jpg', price: 200, sizes, kind: 'featured' as const,
    },
    { he: { name: 'כדור' }, fr: { name: 'Ballon' }, image: 'produit-ballon.jpg', price: 60, kind: 'item' as const },
    { he: { name: 'צעיף' }, fr: { name: 'Echarpe' }, image: 'produit-echarpe.jpg', price: 70, kind: 'item' as const },
    { he: { name: 'מעיל' }, fr: { name: 'Veste' }, image: 'produit-veste.jpg', price: 600, kind: 'item' as const },
  ]
  for (const [i, p] of products.entries()) {
    const created = await payload.create({
      collection: 'products',
      locale: 'he',
      data: { ...p.he, image: await media(p.image, p.fr.name), price: p.price, sizes: p.sizes, kind: p.kind, order: (i + 1) * 10 },
    })
    await payload.update({ collection: 'products', id: created.id, locale: 'fr', data: p.fr })
  }
  payload.logger.info('Boutique remplie')
}

process.exit(0)
