# Ce qu'il reste à faire — instructions pour l'IA

Lire d'abord `CLAUDE.md` (architecture, règles, pièges). État au 18/10/2026 : toutes les pages sont
refaites à l'identique en hébreu, français et anglais, contenus modifiables dans l'admin, historique des
matchs repris, cookies + GA4 sous consentement, mentions légales, performances optimisées (Lighthouse
mobile 81–91). **Le site n'est pas encore en ligne.**

Méthode attendue pour chaque tâche : courte analyse, proposer le plan à l'utilisateur s'il y a un choix à
faire, implémenter, vérifier (`npx tsc --noEmit`, `npm run build`, contrôle des pages concernées dans les
3 langues), puis demander avant de commiter. Cocher la tâche ici une fois faite.

Légende : 🔴 bloquant pour la mise en ligne · 🟠 à faire juste après · 🟢 amélioration · 👤 dépend de l'utilisateur ou du club

---

## 🔴 1. Migrations Payload (avant tout changement de schéma)

**Contexte.** En développement, le schéma SQLite est poussé automatiquement ; en production (`NODE_ENV=production`)
non. Aujourd'hui la base livrée correspond exactement au code. Dès qu'on modifiera une collection ou un global,
la production ne suivra pas sans migration.

**À faire.**
1. Créer une migration de référence correspondant au schéma actuel : `npx payload migrate:create initial`.
2. La marquer comme déjà appliquée dans la base existante (sans la rejouer) — vérifier la table
   `payload_migrations` ; tester sur une **copie** de `jerusalemfc.db`.
3. Ajouter `npx payload migrate` dans `deploy/mise-a-jour.sh` (avant le build), et documenter le flux
   « changer le schéma → `migrate:create` → commit → déploiement » dans `CLAUDE.md`.

**Fini quand** : sur une copie de la base de prod, une modification de champ de test passe par une migration
appliquée avec `payload migrate`, et `mise-a-jour.sh` l'exécute.

## 🔴 2. Si l'import des matchs est bloqué depuis l'EC2 (403)

**Contexte.** football.org.il est derrière Cloudflare : `curl` passe depuis un poste classique, mais les IP
d'AWS peuvent être bloquées. Le test est l'étape 1 de `deploy/DEPLOIEMENT.md`. À ne traiter que si le test
renvoie 403.

**Pistes, dans l'ordre :**
1. Headless : Playwright + Chromium sur le serveur (`npx playwright install --with-deps chromium`), en
   remplaçant `httpGet` de `src/lib/ifa.ts` par une page qui fait le `fetch` depuis le navigateur (comme
   pendant l'analyse). Attention à la mémoire (instance partagée) : lancer, importer, fermer.
2. Import déporté : faire tourner `import-ifa` ailleurs (GitHub Actions planifié, ou poste du club) et
   envoyer les résultats au site via l'API REST de Payload avec une clé d'API dédiée (activer `useAPIKey` sur
   un utilisateur technique aux droits limités aux matchs/équipes).

**Fini quand** : la tâche planifiée remet les scores à jour sans intervention.

## 🔴 3. Redirections des anciennes adresses WordPress

**Contexte.** Les adresses des pages ont été conservées, mais l'ancien site en avait d'autres, indexées par
Google : fiches de match SportsPress (`/he/sport-event/...`), fiches équipes/joueurs, `/fr/contacts/`, `/cgu/`,
`/privacy-policy/`, `/fr/events/`, flux `feed`, etc.

**À faire.**
1. Récupérer la liste réelle : `https://jerusalemfc.co.il/he/wp-sitemap.xml` (et `/fr/`), plus les URL
   les plus visitées si l'utilisateur fournit un export Search Console/Analytics.
2. Ajouter des redirections 301 dans `next.config.ts` (`redirects()`) vers la page équivalente :
   match → liste des matchs, joueur → page joueurs, `cgu`/`privacy-policy` → mentions légales, etc.
3. Garder les redirections testables (petit script qui vérifie chaque ancienne URL → 301 → 200).

**Fini quand** : aucune URL de l'ancien sitemap ne renvoie 404 sur le nouveau site.

## 🟠 4. Envoi d'emails (précommandes, adhésions, newsletter) 👤

**Contexte.** Les envois des formulaires arrivent seulement dans l'admin (Boutique → Précommandes,
Site → Adhérents, Site → Abonnés). Payload n'a pas d'adaptateur email (avertissement au démarrage).

