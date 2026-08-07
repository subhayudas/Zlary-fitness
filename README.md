# Zlary Fitness - site de coaching

Site de conversion pour Zlary Fitness : page d'accueil éditoriale, tunnel VSL,
tunnel de réservation en huit écrans (cinq questions, calendrier, coordonnées,
confirmation), page résultats et pages légales.

Next.js 16 (App Router) · TypeScript · Tailwind CSS v4 · Zod · Supabase ·
déploiement Vercel.

---

## Table des matières

1. [Démarrage rapide](#1-démarrage-rapide)
2. [⚠ À faire avant le lancement](#2--à-faire-avant-le-lancement)
3. [Structure du projet](#3-structure-du-projet)
4. [Modifier les textes](#4-modifier-les-textes)
5. [Remplacer les photos](#5-remplacer-les-photos)
6. [Ajouter des résultats clients](#6-ajouter-des-résultats-clients)
7. [Connecter Supabase](#7-connecter-supabase)
8. [Configurer Resend](#8-configurer-resend)
9. [Ajouter la vidéo VSL](#9-ajouter-la-vidéo-vsl)
10. [Brancher Google Calendar](#10-brancher-google-calendar)
11. [Configurer les analytics](#11-configurer-les-analytics)
12. [Déployer sur Vercel](#12-déployer-sur-vercel)
13. [Français et anglais](#13-français-et-anglais)
14. [Système de design](#14-système-de-design)
15. [Notes techniques](#15-notes-techniques)

---

## 1. Démarrage rapide

```bash
npm install
```

```bash
cp .env.example .env.local
```

```bash
npm run dev
```

Le site tourne sur http://localhost:3000.

**Tout fonctionne sans aucune variable d'environnement.** La vidéo, l'intégration
Google Calendar et les analytics affichent chacun un état de remplacement soigné
plutôt qu'une erreur, et le calendrier de réservation tourne sur ses horaires par
défaut. Seule exception volontaire : sans Supabase, la réservation retourne une
vraie erreur au lieu d'une fausse confirmation - un créneau jamais enregistré,
c'est un appel auquel personne ne se présente.

Scripts :

| Commande             | Effet                                  |
| -------------------- | -------------------------------------- |
| `npm run dev`        | serveur de développement               |
| `npm run build`      | build de production                    |
| `npm run start`      | sert le build de production            |
| `npm run lint`       | ESLint                                 |
| `npx tsc --noEmit`   | vérification TypeScript                |

---

## 2. ⚠ À faire avant le lancement

Le site a été construit sans inventer un seul fait sur l'entreprise. Tout ce qui
n'était pas connu est marqué dans le code et **n'apparaît pas** sur le site tant
que ce n'est pas rempli. Pour voir la liste complète :

```bash
grep -rn "awaiting(" content/
```

En développement (`npm run dev`), chaque information manquante s'affiche comme
un petit marqueur pointillé « À confirmer : … ». **En production ces marqueurs
sont invisibles** - rien de faux n'est jamais publié.

### Liste de vérification

| Quoi                                   | Où                                        |
| -------------------------------------- | ----------------------------------------- |
| Adresse courriel publique              | `content/site.ts` → `site.email`          |
| Certifications (nom exact + organisme) | `content/site.ts` → `certifications`      |
| Années d'expérience, nombre de clients | `content/site.ts` → `site.facts`          |
| Plateforme de coaching, fréquence des suivis | `content/site.ts` → `site.facts`     |
| Parcours personnel de Zach             | `content/site.ts` → `facts.personalStory` |
| Réponses FAQ manquantes (suivis, durée, prix) | `content/faq.ts`                   |
| Livrables : valider chaque ligne avec Zach | `content/deliverables.ts`             |
| Entité légale, adresse, responsable vie privée | `content/legal.ts`                |
| Domaine réel                           | `NEXT_PUBLIC_SITE_URL`                    |
| Photos                                 | voir §5                                   |
| Base de données                        | voir §7                                   |

Faire relire `/privacy` et `/terms` par un juriste : les textes décrivent
fidèlement ce que le site fait, mais ce ne sont pas des conseils juridiques.

---

## 3. Structure du projet

```
app/                     routes (App Router)
  page.tsx               accueil
  vsl/                   tunnel vidéo
  book/                  redirection vers le tunnel de réservation
  thank-you/             confirmation
  results/               transformations clients
  privacy/  terms/       pages légales
  not-found.tsx          404
  api/availability/      créneaux libres (lecture seule, publique)
  api/bookings/          réservation d'un créneau
  sitemap.ts robots.ts manifest.ts opengraph-image.tsx

content/                 ★ TOUT LE CONTENU ÉDITABLE
components/
  sections/              les 12 sections de l'accueil
  ui/                    primitives du design system
  nav/  form/            navigation et formulaire
lib/                     validation, analytics, sécurité, Supabase
supabase/migrations/     SQL à exécuter une fois
```

Règle : **aucun texte et aucune image n'est codé en dur dans un composant.**
Tout vient de `content/`.

---

## 4. Modifier les textes

Tout est dans `content/`, en français, avec des commentaires :

| Fichier                   | Contenu                                        |
| ------------------------- | ---------------------------------------------- |
| `site.ts`                 | marque, contacts, avertissement santé, faits    |
| `navigation.ts`           | menus, ancres de sections                       |
| `home.ts`                 | tous les textes de la page d'accueil            |
| `method.ts`               | les 4 étapes de la méthode                      |
| `deliverables.ts`         | ce que reçoit le client                         |
| `faq.ts`                  | questions et réponses                           |
| `apply.ts`                | questions du formulaire + options               |
| `case-studies.ts`         | transformations clients                         |
| `vsl.ts` / `booking.ts`   | tunnel vidéo / réservation                      |
| `seo.ts`                  | titres et descriptions par page                 |
| `legal.ts`                | confidentialité, conditions, 404, remerciement  |
| `media.ts`                | toutes les photos                               |

Modifier un texte = modifier une chaîne de caractères. Aucun composant à
toucher. Attention : dans `apply.ts`, les `value` des options sont enregistrées
en base - changer un `label` est sans risque, changer un `value` ne l'est pas.

---

## 5. Remplacer les photos

Toutes les photos sont déclarées dans **`content/media.ts`**. Tant qu'une photo
n'est pas fournie, le site affiche un cadre conçu pour, qui indique le sujet à
photographier, le cadrage, les dimensions et le point focal. Jamais d'image
cassée, jamais de photo d'agence à la place d'une vraie.

Pour publier une photo :

1. exporter au format `.webp` (ou `.jpg`) à la taille recommandée ou plus ;
2. déposer le fichier dans `public/media/` ;
3. dans `content/media.ts`, remplacer `src: null` par `src: "/media/mon-fichier.webp"`.

C'est tout - aucun code de composant à modifier.

### Dimensions recommandées

| Emplacement                  | Format | Dimensions      | Sujet                                       |
| ---------------------------- | ------ | --------------- | ------------------------------------------- |
| `hero`                       | 16:10  | 2880 × 1800     | Zach à l'entraînement, espace libre à gauche |
| `outcomesTraining`           | 4:5    | 1800 × 2250     | mouvement de force en exécution              |
| `methodCoaching`             | 4:3    | 1800 × 1350     | Zach corrigeant un client                    |
| `nutritionContext`           | 1:1    | 1600 × 1600     | repas réel, non stylisé                      |
| `deliverablesLifestyle`      | 4:5    | 1600 × 2000     | vie quotidienne, sac de sport                |
| `aboutPortrait`              | 4:5    | 2000 × 2500     | portrait de Zach, regard caméra              |
| `vslPoster`                  | 16:9   | 2560 × 1440     | image fixe de la vidéo                       |
| `resultsHero`                | 16:9   | 2880 × 1620     | environnement d'entraînement                 |
| avant / après client         | 4:5    | 1200 × 1500     | cadrage strictement identique                |

**Direction artistique :** photos authentiques uniquement, étalonnage naturel ou
légèrement désaturé, hautes lumières chaudes, ombres profondes mais ouvertes.
Pas de HDR marqué, pas de filtre, pas de photo d'agence, aucune transformation
générée ou retouchée.

L'image de partage social (`/opengraph-image`) est générée automatiquement à
partir du wordmark - elle existe donc dès le premier déploiement.

---

## 6. Ajouter des résultats clients

Fichier : **`content/case-studies.ts`** (vide au départ, volontairement).

**Obtenir l'accord écrit du client avant toute publication** - pour les photos
comme pour la citation.

```ts
export const caseStudies: readonly CaseStudy[] = [
  {
    id: "marc",
    displayName: "Marc",            // prénom ou initiales, tels qu'approuvés
    context: "Travailleur de la construction, horaire variable",
    startingPoint: "…",
    obstacle: "…",
    approach: "…",
    duration: "6 mois",             // uniquement si c'est exact
    physicalResult: "…",            // qualitatif, aucune mesure inventée
    lifestyleResult: "…",
    quote: "…",                     // mot pour mot
    before: clientMedia.placeholderBefore("Marc"),
    after: clientMedia.placeholderAfter("Marc"),
    featured: true,
    approved: true,                 // ← l'interrupteur : rien ne s'affiche sans lui
  },
];
```

`approved: false` = invisible partout sur le site. Une fiche en attente
d'autorisation peut donc rester dans le fichier sans risque.

Sans aucune fiche approuvée, l'accueil et `/results` affichent un état vide
soigné qui explique pourquoi - plutôt qu'une preuve inventée.

Règles : aucune mesure inventée, aucune durée fausse, aucune garantie, aucune
allégation médicale, photos avant/après au cadrage et à l'éclairage comparables.

---

## 7. Connecter Supabase

1. Créer un projet sur [supabase.com](https://supabase.com).
2. Dashboard → **SQL Editor** → coller le contenu de
   `supabase/migrations/0001_coaching_applications.sql` → **Run**.
3. Dashboard → **Settings → API**, puis renseigner :

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

⚠ `SUPABASE_SERVICE_ROLE_KEY` contourne la sécurité des lignes. Il ne doit
jamais être préfixé `NEXT_PUBLIC_`, jamais atteindre le navigateur, jamais être
commité.

**Modèle de sécurité :** la table a RLS activé *sans aucune policy* - les clés
publiques ne peuvent donc rien lire ni écrire. Seule la route API, côté serveur,
écrit avec la clé service. Les candidatures se lisent dans le dashboard Supabase.

**Sans Supabase configuré**, l'API répond `503` et le formulaire affiche un
message d'erreur poli. C'est délibéré : un faux « merci » ferait disparaître un
prospect en silence.

---

## 8. Configurer Resend

Optionnel - sert à recevoir un courriel à chaque nouvelle candidature.

1. Créer un compte sur [resend.com](https://resend.com) et générer une clé API.
2. Renseigner :

```
RESEND_API_KEY=re_...
APPLICATION_NOTIFICATION_EMAIL=zach@exemple.com
```

Plusieurs destinataires : séparer par des virgules.

Pour envoyer depuis votre propre domaine, le vérifier dans Resend puis définir
`APPLICATION_NOTIFICATION_FROM="Zlary Fitness <candidatures@votredomaine.com>"`.
Sans cela, l'expéditeur partagé de Resend est utilisé - suffisant pour du
courriel interne.

L'envoi est « au mieux » : si Resend échoue, la candidature reste enregistrée et
le visiteur voit quand même la confirmation. Le courriel utilise l'adresse du
candidat en `reply-to`, donc répondre lui écrit directement.

**Webhook CRM** (optionnel) : `APPLICATION_WEBHOOK_URL` reçoit la candidature
complète en JSON à chaque envoi réussi. HTTPS obligatoire.

---

## 9. Ajouter la vidéo VSL

```
NEXT_PUBLIC_VSL_PROVIDER=youtube        # youtube | vimeo | wistia | file
NEXT_PUBLIC_VSL_URL=dQw4w9WgXcQ         # identifiant OU URL de partage complète
```

Les deux formats sont acceptés - coller l'URL de partage fonctionne.

Pour une vidéo auto-hébergée : `NEXT_PUBLIC_VSL_PROVIDER=file` et
`NEXT_PUBLIC_VSL_URL=/media/presentation.mp4` (fichier dans `public/media/`).

Détails :

- Sans configuration, `/vsl` affiche « Présentation bientôt disponible » - jamais
  un iframe cassé.
- Le lecteur ne se charge qu'au clic sur « lecture » : aucun script tiers ne
  pèse sur le chargement initial.
- Le suivi de progression (25/50/75/100 %) fonctionne uniquement avec `file`,
  seul cas où l'on peut lire de vrais événements de lecture. Les autres
  fournisseurs n'émettent que `vsl_start` - inventer les autres fausserait les
  données du tunnel.
- Le schéma `VideoObject` n'est publié qu'une fois une vraie vidéo configurée.
- Durée affichée : renseigner `duration` dans `content/vsl.ts` une fois connue.

---

## 10. Le calendrier de réservation

Le site ne présente plus le calendrier de quelqu'un d'autre dans un iframe : il
tient le sien. Le tunnel est **une seule suite d'écrans** - cinq questions, le
calendrier, les coordonnées, la confirmation - et se termine sur un rendez-vous
confirmé plutôt que sur un formulaire envoyé.

Un iframe ne peut pas savoir ce qui vient d'être répondu, ne peut pas rendre la
réponse, et ne peut pas être mis en page. Une réservation faite dedans arrive
donc comme un enregistrement séparé à réconcilier à la main. Ici le créneau
choisi n'est qu'une valeur de plus dans la même soumission.

### Les disponibilités

Tout est facultatif : sans aucune variable, le calendrier fonctionne avec les
valeurs par défaut ci-dessous.

| Variable                   | Défaut                                                | Rôle                                        |
| -------------------------- | ----------------------------------------------------- | ------------------------------------------- |
| `BOOKING_TIMEZONE`         | `America/Toronto`                                     | l'horloge de Zach - nommée à l'écran        |
| `BOOKING_DURATION_MINUTES` | `30`                                                  | durée de l'appel                            |
| `BOOKING_BUFFER_MINUTES`   | `15`                                                  | battement de part et d'autre                |
| `BOOKING_LEAD_HOURS`       | `12`                                                  | délai minimum avant un créneau              |
| `BOOKING_HORIZON_DAYS`     | `21`                                                  | jusqu'où le calendrier ouvre (max 120)      |
| `BOOKING_HOURS`            | `mon-fri 09:00-12:00,17:00-20:00; sat 09:00-12:00`    | les heures d'ouverture hebdomadaires        |
| `BOOKING_BLACKOUT_DATES`   | -                                                     | jours fermés, `YYYY-MM-DD` séparés par `,`  |
| `BOOKING_LOCATION`         | appel téléphonique                                    | lieu de l'appel (mettre un lien Zoom/Meet)  |

Format de `BOOKING_HOURS` : des entrées `<jours> <plages>` séparées par `;`. Les
jours s'écrivent `mon`, `mon-fri` ou `mon,wed,fri`; les plages `HH:MM-HH:MM`.
Une valeur illisible retombe sur le défaut plutôt que de n'ouvrir aucune heure -
un calendrier vide se lit comme « complet », ce qui perdrait le contact.

Les heures affichées sont **toujours** celles de Zach, nommées au-dessus de la
grille (« Heures affichées en HAE »). Un visiteur ailleurs voit aussi son heure
locale dès qu'il choisit un créneau : personne ne réserve 17 h pour se présenter
à 20 h.

### Brancher Google Calendar (facultatif)

Sans ça, la réservation est quand même enregistrée, confirmée et envoyée avec son
invitation `.ics` - seul l'événement sur l'agenda de Zach est sauté.

1. Console Google Cloud → créer un **compte de service** → créer une clé JSON.
2. Activer l'**API Google Calendar** sur ce projet.
3. Google Calendar → agenda de Zach → Paramètres → « Partager avec des personnes
   en particulier » → ajouter l'adresse du compte de service avec
   **« Apporter des modifications aux événements »**.
4. Renseigner `GOOGLE_CALENDAR_ID`, `GOOGLE_SERVICE_ACCOUNT_EMAIL` et
   `GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY`.

L'agenda sert alors à deux choses : lire les périodes occupées de Zach (aucun
créneau proposé pendant un cours déjà donné) et y écrire l'appel réservé.

Un compte de service ordinaire ne peut **pas** ajouter d'invité à un événement.
Le candidat est donc invité par le fichier `.ics` joint à son courriel de
confirmation, ce que tous les clients de messagerie savent lire. Sur Google
Workspace uniquement, `GOOGLE_IMPERSONATE_SUBJECT` (avec la délégation à
l'échelle du domaine) active en plus les vraies invitations Google.

### Deux personnes, un créneau

L'index unique sur `slot_start` (migration 0002) est la vraie protection : deux
requêtes peuvent lire « libre » avant que l'une n'écrive. La seconde écriture
échoue, et la route répond « ce créneau vient d'être réservé » en rechargeant le
calendrier - plutôt que de perdre le contact.

Le texte ne laisse jamais entendre que la candidature est acceptée : réserver un
créneau, c'est une conversation, pas une admission.

---

## 11. Configurer les analytics

```
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
NEXT_PUBLIC_GTM_ID=GTM-XXXXXXX
NEXT_PUBLIC_META_PIXEL_ID=1234567890
```

Les trois sont indépendants et facultatifs.

**Aucun script de mesure n'est chargé avant le consentement explicite** du
visiteur via la bannière. Si aucun identifiant n'est renseigné, la bannière ne
s'affiche pas du tout - un bandeau cookies décoratif n'a aucun intérêt. Le
bouton « Refuser » a exactement le même poids visuel que « Accepter »
(exigence de la Loi 25 au Québec).

Événements suivis :

`primary_cta_click` · `secondary_cta_click` · `vsl_open` · `vsl_start` ·
`vsl_progress` · `application_start` · `application_step_complete` ·
`application_submit` · `application_error` · `booking_page_view` ·
`booking_link_click` · `booking_complete`

`booking_complete` n'est pas émis automatiquement : le site ne peut pas savoir
ce qui se passe dans un calendrier tiers. Le déclencher depuis Google Calendar
ou Calendly (page de confirmation / webhook) si la mesure est nécessaire.

Les paramètres UTM sont capturés depuis l'URL, conservés en `sessionStorage`
pour survivre au passage `/vsl → /apply`, et envoyés **dans le corps du
formulaire** - jamais dans une URL, donc jamais dans un journal serveur.

---

## 12. Déployer sur Vercel

1. Pousser le dépôt sur GitHub.
2. [vercel.com/new](https://vercel.com/new) → importer le dépôt. Next.js est
   détecté automatiquement, aucun réglage de build à changer.
3. **Settings → Environment Variables** : ajouter les variables du `.env.example`
   dont vous avez besoin (au minimum `NEXT_PUBLIC_SITE_URL`).
4. Déployer.
5. **Settings → Domains** : brancher le domaine, puis mettre
   `NEXT_PUBLIC_SITE_URL` à jour et **redéployer** (les URL canoniques, le
   sitemap et les métadonnées sociales en dépendent).

Après le premier déploiement : soumettre `https://votredomaine.com/sitemap.xml`
dans Google Search Console.

Les en-têtes de sécurité (`X-Content-Type-Options`, `Referrer-Policy`,
`Permissions-Policy`, HSTS) sont définis dans `next.config.ts`.

---

## 13. Français et anglais

Le site est bilingue. Le français est la langue d'origine et reste **sans
préfixe** (`/`, `/apply`, `/vsl`), l'anglais vit sous `/en/…`. Les deux versions
sont générées à partir des mêmes composants : aucun texte n'est codé en dur, tout
passe par `content/*.ts` (français) et `content/*.en.ts` (anglais), résolus par
`lib/i18n.ts`.

### Le choix de langue du visiteur

À sa toute première visite, le visiteur voit une fenêtre bilingue qui lui demande
sa langue (`components/LanguageGate.tsx`). Sa réponse est enregistrée
**définitivement** dans son navigateur - `localStorage`, plus un cookie
`zlary_locale` recopié à chaque visite (`lib/language-preference.ts`).

Ce choix sert ensuite partout :

| Où                       | Ce qui se passe                                                             |
| ------------------------ | --------------------------------------------------------------------------- |
| Visites suivantes        | `proxy.ts` envoie directement vers `/en/…` si l'anglais a été choisi         |
| Formulaire               | la question « langue préférée » n'est plus posée : la réponse est déjà connue |
| Base de données          | enregistrée dans `preferred_language` sur chaque candidature                  |
| Courriels                | la confirmation au candidat est rédigée dans cette langue (`content/emails.ts`) |
| Webhook CRM              | envoyée en clair dans le champ `locale`                                       |

Le bouton **FR / EN** de la navigation reste maître : il change la langue *et*
réécrit le choix enregistré. Dans le formulaire, un encadré rappelle la langue de
suivi retenue et permet de la corriger sans perdre les réponses déjà saisies.

Ce qui est volontairement **exclu** : aucune détection automatique par
`Accept-Language`, et aucune redirection d'une URL qui nomme déjà sa langue
(`/en/apply` reste `/en/apply` pour tout le monde). Un lien partagé mène donc
toujours les deux personnes à la même page, et les robots d'indexation voient la
version française avec ses balises `hreflang`.

---

## 14. Système de design

Tout est défini dans `app/globals.css`.

**Couleurs**

| Jeton              | Valeur    | Usage                                  |
| ------------------ | --------- | -------------------------------------- |
| `--color-canvas`   | `#E7E9E1` | fond de page                           |
| `--color-surface-pure` | `#FFFFFF` | grandes coquilles de section       |
| `--color-ink`      | `#102D3A` | texte principal                        |
| `--color-lime`     | `#E6FF4D` | CTA, étiquettes, panneaux d'accent     |
| `--color-ink-muted`| `#5A686E` | texte secondaire                       |

`--color-ink-muted` a été assombri par rapport à la valeur suggérée (`#687579`),
qui mesurait 3,89:1 sur le fond canvas - sous le seuil AA de 4,5:1. La valeur
retenue passe partout (canvas 4,63:1 · surface 5,33:1 · blanc 5,68:1).

Le lime ne sert **jamais** de couleur de texte sur blanc - uniquement comme fond,
avec du navy dessus (12,88:1).

**Rayons concentriques** - un élément intérieur suit toujours la courbe de son
parent : coquille 36 px → média 24 px → carte 20 px → pastille 999 px.

**Cartes à double liseré** : enclos teinté canvas + cœur concentrique. Aucune
ombre portée : la profondeur vient de l'écart tonal et d'un liseré de 1 px.

**Mouvement** : `cubic-bezier(0.32, 0.72, 0, 1)`, uniquement `transform` et
`opacity`, apparitions pilotées par `IntersectionObserver` (jamais d'écouteur de
scroll). `prefers-reduced-motion` neutralise tout et affiche le contenu
immédiatement.

**Typographie** : Geist, une seule famille, deux graisses (400 / 500). La
hiérarchie vient de l'échelle, pas de la graisse.

**Icônes** : jeu local dans `components/icons.tsx`, dessiné dans le style
Phosphor « Light » (grille 24, trait 1,25). Écrit à la main plutôt qu'importé :
le site utilise une vingtaine de glyphes et `@phosphor-icons/react` livre chaque
icône comme composant client - un coût réel contre l'objectif « Server
Components par défaut ». Même langage visuel, sans le poids.

---

## 15. Notes techniques

**Tunnel de réservation**

L'ordre des écrans est le produit, pas un détail : cinq questions, puis le
calendrier, puis seulement le nom, le courriel et le téléphone. Qui a répondu à
cinq questions et choisi une heure a déjà investi assez pour qu'un numéro de
téléphone soit la petite demande - les trois mêmes champs en haut de page en
seraient la grosse.

- Validation écran par écran (`lib/validation.ts`) - le même schéma Zod sert au
  navigateur et au serveur ; la validation client est un confort, jamais une
  barrière de sécurité.
- Le créneau envoyé par le navigateur est **re-vérifié** contre l'horaire réel
  avant toute écriture : la page a pu rester ouverte une heure, et la valeur est
  trivialement modifiable.
- Idempotence : un `submissionId` est généré une fois par session et envoyé à
  chaque tentative. Un renvoi après coupure réseau met à jour la même ligne au
  lieu de réserver un deuxième créneau.
- Anti-spam : champ piège invisible + délai minimum de 3 s. Les deux répondent
  `200` sans rien enregistrer, pour qu'un robot ne puisse pas distinguer le
  piège d'un succès.
- Limitation de débit : 5 réservations par IP et par tranche de 10 minutes.
- « Prêt à investir » **étiquette** le contact (`lead_quality` : hot / warm /
  cold) et ne bloque jamais rien. Quelle que soit la réponse, le calendrier
  suit - quelqu'un qui répond « pas pour le moment » et réserve quand même est
  souvent exactement la personne qui vaut une demi-heure.
- Rien n'est confirmé de façon optimiste : l'écran de confirmation n'apparaît
  qu'une fois le créneau réellement réservé, et dit franchement si le courriel
  n'a pas pu partir.
- **Aucune donnée de santé n'est collectée** : ni antécédents, ni blessures, ni
  poids, ni mesures.

**Limitation connue - limitation de débit**

`lib/rate-limit.ts` garde son compteur en mémoire. Sur Vercel, chaque instance a
le sien : la limite est donc par instance, pas globale. C'est un choix assumé -
suffisant contre l'abus scripté basique, et gratuit. Si le formulaire devient
une vraie cible, remplacer le corps de `rateLimit()` par Upstash Redis ou
Vercel KV ; les appels n'ont pas à changer.

**Journalisation**

Le contenu d'une candidature n'est jamais écrit dans les journaux - seulement
des noms de champs et des codes d'erreur. En production, les erreurs renvoyées
sont génériques ; le détail n'apparaît qu'en développement.

**Performance**

Composants serveur par défaut. Le code client se limite à la navigation, au
suivi des CTA, à l'accordéon, au formulaire et à l'observateur d'apparition.
Seule l'image du hero est prioritaire ; le reste est différé. Le lecteur vidéo
et le calendrier ne se chargent qu'à l'interaction ou à l'approche de l'écran.

**Pas de CSP stricte**

`next.config.ts` ne définit pas de Content-Security-Policy complète : le site
charge GTM / GA / Meta Pixel de façon conditionnelle, et une CSP écrite contre
des balises qui peuvent être absentes finit toujours par être désactivée au
premier incident. Une fois la pile analytics figée, ajouter une CSP à `nonce`.
