# Outils de vérification visuelle

Scripts Playwright pilotant **Microsoft Edge** (`channel: 'msedge'`) : aucun navigateur à télécharger
sous Windows. Sur Linux/macOS, remplacer `channel: 'msedge'` par une installation `npx playwright install chromium`.

| Script | Usage |
|---|---|
| `shoot.mjs` | Capture pleine page : `node tools/visual/shoot.mjs <url> <sortie.png> [largeur]` |
| `compare.cjs` | Assemble ancien (gauche) / nouveau (droite) par tranches : `node tools/visual/compare.cjs ancien.png nouveau.png <préfixe> [hauteur]` |
| `check.mjs` | Statut HTTP, erreurs console, débordement horizontal, `lang`/`dir`/`hreflang` à 390 et 1440 px : `PORT_CHECK=3000 node tools/visual/check.mjs /he /fr/matchs …` (sous Git Bash, préfixer par `MSYS_NO_PATHCONV=1`) |
| `viewport.mjs` | Capture d'écran d'une zone : `node tools/visual/viewport.mjs <url> <sélecteur CSS> <sortie.png>` |
| `overflow.mjs` | Liste les éléments qui débordent : `node tools/visual/overflow.mjs <url> <largeur>` |

L'ancien site (référence du design) : https://jerusalemfc.co.il/he/ et /fr/ — tant que le domaine n'a pas basculé.
Mettre les captures dans un dossier non versionné (ex. `.ref/`).
