# NeoCity — Micro-frontend Power Grid (`mfe-powergrid`)

Micro-frontend **Module Federation** du réseau électrique de NeonCity (**Groupe 3**). Il affiche six zones (A–F), le pourcentage de puissance ville et réagit à la météo et au terminal hacker. Il **émet** les événements `power:outage` que consomment les autres MFEs (citoyens, hôpital, etc.).

- **Port de développement** : `3003`
- **Nom du remote Webpack** : `mfePowergrid`
- **Module exposé** : `./PowerGrid` → composant React `PowerGrid`

Contexte projet global : voir [`../README_STUDENT.md`](../README_STUDENT.md) et [`../consigne.md`](../consigne.md).

---

## Prérequis

- **Node.js** (version LTS recommandée)
- Le dépôt cloné avec le dossier commun [`../shared`](../shared) (alias Webpack `shared` → `eventBus.js`)

---

## Installation

```bash
cd mfe-powergrid
npm install
```

---

## Commandes npm

| Commande                      | Description                                                                                                          |
| ----------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| `npm start`                   | Serveur de dev Webpack (`webpack serve`) sur **http://localhost:3003/**                                              |
| `npm run build`               | Build production dans `dist/` + `remoteEntry.js`                                                                     |
| `npm run validate`            | Checklist consigne : build + contrôles statiques + cohérence avec le shell                                           |
| `npm run validate:quick`      | Même chose **sans** build (`--no-build`)                                                                             |
| `npm run validate -- --probe` | En plus : vérifie que **http://localhost:3003/remoteEntry.js** répond (nécessite `npm start` dans un autre terminal) |

---

## Architecture technique

- **React 18** + **Webpack 5** avec **Module Federation** (`@module-federation` via `webpack.container.ModuleFederationPlugin`).
- **React / React-DOM** en `singleton: true` (obligatoire pour éviter les erreurs “Invalid hook call” quand le shell charge le remote).
- Le **bus global** est un singleton sur `window.__NEOCITY_BUS__` : `import eventBus from 'shared/eventBus'`.

Fichiers utiles :

```
mfe-powergrid/
├── package.json
├── webpack.config.js          # port 3003, expose PowerGrid, alias shared
├── public/index.html
├── scripts/
│   └── validate-consigne.js   # validation automatique partielle de la consigne
└── src/
    ├── index.js
    ├── bootstrap.jsx
    └── components/
        ├── PowerGrid.jsx      # logique métier + event bus
        └── PowerGrid.css
```

---

## Contrat d’événements

### Événements **reçus** (`eventBus.on`)

| Événement        | Émetteur typique              | Payload attendu (champs utilisés ici)                                                                    |
| ---------------- | ----------------------------- | -------------------------------------------------------------------------------------------------------- |
| `weather:change` | `mfe-weather` (WeatherTower)  | `{ condition, intensity, temperature, toxicity }` — la logique utilise surtout **`intensity`** (nombre). |
| `hacker:command` | `mfe-hacker` (HackerTerminal) | `{ command: string, level: number }` — seul **`command`** est utilisé : `blackout`, `love`, `reset`.     |

Les autres commandes hacker (`storm`, `riot`, `drones`, …) ne modifient pas ce MFE directement (effet indirect possible via la météo une fois le chaînage complet implémenté).

### Événement **émis** (`eventBus.emit`)

| Événement      | Payload                                                                  | Règle                                                                                                                                                                                                                                  |
| -------------- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `power:outage` | `{ zones: string[], severity: 'partial' \| 'total', cityPower: number }` | `zones` : identifiants des zones **non** `online` et **non** `love`. `severity` : `'total'` si `cityPower === 0`, sinon `'partial'`. Émis après chaque mise à jour métier significative (météo, pas à pas des cascades, `love`, etc.). |

Le fichier [`../shared/eventBus.js`](../shared/eventBus.js) trace chaque `emit` dans la console : `[NeoCity Bus] <event>`.

---

## Comportement métier (résumé)

### Météo (`weather:change`, selon `intensity`)

- **`intensity >= 80`** : zones **A, B, D, E** en état critique (`red`) ; **C, F** restent en ligne ; **cityPower 34 %** ; alerte grille désactivée.
- **`intensity >= 50` et `< 80`** : zones **B, D** en avertissement (`orange`) ; **cityPower 72 %**.
- **`intensity < 50`** : toutes les zones **online** ; **cityPower 100 %**.

Toute nouvelle météo **annule** les timers de cascade en cours (`clearTimers`).

### Hacker (`hacker:command`)

- **`blackout`** : cascade de coupures **A → F**, **300 ms** entre chaque zone ; zones passent `black` ; puissance décroissante jusqu’à **0 %** ; bannière **GRID FAILURE** à la fin.
- **`love`** : toutes les zones en `love`, **100 %**, pas d’alerte ; pas de zones « en panne » dans le payload (`zones` vide côté logique `affectedZoneIds`).
- **`reset`** : cascade de rétablissement **F → A** (300 ms entre chaque) ; zones pas encore rallumées restent `black` jusqu’à leur tour ; **100 %** et tout `online` à la fin.

---

## Tester sans le Shell (standalone)

1. `npm start`
2. Ouvrir **http://localhost:3003/**
3. Ouvrir les **outils développeur** (F12) → onglet **Console**
4. Utiliser la rangée de boutons **WEATHER 50 / 80**, **BLACKOUT**, **LOVE**, **RESET** : ils émettent les mêmes événements que les autres MFEs (`weather:change` / `hacker:command`) pour valider l’UI et les logs du bus.

---

## Intégration avec le Shell

1. Démarrer ce MFE : `npm start` (port **3003**).
2. Dans un autre terminal, depuis **`../shell`** : `npm install` puis `npm start` (port **3000**).
3. Ouvrir **http://localhost:3000** : le shell charge `mfePowergrid@http://localhost:3003/remoteEntry.js`.

Si le remote est indisponible, le shell affiche en principe un message de type « offline » pour PowerGrid (voir `shell/src/App.jsx`).

---

## Validation de la consigne (checklist)

Le script [`scripts/validate-consigne.js`](scripts/validate-consigne.js) vérifie notamment :

- compilation **`npm run build`** (santé Webpack) ;
- présence des **`emit` / `on`** et du **cleanup** dans `useEffect` ;
- **port 3003** et exposition du module ;
- présence du remote **mfePowergrid** sur **3003** dans la config du **shell**.

Les points purement **runtime** (rendu visuel dans le shell, scénarios multi-équipes) restent à valider manuellement.
