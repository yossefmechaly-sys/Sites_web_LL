# Laurent Levy — production

État du serveur confirmé le 1 novembre 2026 :

| Élément | Configuration |
| --- | --- |
| Domaine principal | https://laurent-levy.com/ |
| Domaine www | Redirection 301 vers le domaine nu |
| Production | /mnt/bigdata/laurentlevy/site-prod |
| Ancien site de dev | /mnt/bigdata/laurentlevy/site |
| Pages de dev | Redirection 301 vers les mêmes chemins et paramètres en production |
| PHP | PHP8.5-FPM, socket /run/php/php8.5-fpm.sock |
| Formulaire | /api/contact vers /api/contact.php |
| Paramètres privés d'e-mail | /etc/laurent-levy/contact.ini, hors Git |

Les API et les challenges ACME du domaine de développement restent accessibles
pour préserver les intégrations et le renouvellement du certificat de dev.
Le serveur utilise le volume ext4 monté dans `/mnt/bigdata` ; le drop-in Apache
`laurentlevy-storage.conf` exprime cette dépendance.

## Fichiers du serveur versionnés

Les sept parties de l'export du 1 novembre 2026 ont été réunies et les 2 668
fichiers du manifeste ont été vérifiés par SHA256 avant import. Le projet actuel
est dans `laurentlevy/`, notamment `site-prod/`, `site/` et leurs scripts PHP.
Les configurations suivantes sont les fichiers réellement exportés du serveur :

- `apache-http.conf` : vhost de dev HTTP ;
- `apache-dev-https.conf` : vhost de dev HTTPS ;
- `apache-prod-http.conf` : vhost de production HTTP ;
- `apache-prod-https.conf` : vhost de production HTTPS ;
- `laurent-levy-rules.conf` : règles communes incluses dans le vhost SSL ;
- `apache2.service.d/laurentlevy-storage.conf` : dépendance au montage.

Le manifeste original est conservé dans
[`export-manifest.json`](export-manifest.json). Les fichiers copiés sont identiques
à ceux de l'export ; les quatre anciens noms d'actifs supprimés de `site/` ne
font plus partie de la version actuelle et restent accessibles dans l'historique
Git. Les deux scripts PHP actifs de dev et de production sont identiques.

L'export comprend aussi plusieurs copies historiques (`site-avant-*`,
`backups-formulaire-*`, `vhost-avant-*`), conservées à leurs chemins pour ne pas
perdre ces versions. Git déduplique les contenus identiques : les 153,6 Mo de
l'archive ne représentent qu'environ 23,1 Mo de contenus distincts avant
compression Git. Les fichiers actifs se trouvent uniquement dans `site/` et
`site-prod/`. Les commentaires des configurations peuvent décrire leur état de
modèle d'origine ; les directives exportées et ce document décrivent l'état réel.

L'outil [`export-github.sh`](export-github.sh) exclut les fichiers d'identifiants, `.env` privés, clés, bases, caches,
dépendances et archives de livraison/sauvegarde. Il ne lit pas le fichier
`/etc/laurent-levy/contact.ini`. Les exemples `.env.example` et `.env.sample`
peuvent être inclus ; leur contenu doit être vérifié avant le commit.
Les archives volumineuses sont découpées pour le transfert, sans perte de
fichiers sélectionnés. Les archives de sauvegarde `.tgz` et la référence
`lambda/contact.zip` figurent dans les exclusions du manifeste. La référence
Lambda déjà versionnée lors du premier import a été conservée ; sa version
actuelle sur le serveur n'est pas attestée par cet export. Aucun identifiant
d'envoi, base de données ou clé privée n'est ajouté au dépôt.

## Comportement à conserver

Le domaine nu est canonique. La racine choisit la langue du navigateur
(français, anglais ou hébreu ; français par défaut). Les anciennes URL WordPress
gardent leurs redirections, les anciens médias supprimés renvoient 410.
Les filtres Apache adaptent les URL `www` et de développement vers le domaine
nu dans les réponses HTML/XML/texte, sans modifier les fichiers du site.

Le formulaire PHP du collègue est actif et doit être conservé. Les paramètres
d'e-mail restent sur le serveur, hors de Git. Les anciennes mentions de
formulaire désactivé ou de Lambda dans les documents de livraison décrivent
l'ancien état ou une architecture de référence.

## Validation et restauration

Les 41 pages et 58 contrôles de production ont réussi, puis 13 contrôles de
finalisation : redirections, chemins hébreux, paramètres, API et autres sites.
Les fichiers PHP ont conservé leurs SHA256 et les métadonnées de la configuration
mail sont restées identiques. Aucun e-mail n'a été envoyé pendant ces contrôles.
Le certificat SAN couvre `laurent-levy.com` et `www.laurent-levy.com` jusqu'au
30 janvier 2027 ; le renouvellement simulé a réussi et certbot.timer est actif.
La redirection de dev a aussi été confirmée publiquement. L'accès direct au
domaine de production depuis le proxy cloud était bloqué avant activation de
la liste réseau ; la validation TLS/contenu de production vient des contrôles
curl exécutés sur AWS avec les vrais noms.

Avant une restauration, préparer séparément les identifiants d'e-mail et les
certificats ; leurs valeurs et clés ne sont pas dans Git. Adapter les chemins
de certificat à la machine et contrôler la configuration Apache avant tout
rechargement. Ne pas remplacer les fichiers actuels par l'ancienne livraison
compilée. Aucun déploiement automatique n'est déclenché par un push Git.
