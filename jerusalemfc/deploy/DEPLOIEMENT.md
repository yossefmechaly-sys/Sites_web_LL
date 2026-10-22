# Mise en ligne de jerusalemfc.co.il sur l'EC2

Site Next.js + Payload (admin sur `/admin`) + SQLite, dans un seul processus Node géré par pm2,
derrière Nginx. L'instance héberge déjà d'autres sites : rien ici ne touche à leur configuration.

| Élément | Valeur |
|---|---|
| Dossier | `/var/www/jerusalemfc` |
| Port interne | `3100` (écoute sur 127.0.0.1 uniquement) |
| Processus pm2 | `jerusalemfc` |
| Base | `/var/www/jerusalemfc/jerusalemfc.db` (SQLite) |
| Médias | `/var/www/jerusalemfc/media/` |
| Journaux | `/var/log/jerusalemfc/` |
| Sauvegardes | `/var/backups/jerusalemfc/` (14 jours) |

> Si le port 3100 est déjà pris sur l'instance (`sudo ss -ltnp | grep 3100`), choisir un autre port et le
> changer à 3 endroits : `deploy/ecosystem.config.cjs`, `deploy/nginx-jerusalemfc.conf`, `INTERNAL_URL` du `.env`.

---

## 0. Prérequis sur l'instance

```bash
node -v              # Node 22 attendu (20.18 minimum)
pm2 -v               # sinon : sudo npm install -g pm2
nginx -v
sudo apt install -y sqlite3 curl
free -h              # mémoire libre : voir l'étape 4 (build)
```

Node 22 si absent :

```bash
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash - && sudo apt install -y nodejs
```

## 1. Vérifier que la Fédération répond depuis l'instance (bloquant)

L'import des matchs lit football.org.il, protégé par Cloudflare. Depuis le poste de développement, `curl`
passe mais pas Node. **Il faut vérifier que les adresses IP d'AWS ne sont pas bloquées :**

```bash
curl -s -o /dev/null -w "%{http_code}\n" -A "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36" "https://www.football.org.il/Components.asmx/LeagueGamesList?league_id=62&season_id=28&box=10&round_id=1&componentTitle=x"
```

- `200` : parfait, continuer.
- `403` : l'import ne fonctionnera pas depuis l'EC2. Le site marche quand même (matchs à jour à la main
  dans l'admin), mais il faut une solution de repli : voir `docs/A-FAIRE-IA.md`, tâche « Import bloqué ».

## 2. Copier les fichiers

Depuis le poste de développement, envoyer l'archive de livraison (`livraison/jerusalemfc-*.tar.gz` :
code + base + médias) :

```bash
scp livraison/jerusalemfc-AAAA-MM-JJ.tar.gz utilisateur@IP_EC2:/tmp/
```

Sur l'instance :

```bash
sudo mkdir -p /var/www/jerusalemfc /var/log/jerusalemfc /var/backups/jerusalemfc
sudo chown -R $USER:$USER /var/www/jerusalemfc /var/log/jerusalemfc /var/backups/jerusalemfc
tar -xzf /tmp/jerusalemfc-AAAA-MM-JJ.tar.gz -C /var/www/jerusalemfc
chmod +x /var/www/jerusalemfc/deploy/*.sh
```

## 3. Fichier `.env` de production

```bash
cd /var/www/jerusalemfc
cp .env.example .env
nano .env
```

| Variable | Valeur |
|---|---|
| `DATABASE_URL` | `file:./jerusalemfc.db` |
| `PAYLOAD_SECRET` | sortie de `openssl rand -hex 32` |
| `NEXT_PUBLIC_GA_ID` | `G-WHZBPE28NX` (vide = pas de Google Analytics) |
| `NEXT_PUBLIC_SITE_URL` | `https://jerusalemfc.co.il` |
| `REVALIDATE_SECRET` | sortie de `openssl rand -hex 32` |
| `INTERNAL_URL` | `http://127.0.0.1:3100` |
| `DEV_ADMIN_EMAIL` / `DEV_ADMIN_PASSWORD` | supprimer ces deux lignes |

Les variables `NEXT_PUBLIC_*` sont figées au build : refaire l'étape 4 si on les change.

## 4. Installer et construire

Le build a besoin d'environ 1,5 Go de mémoire. Sur une petite instance partagée, ajouter du swap avant :

