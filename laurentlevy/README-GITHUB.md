# Copie du projet Laurent Levy déployé

Les fichiers de ce dossier proviennent de l'export du serveur AWS du
1 novembre 2026, vérifiés par SHA256. L'export inclut les pages compilées,
ressources et scripts PHP ; les sources du projet Astro ne sont pas fournies.

| Dossier | Usage actuel |
| --- | --- |
| `site-prod/` | Production : https://laurent-levy.com/ |
| `site/` | Ancien domaine de dev ; ses pages redirigent vers la production |
| `site-avant-*/` | Copies historiques du site, conservées telles qu'exportées |
| `backups-formulaire-*/` | Ancienne copie du traitement du formulaire |
| `vhost-avant-*/` | Anciennes configurations Apache |
| `infrastructure/`, `lambda/`, `publier.sh` | Livraison historique de référence S3/CloudFront/Lambda |

Le formulaire actuel utilise `api/contact.php` et PHP8.5-FPM, avec les
paramètres privés dans `/etc/laurent-levy/contact.ini`. Ce fichier reste hors
du site et hors de Git. Les identifiants, clés TLS, bases et dépendances
installées doivent être préparés séparément lors d'une restauration.

Les configurations réelles, le manifeste et la procédure de restauration sont
dans [`deployment/laurentlevy`](../deployment/laurentlevy/README.md). Les anciens
documents de livraison décrivent parfois d'autres domaines ou l'architecture
S3 initiale ; utiliser la documentation de déploiement actuelle pour AWS Ubuntu.

Un push Git ne modifie pas les sites hébergés automatiquement.
