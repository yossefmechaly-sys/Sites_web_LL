# Jerusalem FC — site du club (מ.כ. ירושלים)

Refonte de jerusalemfc.co.il (ancien site WordPress + Elementor + SportsPress) : **design identique**,
contenus modifiables dans une admin, matchs importés automatiquement depuis la Fédération israélienne.
Client : le club. Agence : Tobeweb (éditeur du site). Communication avec l'utilisateur : **en français**.

Tâches restantes : **`docs/A-FAIRE-IA.md`**. Mise en ligne : **`deploy/DEPLOIEMENT.md`**.

## Stack

- Next.js 16 (App Router) + **Payload 3** (admin `/admin`, même processus) + **SQLite** (`jerusalemfc.db`).
- Langues du contenu : **hébreu (défaut, rtl)**, français, anglais (repli FR). Admin en français et hébreu.
- Hébergement cible : EC2 AWS partagé avec d'autres sites (pm2 + Nginx), voir `deploy/`.

## Organisation du code

| Dossier | Rôle |
|---|---|
| `src/app/(frontend)/[locale]/` | Accueil, layout (polices, en-tête, pied, bandeau cookies), `site.css` (tout le style) |
| `src/app/(frontend)/[locale]/[slug]/` | **Route unique** de toutes les pages intérieures ; l'adresse est résolue via `routes` |
| `src/i18n/config.ts` | Langues + **adresses des pages par langue** (reprises de l'ancien site pour le SEO) |
| `src/i18n/dictionaries.ts` | Libellés d'interface uniquement (le contenu éditorial est dans l'admin) |
| `src/views/` | Une vue par page intérieure (matchs, classement, joueurs, club, boutique…) |
| `src/components/` | En-tête, sections partagées, formulaires, `Img` (images optimisées), `ui.tsx` |
| `src/collections/`, `src/globals/` | Modèle Payload (Matchs, Équipes, Saisons, Joueurs, Staff, Produits… ; fiches de pages) |
| `src/lib/ifa.ts`, `importSeason.ts` | Import football.org.il ; `matches.ts` lecture des matchs ; `standings.ts` classement |
| `src/scripts/` | Scripts `payload run` (import, reprises de l'ancien site, remplissages, création d'admin) |
| `deploy/` | pm2, Nginx, cron, sauvegardes, mise à jour, guide de déploiement |

## Commandes

```bash
npm run dev                  # http://localhost:3000 (admin /admin)
npx tsc --noEmit             # vérification des types (à lancer après chaque changement)
npm run build                # build de production (vérifie aussi TypeScript)
npm run import:ifa           # import des matchs (saisons « import automatique » avec ID Fédération)
npm run generate:types       # après toute modification de collection/global → src/payload-types.ts
```

Scripts de reprise / remplissage (idempotents, ne remplacent jamais un contenu modifié dans l'admin) :
`migrate:wp-teams`, `migrate:wp-matches`, `migrate:wp-people`, `seed:home`, `seed:pages`, `seed:legal`,
`seed:en`, `create-admin`. Ordre sur base neuve : voir `README.md`.

## Règles et pièges (à respecter)

1. **Design identique à l'ancien site** : toute page refaite est comparée visuellement à l'original
   (captures pleine page côte à côte). Ne pas « moderniser » sans demande.
2. **Hébreu = rtl** : utiliser les propriétés CSS logiques (`inset-inline-start`, `margin-inline`…).
   Certains blocs gardent volontairement un ordre gauche→droite dans les deux langues (`direction: ltr`
   commenté dans `site.css`) : ne pas les « corriger ».
3. **Contenu éditorial dans l'admin**, jamais en dur. Les listes (cartes, vidéos…) sont localisées par langue.
4. **Import Fédération** (`src/lib/ifa.ts`) : Cloudflare bloque `fetch()` de Node → passage par `curl`
   avec un user-agent navigateur. Le score de la liste est affiché **« extérieur - domicile »**. La cellule
   date peut contenir un statut collé (« הפסקה »). Un match **verrouillé** n'est jamais modifié par l'import.
5. **Classements** : la Fédération ne publie pas celui de la Liga Alef → calculé depuis les matchs. Pour les
   saisons reprises de l'ancien site, seul le classement publié (`seasons.standings`) fait foi : l'ancien
   site ne connaît que les matchs du club, un calcul serait faux.
6. **Base SQLite en développement** : le schéma est poussé automatiquement. **Arrêter le serveur de dev avant
   tout `payload run`** (sinon conflit de mise à jour du schéma). Bug connu de drizzle : rendre une colonne
   facultative et en ajouter une en même temps échoue → ajouter la colonne à la main. Sauvegarder la base
   (`cp jerusalemfc.db …`) avant toute opération risquée.
7. **En production, pas de push de schéma** : toute modification de collection/global exige une migration
   (voir `docs/A-FAIRE-IA.md`, tâche « Migrations »).
8. **Performances** : images via `<Img>` (composant client next/image) ; pour les images répétées en grand
   nombre (logos des listes) `optimizedSrc()` sans composant client ; fonds CSS via `/_next/image?url=…`.
   Pages en ISR (5 min) vidées par les hooks de `src/lib/revalidate.ts`.
9. **Formulaires publics** (newsletter, précommande, adhésion) : actions serveur avec champ piège
   anti-robots ; les collections correspondantes sont fermées à l'API publique (create/read = 403).
10. **Traductions** EN/HE rédigées par Claude, non relues par un natif : le signaler quand on en ajoute.
11. **Commits** : seulement à la demande de l'utilisateur ; messages en français ; terminer par
    `Co-Authored-By: Claude …`. Ne jamais versionner `.env`, `*.db`, `media/`, `.ref/`, `livraison/`.

## Vérifier un changement visible

Lancer le serveur, puis comparer à l'original et contrôler les pages : erreurs console, débordement
horizontal à 390 px et 1440 px, `lang`/`dir`, liens `hreflang`. (Pendant le développement, des scripts
Playwright pilotant Microsoft Edge — `channel: 'msedge'`, sans téléchargement de navigateur — ont servi
à faire des captures pleine page ; ils sont dans `tools/visual/`, voir son README.)
