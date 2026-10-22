# Jerusalem FC — site du club (מ.כ. ירושלים)

Refonte de jerusalemfc.co.il sans WordPress : Next.js + Payload 3 (admin sur `/admin`) + SQLite.
Langues du contenu : hébreu (défaut) et français.

## Démarrer en local

```bash
npm install
cp .env.example .env   # puis renseigner PAYLOAD_SECRET
npm run dev            # site sur http://localhost:3000, admin sur /admin
```

## Import des matchs (Fédération israélienne)

```bash
npm run import:ifa   # base vide : crée d'abord les saisons connues
```

- Source : football.org.il, ligue 62 (Liga Alef Sud) ; saison 27 = 2025/26, 28 = 2026/27.
- Seules les saisons cochées « Import automatique » sont importées.
- Un match **verrouillé** dans l'admin n'est plus jamais modifié par l'import ; rien n'est supprimé.
- Les nouvelles équipes sont créées avec leur nom hébreu : compléter le nom français dans l'admin.
- Le classement est calculé à partir des résultats (`src/lib/standings.ts`), la Fédération ne le publie pas pour cette ligue.
- Pièges : la Fédération affiche les scores « extérieur - domicile » ; Cloudflare bloque `fetch()` de Node, d'où le passage par `curl` (`src/lib/ifa.ts`).

## Contenu de l'accueil

Tous les textes et images de l'accueil se modifient dans l'admin : **Pages → Accueil**
(un onglet par section, en hébreu et en français via le sélecteur de langue en haut à droite).
Les libellés d'interface (menu, compte à rebours, colonnes du classement) restent dans `src/i18n/dictionaries.ts`.

```bash
npm run seed:home          # base neuve : remplit l'accueil avec le contenu repris de l'ancien site
npm run migrate:wp-teams   # reprend noms français et logos des équipes depuis l'ancien WordPress
```

Les inscriptions à la newsletter arrivent dans **Site → Abonnés newsletter** (export CSV depuis la liste).

## Reprise de l'ancien site WordPress

Sur une base neuve, dans cet ordre (serveur de dev **arrêté** : la mise à jour automatique du schéma
SQLite entre en conflit quand deux processus la font en même temps) :

```bash
npm run import:ifa           # saisons de la Fédération (crée 2025/26 et 2026/27) et leurs matchs
npm run migrate:wp-teams     # noms français et logos des équipes de la Fédération
npm run migrate:wp-matches   # historique 2019 → 2025 : matchs, saisons, équipes, classements publiés
npm run migrate:wp-people    # joueurs et staff
npm run seed:home            # contenu de l'accueil
npm run seed:pages           # pages Le club, Chants, Torah & foot, et produits de la boutique
```

Tous ces scripts sont idempotents et ne remplacent jamais un contenu déjà modifié dans l'admin.

## Contenu modifiable dans l'admin

- **Pages** : Accueil, Le club, Chants, Torah & foot.
- **Compétition** : Matchs (verrouillables), Équipes, Saisons (avec classement publié facultatif).
- **Équipe** : Joueurs (par poste, numéro, photo), Staff (fonction, photo, ordre).
- **Boutique** : Produits (mis en avant ou article), Précommandes reçues (suivi).
- **Site** : Adhérents, Abonnés newsletter.

Pas encore d'envoi d'emails : les précommandes, adhésions et inscriptions sont à consulter dans l'admin.
