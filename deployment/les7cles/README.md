# Les Sept Clés — hébergement de développement

| Langue | Hôte | DocumentRoot sur AWS |
| --- | --- | --- |
| FR | les7cles.tobedev.com | /mnt/bigdata/les7cles/fr |
| EN | thesevenkeystosucceed.tobedev.com | /mnt/bigdata/les7cles/en |
| HE | xn-----xldnbaepd2cbs3c5a9azbtec.tobedev.com | /mnt/bigdata/les7cles/he |

Les trois modèles `les7cles-{fr,en,he}.conf` correspondent à la configuration
HTTP préparée pour Apache. Sur AWS, Certbot a ajouté les redirections HTTP vers
HTTPS et créé les fichiers `les7cles-{fr,en,he}-le-ssl.conf`. Ces modèles ne
doivent pas écraser une configuration SSL active. Les certificats et leurs clés
restent sur le serveur. Le certificat SAN `les7cles.tobedev.com` couvre les trois
hôtes et son renouvellement est planifié.

Le volume doit être monté dans `/mnt/bigdata`. Le drop-in
[`les7cles-storage.conf`](../systemd/apache2.service.d/les7cles-storage.conf)
exprime cette dépendance pour Apache. Les fichiers du site appartiennent à
`ubuntu:www-data`, avec des dossiers en 0750 et des fichiers en 0640.

Les modules Apache utilisés sont `rewrite`, `headers`, `substitute` et `filter`.
Les directives utiles des `.htaccess` livrés sont déclarées dans les vhosts,
avec `AllowOverride None`. Vérifier `apache2ctl configtest` avant tout
rechargement gracieux et préserver les autres hôtes du serveur.

## Domaines de développement

Les fichiers HTML/XML/texte d'origine contiennent encore les trois domaines
définitifs, contrairement à l'indication dans le README de livraison. Le filtre
Apache les remplace dans les réponses par les trois adresses `tobedev.com`,
y compris les liens entre langues, canonical et sitemaps. Les originaux restent
inchangés dans Git et sur le disque. Les autres liens externes sont conservés.

L'en-tête `X-Robots-Tag: noindex, nofollow` demande aux moteurs de ne pas indexer
ces versions de développement. Les lecteurs Calaméo et les scripts intégrés
sont conservés. Les variantes `www` et les domaines définitifs ne sont pas
configurés par ces modèles.

## Formulaires reportés

L'utilisateur a choisi d'activer les formulaires lors du passage sur les domaines
de production. `/contact.php` répond donc volontairement 503 ; les fichiers PHP
ne sont ni exécutés ni exposés comme code source. Le destinataire fictif des
scripts livrés n'a pas été remplacé. Aucune configuration SMTP ni aucun secret
d'envoi n'est versionné.

Pour l'activation future, préparer PHP 8.1+ et mbstring, choisir le service
SMTP/SES et les expéditeurs autorisés, renseigner le destinataire hors de cette
livraison de référence, adapter le traitement PHP dans Apache et vérifier la
réception des messages. Au passage en production, revoir aussi les domaines,
certificats, filtres de substitution et consignes d'indexation.

## Livraison et validation

L'archive `les7cles-mise-en-prod.zip` a pour SHA256 :

```text
2cc43d2ba2ab5b755791dbc680c4536ea8b049e7399ee3b7039adfc79276b99e
```

Les 269 fichiers du dossier Git `les7cles/` ont été comparés octet par octet
avec cette archive. Les sources Astro évoquées dans les documents de livraison
n'étaient pas jointes : le dépôt contient les sites compilés et les scripts PHP
fournis. Il ne contient aucune clé privée, identifiant SMTP ou dépendance installée.

L'installation du 22 octobre 2026 a passé 44 contrôles serveur et 50 contrôles
d'accès public, incluant pages, ressources, langues, RTL hébreu, adaptations
d'URL, redirections et erreurs prévues, ainsi que les deux sites préexistants.
Trois premières réponses publiques 503 sur des ressources ont disparu lors
d'une vérification ciblée ; leur cause n'a pas été établie. Les contrôles publics
passaient par le proxy HTTPS du cloud ; Certbot et les contrôles exécutés sur
AWS ont fourni la validation TLS du serveur. Aucun test visuel automatisé,
envoi de formulaire, test de renouvellement simulé ni redémarrage n'est revendiqué.
