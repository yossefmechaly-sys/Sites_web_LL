# Les Sept Clés pour Réussir : mise en production

Site statique (HTML/CSS/JS, sans WordPress) en trois versions, une par domaine :

| Dossier | Langue | Domaine |
|---|---|---|
| `fr/` | Français | les7cles.com |
| `en/` | Anglais | thesevenkeystosucceed.com |
| `he/` | Hébreu (RTL) | שבעת-המפתחות-להצלחה.co.il (`xn-----xldnbaepd2cbs3c5a9azbtec.co.il`) |

Chaque dossier contient le site complet : à déposer **à la racine** du domaine correspondant.
Le sélecteur de langue du site pointe déjà vers les trois domaines ci-dessus.

**Avant de mettre en ligne, lire `A-COMPLETER.md`** : le formulaire de contact ne fonctionnera pas sans l'adresse de réception.

## 1. Prérequis serveur

- Un serveur web (Apache ou nginx) avec **HTTPS** pour les trois domaines.
- **PHP 8.1 ou plus** avec la fonction `mail()` opérationnelle, uniquement pour le formulaire (`contact.php`). Le reste du site est statique.

## 2. Mise en ligne

1. Configurer sur le serveur un hôte (vhost) par domaine, dont la racine est le dossier de la langue :
   - `les7cles.com` (et `www.`) : contenu de `fr/`
   - `thesevenkeystosucceed.com` (et `www.`) : contenu de `en/`
   - `xn-----xldnbaepd2cbs3c5a9azbtec.co.il` (et `www.`) : contenu de `he/`
2. Copier le contenu de chaque dossier (y compris le fichier caché `.htaccess` et `contact.php`) dans la racine du domaine.
3. Ouvrir `contact.php` de chaque dossier et renseigner `CONTACT_TO` (voir `A-COMPLETER.md`).
4. Retirer l'ancien WordPress (ou le mettre de côté) une fois le nouveau site contrôlé.
5. Vérifier la liste de contrôle ci-dessous.

### Apache
Le fichier `.htaccess` fourni gère la page 404, le cache long des images/CSS/JS et les en-têtes de sécurité. Il faut `mod_headers` activé et `AllowOverride` autorisé.

### nginx (si le serveur n'est pas Apache)
```nginx
server {
    server_name les7cles.com www.les7cles.com;          # idem pour les 2 autres domaines
    root /var/www/les7cles.com;                          # dossier fr/ (ou en/, he/)
    index index.html;
    error_page 404 /404.html;
    add_header X-Content-Type-Options nosniff always;
    add_header Referrer-Policy strict-origin-when-cross-origin always;
    location / { try_files $uri $uri/ =404; }
    location ~* \.(webp|png|jpe?g|svg|woff2?|css|js)$ { add_header Cache-Control "public, max-age=31536000, immutable"; }
    location = /contact.php { include fastcgi_params; fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name; fastcgi_pass unix:/run/php/php-fpm.sock; }
}
```
(Adapter le chemin du socket PHP-FPM. Les fichiers `.php` autres que `contact.php` ne doivent pas être exécutés.)

## 3. Redirections et domaines

- `www.` vers le domaine sans `www.` (ou l'inverse), et HTTP vers HTTPS, pour chaque domaine.
- Les anciennes URL WordPress `/livre/` sont conservées. Les autres anciennes URL (`/author/matti/`, flux, etc.) n'ont plus d'équivalent : elles renverront la page 404 du site, ce qui est voulu.
- Le nom de domaine hébreu doit être enregistré en version punycode côté DNS : `xn-----xldnbaepd2cbs3c5a9azbtec.co.il`.

## 4. Liste de contrôle après mise en ligne

- [ ] Les 3 domaines s'ouvrent en HTTPS, avec la bonne langue.
- [ ] Le sélecteur de langue en haut à droite mène bien aux deux autres sites.
- [ ] Le bandeau cookies s'affiche à la première visite ; le bouton rond « Lire le livre » ouvre le lecteur (Accepter) ou Calaméo (Refuser).
- [ ] Envoi d'un message de test depuis le formulaire des 3 sites : le message arrive à l'adresse de réception, pas dans les courriers indésirables.
- [ ] Les liens Amazon, Facebook et ceux du pied de page s'ouvrent.
- [ ] Page « Mentions légales » de chaque langue.
- [ ] `/robots.txt` et `/sitemap.xml` répondent sur chaque domaine.
- [ ] Dans Google Search Console : ajouter les 3 domaines et envoyer le sitemap de chacun.

## 5. Modifier le site plus tard

Le code source est dans `les7cles-sources.zip` (Astro). Les textes sont dans `src/data/site.mjs` (contenu) et `src/data/extra.mjs` (cookies, mentions légales), le style dans `src/styles/`.

```bash
npm install
npm run preview   # construit et sert les 3 langues sur localhost:4411, 4412, 4413
npm run build     # produit dist/fr, dist/en, dist/he (les dossiers à déposer)
npm test          # tests automatiques (nécessite Google Chrome installé)
```
Node.js 22 ou plus est nécessaire.
