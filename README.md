# Sites web Laurent Levy

Sources livrées et configurations de déploiement des deux sites hébergés sur le
serveur Ubuntu AWS `34.254.255.211`.

| Site | Dossier Git | Dossier sur le volume AWS |
| --- | --- | --- |
| [Jerusalem FC](https://jerusalemfc.tobedev.com) | `jerusalemfc/` | `/mnt/bigdata/jerusalemfc` |
| [Laurent Levy](https://laurent-levy.tobedev.com) | `laurentlevy/` | `/mnt/bigdata/laurentlevy` |

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

Site statique déjà compilé, en français, anglais et hébreu. Apache sert
`laurentlevy/site/` ; aucune compilation ni installation npm n'est nécessaire.
Le formulaire de contact est actuellement désactivé, par choix explicite :
l'envoi de messages reste à configurer.

Le paquet comprend aussi un exemple d'infrastructure S3/CloudFront et le code
Lambda du formulaire. Ils sont conservés comme sources de livraison et **ne sont
pas l'architecture actuellement déployée** sur ce serveur Ubuntu.
L'archive ne fournit pas le projet Astro source ayant généré les pages ; les fichiers
HTML/CSS/JS compilés livrés sont ceux versionnés ici.

## Déploiement et données

Les configurations correspondant à l'hébergement actuel sont dans
[`deployment/README.md`](deployment/README.md). Elles complètent les documents
d'origine, qui peuvent mentionner les anciens domaines ou une autre architecture.

Les secrets `.env`, clés SSH/TLS, identifiants administrateur, bases SQLite,
sauvegardes et dépendances installées sont exclus. Le push Git ne déploie pas
automatiquement les sites et ne constitue pas une sauvegarde des données CMS.

Ce premier import provient des archives fournies et des configurations préparées
pendant la mise en ligne. Il ne prétend pas capturer d'éventuelles modifications
ultérieures effectuées directement sur le serveur.
