import React, { useMemo, useState } from "react";
import eventBus from "shared/eventBus";
import "./BillboardMatrix.css";

export default function BillboardMatrix() {
  const [hackerCommand, setHackerCommand] = useState(null);
  const [powerOutage, setPowerOutage] = useState(null);
  const [riotIndex, setRiotIndex] = useState(0);
  const [glitchPulse, setGlitchPulse] = useState(false);

  const defaultPanels = [
    { text: "PIXEL COLA - TASTE THE FUTURE", color: "#940c16" },
    { text: "NEON BANK - YOUR CREDITS ARE SAFE", color: "#1f4ed8" },
    { text: "SYNTH WEAR - DRESS LIKE TOMORROW", color: "#5b2d9a" },
  ];

  const riotMessages = useMemo(
    () => ["REVOLUTION - MAINTENANT", "ILS NOUS MENTENT", "REJOIGNEZ-NOUS"],
    [],
  );

  const currentMessage = useMemo(() => {
    if (powerOutage === "total") return "TOTAL BLACKOUT - SYSTEM COMPROMISED";
    if (powerOutage === "partial") return "POWER FAILURE - ZONES OFFLINE";
    if (hackerCommand === "storm") return "STORM WARNING - EVACUATE NOW";
    if (hackerCommand === "riot") return riotMessages[riotIndex % riotMessages.length];
    if (hackerCommand === "love") return "LOVE IS THE ANSWER";
    return null;
  }, [hackerCommand, powerOutage, riotIndex, riotMessages]);

  const currentColor = useMemo(() => {
    if (hackerCommand === "storm") return "#ff8a1f";
    if (hackerCommand === "riot") return "#ff0033";
    if (hackerCommand === "love") return "#ff5aa5";
    if (powerOutage) return "#ff1f3d";
    return null;
  }, [hackerCommand, powerOutage]);

  // TODO: ecouter 'hacker:command'
  // - command = 'storm' → afficher STORM WARNING sur les panneaux
  // - command = 'riot' → cycler entre les 3 messages de revolution
  // - command = 'love' → afficher LOVE IS THE ANSWER
  // - command = 'reset' → revenir aux pubs normales
  //
  // TODO: ecouter 'power:outage'
  // - severity = 'total' → TOTAL BLACKOUT sur les panneaux
  // - severity = 'partial' → POWER FAILURE sur les panneaux
  //
  // TODO: emettre 'billboard:message' a chaque changement
  // payload: { text, glitch: boolean, color: string }
  //
  // N'oublie pas le cleanup des listeners

  const simulateRandomHacker = () => {
    // TODO: declencher un command hacker aleatoire
    console.log('[Billboard] TODO: simulate hacker command');
  };

  const simulateRandomPowerOutage = () => {
    // TODO: declencher une panne de courant aleatoire
    console.log('[Billboard] TODO: simulate power outage');
  };

  return (
    <div className="billboard-matrix">
      <div className="billboard-header">
        <span>BILLBOARD MATRIX</span>
        <span className={"glitch-badge" + (hackerCommand || powerOutage || glitchPulse ? " active" : "")}>
          {hackerCommand !== null ? "HACKING" : powerOutage !== null ? "POWER OUTAGE" : "BROADCAST"}
        </span>
      </div>

      <div className="button-group">
        <button className="simulate-btn" onClick={simulateRandomHacker}>
          SIMULATE HACK
        </button>
        <button className="simulate-btn" onClick={simulateRandomPowerOutage}>
          SIMULATE POWER OUTAGE
        </button>
      </div>

      <div className="panels">
        {defaultPanels.map((panel, index) => (
          <Panel
            key={panel.text}
            index={index}
            text={panel.text}
            crisisText={currentMessage}
            hackerCommand={hackerCommand}
            powerOutage={powerOutage}
            glitchPulse={glitchPulse}
            color={panel.color}
            crisisColor={currentColor}
          />
        ))}
      </div>
    </div>
  );
}

const Panel = ({
  index,
  text,
  crisisText,
  hackerCommand,
  powerOutage,
  glitchPulse,
  color,
  crisisColor,
}) => {
  const isCrisis = Boolean(hackerCommand || powerOutage);
  const isPartialOutage = powerOutage === "partial";
  const isTotalOutage = powerOutage === "total";
  const message = isCrisis && crisisText ? crisisText : text;
  const backgroundStyle = isCrisis
    ? { background: hackerCommand === "love" ? "linear-gradient(120deg, #ff76b8, #ff9a6b)" : crisisColor }
    : { background: color };

  return (
    <div
      className={
        "panel" +
        (isCrisis ? " crisis" : "") +
        (isCrisis ? " glitching" : "") +
        (glitchPulse ? " glitch-pulse" : "") +
        (isPartialOutage && index % 2 === 1 ? " blackout-partial" : "") +
        (isTotalOutage ? " blackout-total" : "")
      }
      style={backgroundStyle}
    >
      <div className="panel-text">{message}</div>
      <div className="panel-scanlines" />
    </div>
  );
};
