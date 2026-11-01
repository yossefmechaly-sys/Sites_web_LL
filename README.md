# Sites web Laurent Levy

Sources livrées et configurations de déploiement des sites hébergés sur le
serveur Ubuntu AWS `34.254.255.211`.

| Site | Dossier Git | Dossier sur le volume AWS |
| --- | --- | --- |
| [Jerusalem FC](https://jerusalemfc.tobedev.com) | `jerusalemfc/` | `/mnt/bigdata/jerusalemfc` |
| [Laurent Levy](https://laurent-levy.com) | `laurentlevy/` | `/mnt/bigdata/laurentlevy/site-prod` |
| [Les Sept Clés — français](https://les7cles.tobedev.com) | `les7cles/fr/` | `/mnt/bigdata/les7cles/fr` |
| [Les Sept Clés — anglais](https://thesevenkeystosucceed.tobedev.com) | `les7cles/en/` | `/mnt/bigdata/les7cles/en` |
| [Les Sept Clés — hébreu](https://xn-----xldnbaepd2cbs3c5a9azbtec.tobedev.com) | `les7cles/he/` | `/mnt/bigdata/les7cles/he` |

## Jerusalem FC

Application Next.js 16 / Payload 3, avec SQLite et administration `/admin`.
Le code, le verrou npm, les fichiers publics et les images de la livraison initiale
sont versionnés. Les images initiales de `jerusalemfc/media/` ont été ajoutées
explicitement ; le `.gitignore` du projet continue d'exclure les nouveaux médias
téléversés par le CMS.

Pour préparer un développement local : Node 22 ou version compatible, puis depuis
`jerusalemfc/`, exécuter `npm ci --legacy-peer-deps`, créer un `.env` local à partir de
`.env.example` et renseigner les secrets hors de Git. Voir le README du projet.
Pour retrouver les contenus du CMS, restaurer une copie autorisée de la base et des
médias depuis les sauvegardes du serveur ; **la base n'est pas dans ce dépôt**.
Utiliser une base isolée pour les tests, jamais la base de production.

## Laurent Levy

Site en production sur `https://laurent-levy.com/`, en français, anglais et hébreu.
Apache sert `/mnt/bigdata/laurentlevy/site-prod`. Le domaine `www` et les pages
de l'ancien domaine `laurent-levy.tobedev.com` redirigent vers le domaine nu.
Les chemins et paramètres sont conservés, y compris pour les adresses hébraïques.

Le collègue a configuré le formulaire avec PHP 8.5-FPM : `/api/contact` utilise
`api/contact.php`, avec les identifiants d'e-mail hors du site dans
`/etc/laurent-levy/contact.ini`. Ces fichiers et paramètres ont été préservés
lors de la bascule du 1 novembre 2026. Les identifiants ne doivent pas être
versionnés. La configuration déployée est décrite dans
[`deployment/laurentlevy/README.md`](deployment/laurentlevy/README.md).

Les fichiers actuels de `laurentlevy/site/`, `laurentlevy/site-prod/` et les
configurations Apache ont été importés depuis l'export du serveur du
1 novembre 2026. Les 2 668 fichiers du manifeste ont été vérifiés par SHA256,
y compris les scripts PHP du collègue. Le dépôt conserve aussi les copies
historiques présentes dans cet export ; les dossiers `site-avant-*`,
`backups-formulaire-*` et `vhost-avant-*` ne sont pas les versions actives.

Le paquet comprend aussi un exemple d'infrastructure S3/CloudFront et le code
Lambda du formulaire. Ils sont conservés comme sources de livraison et **ne sont
pas l'architecture actuellement déployée** sur ce serveur Ubuntu.
Les archives et l'export reçus contiennent les fichiers HTML/CSS/JS compilés et
le PHP déployé ; le projet Astro source ayant généré ces pages n'était pas fourni.

## Les Sept Clés pour Réussir

Trois sites statiques déjà compilés, avec une racine Apache par langue. Les
269 fichiers de la livraison sont conservés dans `les7cles/`, y compris les
images, polices, scripts, `.htaccess`, `contact.php` et documents d'origine.
Le projet Astro source mentionné dans ces documents n'était pas joint à l'archive.
Aucune installation npm ni compilation n'est nécessaire pour servir ces fichiers.

Les adresses `tobedev.com` sont des domaines de développement. Apache adapte les
URL définitives encore présentes dans la livraison pour que les sélecteurs de
langue, métadonnées et sitemaps utilisent ces domaines de développement. Il
envoie aussi `X-Robots-Tag: noindex, nofollow`. Les formulaires sont désactivés
jusqu'au passage sur les domaines de production : les scripts PHP livrés
contiennent un destinataire fictif et aucun service d'envoi n'a été configuré.
Voir [`deployment/les7cles/README.md`](deployment/les7cles/README.md).

## Déploiement et données

Les configurations correspondant à l'hébergement actuel sont dans
[`deployment/README.md`](deployment/README.md). Elles complètent les documents
d'origine, qui peuvent mentionner les anciens domaines ou une autre architecture.

Les secrets `.env`, clés SSH/TLS, identifiants administrateur, bases SQLite,
sauvegardes et dépendances installées sont exclus. Le push Git ne déploie pas
automatiquement les sites et ne constitue pas une sauvegarde des données CMS.

Les imports proviennent des archives fournies et des configurations préparées
pendant la mise en ligne. Ils ne prétendent pas capturer d'éventuelles modifications
ultérieures effectuées directement sur le serveur.
