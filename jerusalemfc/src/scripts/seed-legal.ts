// Remplit la page « Mentions légales » (éditeur : Tobeweb, hébergeur : AWS). Ne fait rien si elle a déjà du contenu.
// Usage : npm run seed:legal

import { getPayload } from 'payload'
import config from '@payload-config'

const payload = await getPayload({ config })

const existing = await payload.findGlobal({ slug: 'legal-page', locale: 'he', depth: 0 })
if (existing.sections?.length) {
  payload.logger.info('Mentions légales déjà remplies : rien à faire.')
  process.exit(0)
}

const FR = [
  {
    heading: 'Éditeur du site',
    body: [
      'Le site jerusalemfc.co.il est le site officiel du club de football Jerusalem Football Club (מ.כ. ירושלים).',
      'Il est édité et réalisé par TOBEWEB, Hillel 12, Jérusalem, Israël.\nDirecteur de la publication : Franck Kahloun.\nContact : contact@tobeweb.eu – 02 500 26 14.',
    ].join('\n\n'),
  },
  {
    heading: 'Hébergement',
    body: 'Le site est hébergé par Amazon Web Services, Inc., 410 Terry Avenue North, Seattle, WA 98109-5210, États-Unis (aws.amazon.com).',
  },
  {
    heading: 'Propriété intellectuelle',
    body: [
      'Les contenus du site (textes, photos, vidéos, logo et emblème du club) appartiennent au Jerusalem Football Club ou à leurs auteurs. Toute reproduction ou réutilisation, totale ou partielle, sans autorisation préalable est interdite.',
      'Les résultats et calendriers des matchs proviennent des informations publiques de la Fédération israélienne de football.',
    ].join('\n\n'),
  },
  {
    heading: 'Données personnelles',
    body: [
      'Les formulaires du site (newsletter, adhésion, précommande) recueillent uniquement les informations nécessaires à votre demande : nom, adresse email, téléphone et détail de la commande. Elles sont utilisées par le club pour traiter votre demande et, si vous vous êtes inscrit, vous envoyer ses actualités. Elles ne sont ni vendues ni cédées à des tiers.',
      'Les données sont conservées le temps nécessaire au traitement de votre demande, et jusqu’à votre désinscription pour la newsletter.',
      'Conformément à la loi israélienne sur la protection de la vie privée et au Règlement général sur la protection des données (RGPD), vous disposez d’un droit d’accès, de rectification, de suppression et d’opposition. Pour l’exercer, écrivez à contact@tobeweb.eu.',
    ].join('\n\n'),
  },
  {
    heading: 'Cookies',
    body: [
      'Le site dépose un cookie technique (« jfc_consent ») qui mémorise votre choix pendant 6 mois, ainsi qu’un cookie de session réservé aux administrateurs du site.',
      'Avec votre accord uniquement, le site utilise Google Analytics pour mesurer sa fréquentation (cookies « _ga », conservés 13 mois au plus).',
      'Les vidéos YouTube ne sont chargées que lorsque vous cliquez dessus ; YouTube peut alors déposer ses propres cookies.',
      'Vous pouvez modifier votre choix à tout moment avec le lien « Cookies » en bas de chaque page.',
    ].join('\n\n'),
  },
]

const HE = [
  {
    heading: 'מפעיל האתר',
    body: [
      'האתר jerusalemfc.co.il הוא האתר הרשמי של מועדון הכדורגל מ.כ. ירושלים (Jerusalem Football Club).',
      'האתר הוקם ומופעל על ידי TOBEWEB, הלל 12, ירושלים.\nאחראי על התוכן: Franck Kahloun.\nיצירת קשר: contact@tobeweb.eu – 02-500-26-14.',
    ].join('\n\n'),
  },
  {
    heading: 'אחסון',
    body: 'האתר מאוחסן על ידי Amazon Web Services, Inc., 410 Terry Avenue North, Seattle, WA 98109-5210, ארצות הברית (aws.amazon.com).',
  },
  {
    heading: 'קניין רוחני',
    body: [
      'התכנים באתר (טקסטים, תמונות, סרטונים, הלוגו וסמל המועדון) שייכים למ.כ. ירושלים או ליוצריהם. אין להעתיק או לעשות בהם שימוש, באופן מלא או חלקי, ללא אישור מראש.',
      'תוצאות ולוחות המשחקים מבוססים על המידע הציבורי של ההתאחדות לכדורגל בישראל.',
    ].join('\n\n'),
  },
  {
    heading: 'מידע אישי',
    body: [
      'הטפסים באתר (ניוזלטר, הצטרפות, הזמנה מוקדמת) אוספים רק את המידע הדרוש לטיפול בפנייה: שם, אימייל, טלפון ופרטי ההזמנה. המועדון משתמש במידע כדי לטפל בפנייתכם, ואם נרשמתם, כדי לשלוח לכם עדכונים. המידע אינו נמכר ואינו מועבר לצדדים שלישיים.',
      'המידע נשמר למשך הזמן הדרוש לטיפול בפנייה, ובניוזלטר עד להסרתכם מהרשימה.',
      'בהתאם לחוק הגנת הפרטיות ולתקנות הגנת המידע האירופיות (GDPR), זכותכם לעיין במידע, לתקן אותו, למחוק אותו או להתנגד לשימוש בו. לפניות: contact@tobeweb.eu.',
    ].join('\n\n'),
  },
  {
    heading: 'עוגיות (Cookies)',
    body: [
      'האתר שומר עוגייה טכנית (‎"jfc_consent"‎) שזוכרת את בחירתכם למשך 6 חודשים, וכן עוגיית התחברות המיועדת למנהלי האתר בלבד.',
      'רק בהסכמתכם, האתר משתמש ב-Google Analytics כדי למדוד את הביקורים (עוגיות "_ga", הנשמרות עד 13 חודשים).',
      'סרטוני יוטיוב נטענים רק כשלוחצים עליהם; יוטיוב עשוי אז לשמור עוגיות משלו.',
      'ניתן לשנות את הבחירה בכל עת דרך הקישור "עוגיות" בתחתית כל עמוד.',
    ].join('\n\n'),
  },
]

const updatedOn = new Date().toISOString()
await payload.updateGlobal({ slug: 'legal-page', locale: 'he', data: { title: 'מידע משפטי', updatedOn, sections: HE } })
await payload.updateGlobal({ slug: 'legal-page', locale: 'fr', data: { title: 'Mentions légales', sections: FR } })
payload.logger.info('Mentions légales remplies')
process.exit(0)