```bash
# Seulement si « free -h » montre moins de 2 Go disponibles et pas de swap
sudo fallocate -l 2G /swapfile && sudo chmod 600 /swapfile && sudo mkswap /swapfile && sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

```bash
cd /var/www/jerusalemfc
npm ci --legacy-peer-deps --no-audit --no-fund
NODE_OPTIONS="--no-deprecation --max-old-space-size=1536" npx next build
```

## 5. Compte administrateur

La base livrée contient un compte de test (`dev@jerusalemfc.test`) : cette commande crée le vrai compte
et supprime les comptes de test.

```bash
ADMIN_EMAIL=adresse@du-club.com ADMIN_PASSWORD='mot-de-passe-long-et-unique' npm run create-admin
```

Pour d'autres administrateurs : les créer ensuite depuis `/admin` → Utilisateurs.

## 6. Démarrer le site

```bash
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup          # puis lancer la commande sudo affichée, pour redémarrer après un reboot
curl -s -o /dev/null -w "%{http_code}\n" http://127.0.0.1:3100/he    # 200 attendu
```

## 7. Nginx

```bash
sudo cp deploy/nginx-jerusalemfc.conf /etc/nginx/sites-available/jerusalemfc
sudo ln -s /etc/nginx/sites-available/jerusalemfc /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

**Tester avant de toucher au DNS** (le domaine pointe encore vers l'ancien site) : sur son propre
ordinateur, ajouter dans le fichier `hosts` la ligne `IP_EC2 jerusalemfc.co.il`
(Windows : `C:\Windows\System32\drivers\etc\hosts`, en administrateur), ouvrir
`http://jerusalemfc.co.il/he`, tout vérifier (liste à l'étape 10), puis retirer la ligne.

## 8. Tâches planifiées (import des matchs, sauvegardes)

```bash
crontab -e      # coller le contenu de deploy/crontab.txt
./deploy/import-matchs.sh      # premier import à la main : doit finir par « Cache du site : vidé »
./deploy/sauvegarde.sh         # première sauvegarde
```

## 9. Bascule du domaine

1. Associer une **Elastic IP** à l'instance si ce n'est pas déjà le cas.
2. Chez le registraire du domaine : enregistrement `A` de `jerusalemfc.co.il` → Elastic IP ;
   `www` → `CNAME jerusalemfc.co.il` (ou `A` vers la même IP). Baisser le TTL la veille si possible.
3. Une fois le DNS propagé (`dig +short jerusalemfc.co.il` renvoie l'Elastic IP), activer le HTTPS :

```bash
sudo certbot --nginx -d jerusalemfc.co.il -d www.jerusalemfc.co.il --redirect
```

## 10. Vérifications après mise en ligne

- `https://jerusalemfc.co.il/` → redirige vers `/he` ; `/fr` et `/en` s'affichent.
- Pages : matchs, classement, calendrier, joueurs, staff, club, chants, Torah, boutique, adhésion,
  mentions légales — dans les 3 langues (le sélecteur de drapeaux garde la page).
- Bandeau cookies : « Refuser » → aucun appel à Google Analytics ; « Accepter » → GA4 se charge.
- Formulaires newsletter, précommande et adhésion → les envois apparaissent dans `/admin`.
- `/admin` : connexion avec le compte créé à l'étape 5 ; modifier un texte de l'accueil → visible aussitôt.
- `https://jerusalemfc.co.il/sitemap.xml` et `/robots.txt` répondent.
- `tail -f /var/log/jerusalemfc/import.log` : imports toutes les 30 minutes (10h–23h30).
- Google Search Console : ajouter le domaine et soumettre `sitemap.xml`.

## Mettre à jour le site plus tard

Après avoir envoyé la nouvelle version du code (archive ou `git pull`) :

```bash
cd /var/www/jerusalemfc && ./deploy/mise-a-jour.sh
```

⚠️ **Modification du modèle de données (collections, champs)** : en production, Payload ne modifie pas
la base tout seul. Voir `docs/A-FAIRE-IA.md`, tâche « Migrations » — à mettre en place avant tout
changement de schéma.

## Restaurer une sauvegarde

```bash
pm2 stop jerusalemfc
gunzip -c /var/backups/jerusalemfc/jerusalemfc-AAAA-MM-JJ.db.gz > /var/www/jerusalemfc/jerusalemfc.db
tar -xzf /var/backups/jerusalemfc/media-AAAA-MM-JJ.tar.gz -C /var/www/jerusalemfc
pm2 start jerusalemfc
```
