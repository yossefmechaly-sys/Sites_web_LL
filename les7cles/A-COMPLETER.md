# Ce qu'il manque / à valider avant la mise en ligne

## Obligatoire

1. **Adresse de réception du formulaire.** Dans `contact.php` de chacun des 3 dossiers (`fr/`, `en/`, `he/`), remplacer `CHANGER@exemple.com` à la ligne `const CONTACT_TO`. Tant que ce n'est pas fait, aucun message n'est envoyé. Les 3 versions peuvent utiliser la même adresse.
2. **Envoi d'e-mails du serveur.** `contact.php` utilise la fonction PHP `mail()`. L'expéditeur est déjà réglé sur `site@<domaine>` pour chaque version (`CONTACT_FROM`). Pour éviter le dossier spam : adresse expéditeur existante ou autorisée, et enregistrements SPF/DKIM du domaine. Si le serveur n'envoie pas de mail (cas courant sur AWS EC2), il faut passer par un service d'envoi (Amazon SES, SMTP du domaine) : à me demander, c'est une petite modification de `contact.php`.
3. **HTTPS et DNS** des 3 domaines, dont le domaine hébreu en punycode.

## À faire relire / valider

4. **Traduction hébraïque d'origine.** Les textes hébreux reprennent mot pour mot l'ancien site, dont la traduction est maladroite à plusieurs endroits (par exemple « סיפורו של רפאל הוא כי עבור כל אחד מאיתנו »). Une relecture par un locuteur natif est recommandée.
5. **Textes que j'ai rédigés** (absents de l'ancien site), à faire relire, surtout en anglais et en hébreu :
   - bandeau cookies et mentions légales (les 3 langues) ;
   - messages du formulaire (envoi, succès, erreur, champ invalide) ;
   - sous-titre de la section contact en hébreu ;
   - libellés du widget d'accessibilité ;
   - descriptions de page (balise « description » pour Google et réseaux sociaux).
6. **Mentions légales.** Éditeur : Laurent Levy (aucune adresse indiquée). Conception, développement et hébergement : TOBEWEB (coordonnées reprises de https://tobeweb.eu/mentions-legales/), hébergeur AWS. À confirmer : éditeur et directeur de la publication, et hébergeur réel de ce site.
7. **Liens du pied de page.** « Jerusalem Rent » pointe vers `?lang=fr` (FR, EN) et `?lang=he` (HE) ; vérifier que le paramètre hébreu existe. Le lien Tobeweb pointe vers https://tobeweb.eu/.
8. **Liens du livre.** Amazon (FR : amazon.fr ; EN et HE : amazon.com) et lecteur Calaméo : repris de l'ancien site, à tester. Le lien amazon.fr a été nettoyé de ses paramètres de suivi.

## Points d'attention

9. **Statistiques.** Aucun outil de mesure d'audience n'est installé. Le bandeau cookies et les mentions légales indiquent donc « aucun cookie de suivi ». Si Google Analytics ou autre est ajouté plus tard, mettre à jour ces textes et le bandeau.
10. **Déclaration d'accessibilité.** Le site a une barre d'outils d'accessibilité (taille du texte, contrastes, polices, liens soulignés), mais pas de déclaration d'accessibilité. En Israël une déclaration (הצהרת נגישות) est en principe exigée : à rédiger avec le client.
11. **Image de partage et icône.** L'image affichée lors d'un partage sur les réseaux est la couverture du livre sur fond blanc ; l'icône de l'onglet est le portrait de l'auteur. À remplacer si le client préfère autre chose.
12. **Anciennes pages WordPress.** Seules l'accueil et `/livre/` existaient. Pas de redirection nécessaire.
13. **Ancien site à conserver temporairement** (sauvegarde) quelques semaines après la bascule.
