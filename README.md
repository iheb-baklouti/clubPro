# ClubPro

Application de gestion de club de football amateur / semi-pro : effectifs, calendrier de
matchs, entraînements, tâches bénévoles, cotisations, messagerie interne, et un module
d'analyse tactique 3D (formations, timeline, simulations, comparaison).

## Stack

- **Framework** : Next.js 15 (App Router, React Server Components), TypeScript strict
- **UI** : Tailwind CSS + shadcn/ui (Radix primitives)
- **Base de données / Auth** : Supabase (Postgres, Auth, Row Level Security, Storage)
- **Formulaires** : react-hook-form + zod
- **Graphiques** : Recharts
- **3D** : Three.js + React Three Fiber + drei
- **Export** : jsPDF (rapports PDF), CSV natif (effectifs, stats, calendrier)
- **Déploiement** : Vercel

## Fonctionnalités

### Gestion du club (Direction / Coach)

- Équipes, effectifs et fiches joueurs (statut, poste, avatar généré, photo optionnelle)
- Calendrier des matchs : convocations, disponibilités, résultats, statistiques par
  joueur, export iCal, export CSV
- Entraînements : type de séance, exercices liés (bibliothèque de drills), présences
- Tâches bénévoles assignables à un membre du staff ou à un joueur
- Cotisations (suivi des paiements) et messagerie interne (club ou par équipe)
- Utilisateurs & rôles : invitations par email, rôles `direction` / `coach` /
  `staff_medical` / `admin`, isolation multi-club via RLS

### Module tactique 3D

- **Formations** : éditeur de formation 3D (glisser-déposer joueurs/ballon, flèches,
  suggestion automatique), bibliothèque de formations réutilisables, panneau de
  statistiques (radar) au clic sur un joueur
- **Timeline tactique** : instantanés horodatés d'un match, lecture avec interpolation
  entre deux instantanés, vidéo YouTube synchronisée avec le curseur
- **Simulations** : séquences tactiques réutilisables (corner, pressing...) indépendantes
  d'un match, avec leur propre lecteur
- **Comparaison de formations** : deux formations (modèles ou matchs) affichées côte à
  côte
- **Schémas d'entraînement 3D** : placement de plots/joueurs et flèches pour illustrer un
  exercice

> Les instantanés et séquences sont saisis manuellement par le staff : il n'y a pas de
> suivi vidéo ou de capture de mouvement réelle. L'animation entre deux instantanés est
> une interpolation, pas un replay de données captées.

### Intégrations externes (gratuites)

- **Météo du jour de match** (Open-Meteo, sans clé) sur la fiche d'un match à venir
- **Classement réel d'un championnat** (football-data.org) sur le tableau de bord
  Direction — nécessite une clé gratuite, voir ci-dessous
- **Avatars joueurs** générés localement (couleur + initiales, sans appel réseau) en
  l'absence de photo

## Démarrage

### Prérequis

- Node.js 20+
- Un projet [Supabase](https://supabase.com) (gratuit)
- Le [CLI Supabase](https://supabase.com/docs/guides/cli) (`npx supabase@latest`)

### Installation

```bash
npm install
cp .env.example .env.local
```

Renseigner dans `.env.local` :

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | URL du projet Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Clé publique (anon) Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Clé secrète Supabase — jamais exposée au client, utilisée uniquement dans les Server Actions |
| `NEXT_PUBLIC_SITE_URL` | URL de l'app (`http://localhost:3000` en local) |
| `FOOTBALL_DATA_API_KEY` | Optionnel — clé gratuite [football-data.org](https://www.football-data.org/client/register) pour le classement réel sur le tableau de bord. Sans clé, le widget ne s'affiche simplement pas |

### Base de données

Les migrations sont dans `supabase/migrations/`. Pour les appliquer sur un projet lié :

```bash
npx supabase@latest link --project-ref <ref-du-projet>
npx supabase@latest db push
npm run db:types   # régénère lib/types/database.types.ts après toute migration
```

La sécurité repose entièrement sur les policies RLS (jamais de vérification côté client
seule) : isolation par `club_id`, écriture réservée aux rôles coach/direction/admin selon
les tables, garde-fou anti-escalade de privilèges sur `profiles`.

### Lancer le projet

```bash
npm run dev
```

## Scripts

| Commande | Description |
|---|---|
| `npm run dev` | Serveur de développement |
| `npm run build` | Build de production |
| `npm run start` | Démarre le build de production |
| `npm run lint` | ESLint |
| `npm run typecheck` | Vérification TypeScript sans émission |
| `npm run db:types` | Régénère les types TypeScript depuis le schéma Supabase lié |

## Structure du projet

```
app/
  (auth)/            Connexion, inscription, définition du mot de passe
  (dashboard)/        Espace connecté (layout partagé, garde de session)
    direction/         Tableau de bord direction
    coach/              Tableau de bord coach / staff médical
    equipes/            Équipes et fiches joueurs
    calendrier/         Matchs, formation 3D, timeline tactique
    entrainements/      Séances et présences
    drills/             Bibliothèque d'exercices + schémas 3D
    simulations/        Séquences tactiques réutilisables + comparaison
    taches/ cotisations/ messagerie/ utilisateurs/
components/
  ui/                 Primitives shadcn/ui
  features/           Composants métier, un dossier par domaine
lib/
  supabase/           Clients (browser/serveur/admin), session, helpers de mutation
  formations.ts       Modèle de données FormationData + interpolation
  validations/        Schémas zod par domaine
supabase/
  migrations/         Schéma SQL versionné (source de vérité de la base)
```

## Notes

- Aucun commit n'est fait automatiquement : ce dépôt est mis à jour explicitement.
- Le stack ci-dessus est volontairement restreint (pas de framework 3D alternatif, pas
  d'assistant IA) — toute extension notable est discutée avant d'être ajoutée.
