# Égide — site vitrine

Site statique (HTML, CSS, JavaScript sans dépendance) pour **Égide Events SRL**, société de sécurité événementielle et de placement de stewards, hôtesses et hôtes d'accueil à Bruxelles.

## Identité

| Élément | Choix |
| --- | --- |
| Nom | **Égide** : « sous l'égide de », être sous la protection de quelqu'un |
| Promesse | *Veiller sur la foule. Accueillir chaque invité.* |
| Logo | Un bouclier ouvert dont la tête et le buste forment une silhouette de garde (`assets/img/logo-mark.svg`) |
| Couleurs | Encre de nuit `#0B0F18` (sécurité) · Ivoire `#F1ECE2` (accueil) · Laiton `#D4A55A` (accent) |
| Typographies | Archivo condensé (titres, style signalétique) · Cormorant italique (élégance) · IBM Plex Mono (codes radio, horaires) |

## Pages

- `index.html` : accueil, les deux pôles, types d'événements, méthode (J-30 → J+2), estimateur de dispositif, engagements, FAQ
- `securite-evenementielle.html` : prestations sécurité, plan d'implantation par zones, cadre légal
- `stewards-hotesses.html` : profils, tenues, langues, FAQ
- `contact.html` : formulaire de devis, pré-rempli par l'estimateur
- `mentions-legales.html`, `404.html`

## SEO déjà en place

- Titre, description et URL canonique propres à chaque page, `lang="fr-BE"`
- Open Graph et Twitter Card avec image de partage (`assets/img/og-image.jpg`)
- Données structurées schema.org : LocalBusiness, Service, FAQPage, BreadcrumbList
- `sitemap.xml`, `robots.txt`, manifeste et icônes
- HTML sémantique, accessibilité (contrastes, navigation clavier, mouvements réduits)
- Performance : aucune bibliothèque, polices hébergées localement (pas d'appel à Google, conforme RGPD)
- En-têtes de sécurité HTTP (`_headers` pour Netlify, `vercel.json` pour Vercel)

## À compléter avant la mise en ligne

Tout le contenu est inventé. Remplacez les éléments suivants par les vrais :

1. **Numéro d'autorisation SPF Intérieur** (`16.0000.00`) : dans le pied de page de chaque page et dans `mentions-legales.html`. La mention est obligatoire pour une entreprise de gardiennage.
2. **Numéro BCE / TVA**, adresse du siège, hébergeur (`mentions-legales.html`).
3. **Téléphone** `+32 2 000 00 00` et **e-mail** `contact@egide-events.be` (toutes les pages).
4. **Nom de domaine** `www.egide-events.be` : dans les balises `canonical`/`og:*` de chaque page, `sitemap.xml`, `robots.txt`.
5. **Adresse et coordonnées GPS** dans les données structurées (bloc `application/ld+json` de chaque page).
6. **Formulaire** : créez un formulaire sur [Formspree](https://formspree.io) (ou équivalent) et placez son URL dans l'attribut `data-endpoint` du formulaire de `contact.html`. Sans cela, le bouton ouvre un e-mail pré-rempli.
7. Vérifiez les ratios de l'estimateur (`assets/js/main.js`, objet `PROFILES`) avec votre expérience terrain.

## Mise en ligne

Déposez le dossier tel quel sur Netlify, Vercel, Cloudflare Pages ou tout hébergement statique. Aucun build n'est nécessaire.

Aperçu local :

```bash
python3 -m http.server 8000
# puis http://localhost:8000
```

Après la mise en ligne : déclarez le site dans Google Search Console, envoyez le `sitemap.xml` et créez une fiche **Google Business Profile** à l'adresse de la société. C'est le levier le plus efficace pour les recherches locales du type « sécurité événement Bruxelles ».

## Prochaines étapes conseillées

- Version néerlandaise (`/nl/`) : une grande partie du marché bruxellois et flamand cherche en néerlandais.
- Photos réelles des équipes en mission, qui remplaceront ou compléteront les visuels graphiques.
- Références clients et témoignages réels, avec leur accord.
