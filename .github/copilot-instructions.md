# Contexte global
- Projet de rattrapage (2e annee informatique) pour l'application "Driv'n Cook" cote franchise (front web).
- Stack front imposee : React 19.2 + TypeScript + Material UI 6 + Vite? (ici CRA). Respecter niveau d'un etudiant, pas d'over-engineering.
- Backend reference : Quarkus 3.30 / Java 21 expose les endpoints documentes dans `doc/endpoints.md`, DTO dans `doc/dtos.md`, modeles entite dans `doc/entities-design.md` et descriptions fonctionnelles dans `doc/presentation-endpoints.md`.
- Charte graphique de reference : `doc/Charte Graphique EcoDeli (2).pdf` (palette vert profond + argile, look organique premium food-truck).
- Le front doit etre bilingue (FR/EN) en s'appuyant sur i18next + react-i18next, avec des fichiers de traduction locaux et un switch simple.

# Ce qui est deja fait
- Inventaire des ecrans a couvrir (voir `doc/front-features.md`).
- Creation landing page responsive avec MUI (`src/pages/LandingPage.tsx`) + theming personnalise (`src/theme.ts`), integree dans `src/App.tsx`.
- Fonts Roboto chargees, styles globaux legers adaptes a la charte.
- Profil franchisé (`GET/PATCH /franchisees/me`).
- Consultation conditions (`GET /franchise-terms`).
- Gestion candidatures (`/franchise-applications`).
- Entrepots + stocks (`/warehouses`).

# Roadmap / priorites restantes
1. **Navigation & routing** : structurer les futures pages (profil, candidatures, supply-orders, menu, etc.).
2. **Ecrans fonctionnels** (ordre propose, respecter docs `/doc`):
   - Authentification simple (login/signup) en differant la securisation avancee.
   - Profil franchisé (`GET/PATCH /franchisees/me`).
   - Consultation conditions (`GET /franchise-terms`).
   - Gestion candidatures (`/franchise-applications`).
   - Entrepots + stocks (`/warehouses`).
   - Supply orders + rendez-vous (`/supply-orders`, `/appointments`).
   - Menu & plats (`/menus`, `/menu-items`).
   - Commandes clients + cartes fidelite (`/customer-orders`, `/loyalty-cards`).
   - Ventes, revenus, rapports (`/sales`, `/revenues`, `/reports`).
   - Camion/incidents (`/trucks`, `/incidents`).
3. **Etat & requetes API** : mettre en place clients REST (fetch/axios) avec typage DTO.
4. **Auth & guards** : a traiter apres les ecrans de base (stockage token, protection routes).
5. **Internationalisation** : factoriser les textes via i18next (ressources `src/locales/fr|en`) et ajouter un switch langue visible.
6. **Tests legers** : composants critiques (formulaires) avec Testing Library.

# Bonnes pratiques a respecter
- Fonctions composant en arrow functions TypeScript (pas de classes). Typage explicite des props.
- Utiliser MUI `sx` et le theme pour styliser, limiter CSS sur mesure.
- Pas de logique complexe inutile : privilegier composants simples, separation claire (pages, composables, services).
- Tous les textes affiches passent par i18next (`t('...')`), pas de hardcode francais/anglais dans les composants.
- Rappeler les sources fonctionnelles via les docs `/doc`. Garder alignement strict avec DTO/endpoints fournis.
- Garder accessibilite de base (aria labels, contrastes suffisants, responsive mobile/desktop).

# Notes supplementaires
- Ce projet doit rester pedagogique pour un jury de rattrapage : commenter uniquement si besoin pour clarifier une zone non triviale.
- En cas de doute fonctionnel, se referer a `doc/endpoints.md`, `doc/presentation-endpoints.md` et `doc/dtos.md` et citer la ressource.
- Garder la charte graphique (tons verts, argile, fonds sable) et les CTA clairs sur chaque ecran.
- Mentionner dans les merges/commits si une langue n'est pas encore traduite (ex. TODO dans fichiers JSON) pour faciliter le suivi.
