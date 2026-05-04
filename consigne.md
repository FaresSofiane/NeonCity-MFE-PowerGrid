NeonCity : Deuxième Projet MFE en équipe

🚀 LAST CHALLENGE : Construisez une ville Cyberpunk en Micro-Frontends ! 🏙️

Vous allez construire une ville cyberpunk en Micro-Frontends.

11 groupes. 11 MFEs. 1 Event Bus. 1 Shell qui assemble tout.

Chaque groupe possède un MFE. Vous codez la logique (emit / on / cleanup). Le JSX et le CSS sont déjà faits.

👥 Affectation des groupes
Groupe 1 : mfe-hacker (port 3001) 💻 Terminal de commandes, déclenche les événements
Groupe 2 : mfe-weather (port 3002) 🌧️ Station météo, réagit aux commandes du hacker
Groupe 3 : mfe-powergrid (port 3003) ⚡ Réseau électrique, cascades de pannes
Groupe 4 : mfe-billboard (port 3004) 📺 Panneaux publicitaires, messages dynamiques
Groupe 5 : mfe-drones (port 3005) 🛸 Essaim de drones, formations visuelles
Groupe 6 : mfe-radio (port 3006) 📻 Radio underground, messages d'urgence
Groupe 7 : mfe-citizens (port 3007) 🧑‍🤝‍🧑 Feed social, réactions des citoyens
Groupe 8: mfe-cctv (port 3008) 📹 Caméras de surveillance, détection d'intrusion

MFE BONUS : +2 pour chaque mfe de plus par un groupe

mfe-traffic (port 3009) 🚦 Contrôle du trafic, feux tricolores
mfe-hospital (port 3010) 🏥 Hôpital, gestion de crise
mfe-oracle (port 3011) 🧠 IA de la ville, analyses et prédictions
⚙️ Comment ça fonctionne
Le Groupe 1 (Hacker) tape une commande (storm, blackout, riot, drones, love, reset).

Cette commande déclenche une cascade :

hacker:command ➡️ WeatherTower réagit
weather:change ➡️ PowerGrid perd des zones
power:outage ➡️ CitizenFeed panique, Hospital se prépare
crowd:panic ➡️ Oracle analyse la situation
Et ainsi de suite...
Règle d'or : Chaque MFE écoute les événements qui le concernent et émet les siens. Personne n'importe le code d'un autre groupe.

📜 Contrats d'événements (Le seul lien entre les MFEs)

🛠️ Ce qu'il faut faire
Ce qui est déjà fait pour vous :
✅ Tout le JSX (structure HTML + CSS) de chaque composant.
✅ Le Shell avec les 11 remotes configurés.
✅ shared/eventBus.js (import eventBus from 'shared/eventBus').
✅ Les ports sont déjà configurés dans chaque webpack.config.js.
Ce que votre groupe doit écrire :
🎯 Les eventBus.emit() pour émettre vos événements.
🎯 Les eventBus.on() pour écouter les événements des autres.
🎯 Le cleanup dans les useEffect (return () => unsub()).
🎯 La logique métier : comment votre MFE réagit aux événements reçus.
(Votre seule documentation : lire le code source de shared/eventBus.js pour l'API).

⏱️ Déroulement du challenge
Phase 1 : Lire le brief, comprendre les événements que votre MFE émet et écoute.
Phase 2 : Coder la logique de votre MFE.
Phase 3 : Assemblage live ! Le Shell branche tous les MFEs.
Phase 4 : Rétro : qu'est-ce qui a marché sans coordination ?
✅ Checklist de validation
[ ] Votre MFE démarre sans erreur (npm start).
[ ] Votre MFE émet ses événements correctement (visible dans la console).
[ ] Votre MFE réagit aux événements des autres groupes.
[ ] Le cleanup est fait (pas de memory leak).
[ ] Le Shell affiche votre MFE correctement.
🚑 Troubleshooting (Si ça casse à l'assemblage)
Votre MFE n'apparaît pas dans le Shell : Vérifiez que le port correspond au webpack.config.js du Shell.
Pas de réaction à un événement : Vérifiez le nom exact (hacker:command, pas hacker:cmd).
"Invalid hook call" : Vérifiez singleton: true dans le bloc shared de votre webpack.config.js.
Console vide : Ajoutez des console.log dans vos handlers pour vérifier que les événements arrivent bien.

Bon courage à tous ! 🦾
