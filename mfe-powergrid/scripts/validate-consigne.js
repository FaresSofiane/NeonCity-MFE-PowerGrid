/**
 * Validation checklist consigne.md (MFE PowerGrid)
 * - Ce que l'on peut vérifier automatiquement : build, motifs dans le code, alignement Shell.
 * - Ce qui reste manuel : console navigateur, intégration live multi-MFE.
 *
 * Usage :
 *   npm run validate              # build + analyses
 *   npm run validate:quick        # analyses sans build
 *   npm run validate -- --probe   # + si npm start tourne : GET remoteEntry.js
 */

const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");
const http = require("http");

const MFE_ROOT = path.resolve(__dirname, "..");
const SHELL_DIR = path.resolve(MFE_ROOT, "..", "shell");
const POWERGRID_FILE = path.join(
  MFE_ROOT,
  "src",
  "components",
  "PowerGrid.jsx",
);
const WEBPACK_CONFIG = path.join(MFE_ROOT, "webpack.config.js");
const SHELL_WEBPACK = path.join(SHELL_DIR, "webpack.config.js");
const SHELL_APP = path.join(SHELL_DIR, "src", "App.jsx");

const args = process.argv.slice(2);
const NO_BUILD = args.includes("--no-build");
const PROBE = args.includes("--probe");

const results = [];

function ok(label, detail) {
  results.push({ pass: true, label, detail });
}
function fail(label, detail) {
  results.push({ pass: false, label, detail });
}
function skip(label, detail) {
  results.push({ pass: null, label, detail });
}

function read(p) {
  try {
    return fs.readFileSync(p, "utf8");
  } catch {
    return null;
  }
}

function runBuild() {
  const npm = process.platform === "win32" ? "npm.cmd" : "npm";
  const r = spawnSync(npm, ["run", "build"], {
    cwd: MFE_ROOT,
    encoding: "utf8",
    shell: process.platform === "win32",
  });
  if (r.status !== 0) {
    fail(
      "MFE démarre / compile sans erreur (npm run build)",
      (r.stderr || r.stdout || "").slice(-800) || `exit ${r.status}`,
    );
    return false;
  }
  ok(
    "MFE démarre / compile sans erreur (npm run build)",
    "Webpack production OK (équivalent santé avant npm start).",
  );
  return true;
}

function staticCodeChecks(pg) {
  let failed = false;

  if (!pg.includes('eventBus.emit("power:outage"') && !pg.includes("eventBus.emit('power:outage'")) {
    fail(
      "Émettre power:outage (contrat + visible console via le bus)",
      'eventBus.emit("power:outage", …) introuvable dans PowerGrid.jsx',
    );
    failed = true;
  } else {
    ok(
      "Émettre power:outage (contrat + visible console via le bus)",
      "emit présent ; la console affiche [NeoCity Bus] power:outage une fois l’app chargée et les boutons / événements déclenchés (vérif manuelle F12).",
    );
  }

  const hasWeather = /eventBus\.on\(\s*["']weather:change["']/.test(pg);
  const hasHacker = /eventBus\.on\(\s*["']hacker:command["']/.test(pg);
  if (!hasWeather || !hasHacker) {
    fail(
      "Réagir aux événements des autres groupes (weather + hacker)",
      `Listeners manquants : weather:change=${hasWeather}, hacker:command=${hasHacker}`,
    );
    failed = true;
  } else {
    ok(
      "Réagir aux événements des autres groupes (weather + hacker)",
      "Écoute weather:change et hacker:command. Test manuel intégration : lancer Weather (3002) + Hacker (3001) ou le shell sur :3000.",
    );
  }

  const hasCleanup =
    /return\s*\(\)\s*=>\s*\{[\s\S]*?unsubWeather\(\)[\s\S]*?unsubHacker\(\)[\s\S]*?clearTimers\(\)/.test(
      pg,
    );
  if (!hasCleanup) {
    fail(
      "Cleanup useEffect (pas de fuite évidente listeners/timers)",
      "Pattern attendu : return () => { unsubWeather(); unsubHacker(); clearTimers(); }",
    );
    failed = true;
  } else {
    ok(
      "Cleanup useEffect (pas de fuite évidente listeners/timers)",
      "Désabonnements + clearTimers présents. Les fuites réelles se vérifient surtout en navigation répétée / profiler React (manuel avancé).",
    );
  }

  return !failed;
}

function webpackAndShellChecks() {
  const w = read(WEBPACK_CONFIG) || "";
  if (!/port:\s*3003/.test(w) || !/localhost:3003/.test(w)) {
    fail(
      "Cohérence port 3003 (webpack.config.js)",
      "Attendu devServer.port 3003 et publicPath localhost:3003",
    );
  } else {
    ok("Cohérence port 3003 (webpack.config.js)", "Port et publicPath 3003 OK.");
  }

  const sw = read(SHELL_WEBPACK);
  const app = read(SHELL_APP);

  if (!sw || !/mfePowergrid.*3003.*remoteEntry/.test(sw.replace(/\s/g, " "))) {
    fail(
      "Shell charge le remote PowerGrid (webpack du shell)",
      sw
        ? "remote mfePowergrid @ localhost:3003 absent ou illisible"
        : `Dossier shell introuvable : ${SHELL_DIR}`,
    );
  } else if (!app || !/mfePowergrid\/PowerGrid/.test(app) || !/3003/.test(app)) {
    fail(
      "Shell affiche le MFE (App.jsx)",
      app
        ? "import lazy mfePowergrid/PowerGrid ou port 3003 manquant"
        : "App.jsx shell introuvable",
    );
  } else {
    ok(
      "Shell affiche votre MFE correctement (config statique)",
      "remoteEntry + lazy import PowerGrid :3003 présents. Confirmation visuelle : npm start ici + npm start dans shell, ouvrir http://localhost:3000",
    );
  }
}

function probeDevServer() {
  return new Promise((resolve) => {
    const req = http.get(
      "http://localhost:3003/remoteEntry.js",
      { timeout: 4000 },
      (res) => {
        res.resume();
        resolve(res.statusCode === 200);
      },
    );
    req.on("error", () => resolve(false));
    req.on("timeout", () => {
      req.destroy();
      resolve(false);
    });
  });
}

async function main() {
  console.log("NeoCity — validation checklist consigne (mfe-powergrid)\n");

  if (!NO_BUILD) {
    runBuild();
  } else {
    skip(
      "MFE démarre / compile sans erreur (npm run build)",
      "Ignoré (--no-build). Lancez npm run validate sans ce flag.",
    );
  }

  const pg = read(POWERGRID_FILE);
  if (!pg) {
    fail("Fichier PowerGrid.jsx", "Introuvable");
  } else {
    staticCodeChecks(pg);
  }

  webpackAndShellChecks();

  if (PROBE) {
    const live = await probeDevServer();
    if (live) {
      ok(
        "Dev server (optionnel --probe)",
        "http://localhost:3003/remoteEntry.js répond 200 — npm start est actif.",
      );
    } else {
      skip(
        "Dev server (optionnel --probe)",
        "Pas de réponse sur :3003 ; lancez npm start puis npm run validate -- --probe",
      );
    }
  }

  console.log("— Checklist —\n");
  for (const r of results) {
    const mark = r.pass === true ? "[OK]  " : r.pass === false ? "[KO]  " : "[—]  ";
    console.log(`${mark}${r.label}`);
    if (r.detail) console.log(`       ${r.detail}\n`);
  }

  const hasFail = results.some((r) => r.pass === false);
  process.exit(hasFail ? 1 : 0);
}

main();
