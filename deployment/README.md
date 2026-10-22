# Hébergement actuel sur AWS

Ubuntu 26.04, Apache, volume ext4 de 200 Go monté dans `/mnt/bigdata` et déclaré dans
`/etc/fstab` par UUID `23fc1556-a2e7-4ac8-9962-02180095e26d`.
Les fichiers de ce dossier sont des modèles de configuration sans secrets.
Les certificats et leurs clés, générés par Certbot, ne sont pas versionnés.
Vérifier l'état du serveur avant toute copie de configuration et tester
`apache2ctl configtest` avant un rechargement Apache.

## Jerusalem FC

- Application : `/mnt/bigdata/jerusalemfc`, utilisateur système `jerusalemfc`.
- Service `jerusalemfc.service` : le fichier de base conserve l'ancien chemin,
  puis `jerusalemfc.service.d/90-bigdata.conf` définit le chemin effectif et exige
  le montage du disque. Next.js écoute uniquement sur `127.0.0.1:3100`.
- Le lien `/var/www/jerusalemfc` pointe vers `/mnt/bigdata/jerusalemfc` : conserver
  cette compatibilité pour les scripts de livraison et certains chemins du build.
- Le fichier local `.env` contient notamment
  `DATABASE_URL=file:/mnt/bigdata/jerusalemfc/jerusalemfc.db` et
  `NEXT_PUBLIC_SITE_URL=https://jerusalemfc.tobedev.com`.
  Un exemple sans valeurs secrètes est fourni ici.
- Apache utilise `jerusalemfc.conf` et le vhost SSL créé par Certbot.
- Sauvegarde via `jerusalemfc-backup.service` et `jerusalemfc-backup.timer`, tous
  les jours à 03h15, fuseau `Asia/Jerusalem`, conservation 14 jours dans
  `/var/backups/jerusalemfc`. Le drop-in de sauvegarde exige le même disque et
  appelle le script depuis son nouveau chemin.
- Une copie de retour arrière de la migration est conservée sur le serveur sous
  `/mnt/bigdata/.jerusalemfc-migration-<date>/original` ; elle n'est pas dans Git.

Les certificats HTTPS et leur renouvellement à blanc ont été validés lors de la
mise en ligne. La migration a vérifié la copie, l'intégrité SQLite, le dossier du
processus, l'API et les médias, HTTPS et la sauvegarde. Les trois langues et
l'administration ont répondu publiquement. Les tests navigateur du projet
contiennent encore des attentes du modèle Payload initial : leur réussite
n'est pas revendiquée. L'import automatique football.org.il et l'envoi d'emails
n'ont pas été activés.

## Laurent Levy

- Projet : `/mnt/bigdata/laurentlevy`, propriétaire `ubuntu`, groupe `www-data`.
- DocumentRoot : `/mnt/bigdata/laurentlevy/site` (dossiers 0750, fichiers 0640).
- Apache utilise `laurentlevy.conf` et le vhost SSL créé par Certbot.
- Le drop-in `apache2.service.d/laurentlevy-storage.conf` exige le montage du disque.
- `mod_substitute` adapte dans les réponses HTML/XML/texte les URL publiques du
  domaine original vers `https://laurent-levy.tobedev.com`, sans changer les
  adresses email ni les octets des fichiers livrés.
- `/api/contact` répond volontairement 503 : l'envoi du formulaire est reporté.
  Aucun nouveau service Node, bucket S3, CloudFront ou Lambda n'a été créé.

Lors de la mise en ligne, les 33 pages, cinq actifs représentatifs, sitemap,
robots, 404 et endpoint de formulaire désactivé ont passé les contrôles HTTP
publics (42 contrôles), ainsi que la redirection HTTP vers HTTPS. Le certificat
a été délivré par Certbot et son renouvellement est planifié. Aucun test de
redémarrage de la machine n'est revendiqué.

## Les Sept Clés pour Réussir

- Projet : `/mnt/bigdata/les7cles`, avec un DocumentRoot par langue (`fr`, `en`,
  `he`) et un hôte de développement correspondant.
- Les modèles HTTP sont dans [`les7cles/`](les7cles/README.md). Certbot a créé
  les trois vhosts SSL et les redirections vers HTTPS sur le serveur.
- Un certificat SAN nommé `les7cles.tobedev.com` couvre les trois domaines ;
  son renouvellement automatique est configuré.
- Le drop-in `apache2.service.d/les7cles-storage.conf` exige le montage du disque.
- `mod_substitute` adapte les trois origines définitives vers les domaines de
  développement dans les réponses HTML/XML/texte. Les fichiers livrés restent
  inchangés. Les lecteurs Calaméo et les scripts intégrés sont conservés.
- `X-Robots-Tag: noindex, nofollow` demande la non-indexation des versions de
  développement. `/contact.php` répond 503 et les fichiers PHP sont protégés :
  les formulaires sont explicitement reportés aux domaines de production.

Les 44 contrôles sur le serveur et 50 contrôles d'accès public ont réussi lors de
la mise en ligne : pages FR/EN/HE, liens de langue, métadonnées, ressources,
redirections et réponses d'erreur attendues. Les deux sites précédents ont aussi
été vérifiés. Aucun test visuel automatisé, envoi d'e-mail, renouvellement simulé
de ce nouveau certificat ni redémarrage de la machine n'est revendiqué.

## Avant une restauration

Ne pas remplacer une base ou un dossier de médias par les fichiers du dépôt.
Restaurer les données protégées séparément, préserver les secrets existants,
vérifier les utilisateurs et les permissions, puis construire Jerusalem FC avec
son URL publique avant de démarrer son service. Laurent Levy et Les Sept Clés
sont déjà compilés.
La configuration SSL réelle est gérée sur le serveur par Certbot ; les modèles
HTTP ici ne remplacent pas une configuration TLS active.