**À faire.** Demander à l'utilisateur le service d'envoi (SMTP du club, Amazon SES depuis l'EC2…) et l'adresse
qui reçoit les notifications. Puis : `@payloadcms/email-nodemailer`, variables `SMTP_*` dans `.env.example`,
hook `afterChange` (création) sur `pre-orders` et `members` → email au club ; email de confirmation au
visiteur dans sa langue (HE/FR/EN). Le mot de passe oublié de l'admin en dépend aussi.

## 🟠 5. Statuts spéciaux des matchs dans l'import

**Contexte.** La Fédération colle parfois un statut dans la cellule date (ex. « 18/10/הפסקה2026 » = match
interrompu). La date est maintenant lue correctement, mais le statut est ignoré : le match apparaît comme
joué avec son score.

**À faire.** Repérer les statuts possibles (interrompu, reporté, forfait…) sur les pages de la ligue 62,
les mapper vers `status` (`postponed`, etc.) dans `parseRound`/`importSeason`, et adapter l'affichage.
Ajouter des tests unitaires de `parseRound` avec des fragments HTML réels (score « extérieur - domicile »,
statut collé, heure « טרם נקבע »).

## 🟠 6. Changement de saison

Chaque été, une nouvelle saison commence (`season_id` Fédération +1 ; ligue 62 si le club reste en Liga
Alef Sud). Aujourd'hui : créer la saison dans l'admin (Compétition → Saisons) avec les ID Fédération,
cocher « Saison en cours », décocher « en cours » et « import automatique » sur l'ancienne.
**À faire** : ajouter ces consignes dans la description du champ de l'admin, et idéalement un avertissement
si aucune saison « en cours » n'a de match à venir.

## 🟠 7. Sécurité et robustesse

- En-têtes Nginx : HSTS (après Certbot), `X-Content-Type-Options`, `Referrer-Policy`, CSP compatible avec
  GA4 et YouTube (`youtube-nocookie.com`, `i.ytimg.com`, `googletagmanager.com`).
- Limitation de débit Nginx sur les POST publics (formulaires) et sur `/admin` / `/api/users/login`.
- Payload : `auth.maxLoginAttempts` / `lockTime` sur la collection `users`.
- Supprimer les fichiers hérités du gabarit Payload devenus faux : `tests/` (attendent l'ancienne page
  d'exemple), `test.env` ; réparer `eslint.config.mjs` (la config du gabarit plante) ou le remplacer.

## 👤 8. Contenus que le club doit fournir (à saisir dans l'admin)

- Photos des **21 joueurs** (Équipe → Joueurs) et de **4 membres du staff** : David Birman, Ofir Grinberg,
  Matou Achour, Amir Aboucasis — les fichiers n'existent plus sur l'ancien serveur.
- **Logos** de 6 équipes : Maccabi Kiryat Gat, FC Kfar Saba, Hapoel Nir Ramat Hasharon, Hapoel Mahane
  Yehuda, Ironi Beit Shemesh, Hapoel Hadera (un écusson aux initiales s'affiche en attendant).
- Vidéo Torah « סיפורים יהודיים – קוגל שטרודל וכדורגל » (YouTube `e4iQmM9uptY`) : **privée** → la rendre
  publique ou la remplacer (Pages → Torah & foot).
- Mentions légales : **forme juridique et numéro d'immatriculation de Tobeweb** (Pages → Mentions légales).
- Relecture des textes **hébreux et anglais** rédigés par l'IA (boutique, adhésion, mentions légales,
  cookies, toute la version anglaise) par un locuteur natif.

## 🟢 9. Finitions

- Comparaison visuelle détaillée de la **version anglaise** (fait pour HE et FR seulement).
- Contraste des sur-titres dorés (`#c49c48` sur fond clair, sous le seuil AA) : à discuter avec le client,
  c'est la charte d'origine.
- Page Matchs : ~220 lignes et plus de 400 logos ; envisager un regroupement par saison (saison en cours
  dépliée, anciennes repliées) si la liste grossit.
- Newsletter : décider de l'outil d'envoi (export CSV depuis l'admin aujourd'hui, ou synchro Mailchimp/Brevo).
- Liens vers les fiches de match de la Fédération (`ifaGameId` est stocké) depuis la liste des matchs.
