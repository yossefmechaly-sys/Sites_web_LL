#!/usr/bin/env bash
# Publie le contenu de ce paquet sur AWS (S3 + CloudFront + Lambda du formulaire).
# Prérequis : AWS CLI v2 configurée (aws sts get-caller-identity doit répondre),
# infrastructure déjà créée (voir LISEZMOI-DEPLOIEMENT.md, étape 3).
# Usage : BUCKET=laurent-levy-site DISTRIBUTION_ID=E1ABCDEF123456 ./publier.sh
set -euo pipefail
: "${BUCKET:?BUCKET manquant (nom du bucket S3)}"
: "${DISTRIBUTION_ID:?DISTRIBUTION_ID manquant (sortie DistributionId de la pile)}"
REGION="${REGION:-us-east-1}"
cd "$(dirname "$0")"

echo "1/5 Fichiers fingerprintés (cache 1 an)…"
aws s3 sync site/_astro "s3://$BUCKET/_astro" --delete \
  --cache-control "public, max-age=31536000, immutable"

echo "2/5 Pages, sitemap, icônes (toujours revalidés)…"
aws s3 sync site "s3://$BUCKET" --delete --exclude "_astro/*" \
  --cache-control "public, max-age=0, must-revalidate"

echo "3/5 Fonction de routage CloudFront…"
ETAG=$(aws cloudfront describe-function --name laurent-levy-router --query ETag --output text)
ETAG=$(aws cloudfront update-function --name laurent-levy-router --if-match "$ETAG" \
  --function-config Comment="Redirections, langue, index.html",Runtime=cloudfront-js-2.0 \
  --function-code fileb://infrastructure/cloudfront-function.js --query ETag --output text)
aws cloudfront publish-function --name laurent-levy-router --if-match "$ETAG" > /dev/null

echo "4/5 Fonction du formulaire de contact…"
aws lambda update-function-code --region "$REGION" --function-name laurent-levy-contact \
  --zip-file fileb://lambda/contact.zip > /dev/null

echo "5/5 Invalidation du cache CloudFront…"
aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*" > /dev/null
echo "Publié."
