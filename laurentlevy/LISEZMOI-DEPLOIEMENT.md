# laurent-levy.com — paquet de mise en production

Site statique trilingue (FR / EN / HE) : **aucun serveur à maintenir**. Hébergement : S3 privé + CloudFront,
formulaire de contact : une petite fonction Lambda qui envoie l'e-mail via Amazon SES.

## Contenu du paquet

| Élément | Rôle |
| --- | --- |
| `site/` | Le site compilé, prêt à être copié tel quel dans S3 |
| `lambda/contact.zip` | La fonction du formulaire de contact (prête à téléverser) ; `lambda/source/` = code lisible |
| `infrastructure/infrastructure.yml` | Modèle CloudFormation : bucket S3, CloudFront, en-têtes de sécurité, Lambda, droits SES |
| `infrastructure/cloudfront-function.js` | Redirections (langue, anciennes URL WordPress, `www`) |
| `publier.sh` | Script qui publie tout en une commande (étape 4) |
| `VERSION.txt` | Date et version du build |

## À faire une seule fois

Tout se passe dans la région **us-east-1 (N. Virginie)**, obligatoire pour CloudFront.

### 1. Certificat HTTPS (ACM)
Console AWS → *Certificate Manager* → demander un certificat **public** pour
`laurent-levy.com` et `www.laurent-levy.com`, validation DNS (ajouter les 2 enregistrements CNAME demandés chez le registrar).
Noter l'**ARN** du certificat une fois « Émis ».

### 2. E-mails du formulaire (Amazon SES)
Console → *Simple Email Service* → *Identities* → créer une identité **Domaine** `laurent-levy.com`
(ajouter les enregistrements DKIM chez le registrar). Puis demander la sortie du *sandbox*
(*Account dashboard → Request production access*), sinon SES n'envoie qu'à des adresses vérifiées.
Les messages arrivent sur `contact@laurent-levy.com`, expédiés par `formulaire@laurent-levy.com`
(l'adresse du visiteur est en « Répondre à »).

### 3. Créer l'infrastructure
```bash
aws cloudformation deploy --region us-east-1 --stack-name laurent-levy \
  --template-file infrastructure/infrastructure.yml --capabilities CAPABILITY_IAM \
  --parameter-overrides CertificateArn=<ARN_DU_CERTIFICAT> OriginSecret=$(openssl rand -hex 24)
```
Récupérer ensuite les sorties : `aws cloudformation describe-stacks --region us-east-1 --stack-name laurent-levy --query "Stacks[0].Outputs"`
→ **DistributionId** (pour l'étape 4) et **DistributionDomain** (pour l'étape 5).
Les paramètres `ContactToEmail`, `ContactFromEmail` et `BucketName` ont des valeurs par défaut
(`contact@laurent-levy.com`, `formulaire@laurent-levy.com`, `laurent-levy-site`) ; les changer avec `--parameter-overrides` si besoin.

## Publier le site (à refaire à chaque mise à jour)

### 4. Envoyer le contenu
```bash
BUCKET=laurent-levy-site DISTRIBUTION_ID=<DistributionId> ./publier.sh
```
(AWS CLI v2 configurée avec un utilisateur autorisé sur S3, CloudFront et Lambda.)

### 5. Basculer le DNS
Chez le registrar (ou Route 53), faire pointer `www.laurent-levy.com` (CNAME) et `laurent-levy.com`
(ALIAS/ANAME) vers le **DistributionDomain** (`dxxxxxxxx.cloudfront.net`).
Le domaine nu redirige automatiquement vers `www`. **À faire en dernier** : tant que le DNS n'a pas changé,
l'ancien site WordPress reste en ligne.

## Vérifications après la bascule
- `https://www.laurent-levy.com/` → redirige vers `/fr/` (ou `/en/`, `/he/` selon la langue du navigateur) ;
- `https://laurent-levy.com/fr/biographie/` → redirige vers `www` ;
- ancienne URL `https://www.laurent-levy.com/fr/en` → redirige vers `/en/` ;
- envoyer un message depuis `/fr/contact/` : il doit arriver sur `contact@laurent-levy.com` ;
- tester sur https://securityheaders.com et https://pagespeed.web.dev ;
- dans Google Search Console : ajouter le site et soumettre `https://www.laurent-levy.com/sitemap.xml`.

## Bon à savoir
- **Retour arrière** : le bucket est versionné ; remettre le DNS sur l'ancien hébergement suffit en cas de souci.
- **Coût** : quelques centimes à quelques euros par mois pour ce trafic (S3 + CloudFront + Lambda + SES).
- **Pas de cookies, pas d'analytics** : aucun bandeau de consentement nécessaire. L'ancien Google Analytics (G-N6CNV71M0M) n'a pas été repris.
- **Contenus à relire avant la bascule** : dates incohérentes de l'ancien site (hôtel Jabotinsky « 2020 » en page Hôtellerie vs « 2025 » en biographie ; projets de la biographie différents entre FR et EN) et quelques phrases hébreu/anglais corrigées à partir du français.
- Le formulaire est protégé par un secret partagé entre CloudFront et la Lambda : la fonction ne répond pas aux appels directs. Anti-spam intégré (champ piège, délai minimal, limite de liens).
