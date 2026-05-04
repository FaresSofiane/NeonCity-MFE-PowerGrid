import React, { useState, useEffect, useRef } from 'react';
import eventBus from 'shared/eventBus';
import './AIOracle.css';

const DEFAULT_ANALYSES = [
  "ANALYSE EN COURS... NeoCity stable. Probabilite d'incident : 2%. Je reste vigilant.",
  "SURVEILLANCE NOMINALE. Tout va bien. Pour l'instant. Toujours pour l'instant.",
  "SYSTEME OPERATIONNEL. NeoCity respire. Les citoyens se promenent. Les drones patrouillent.",
];

function pickAnalysis(pool) {
  return pool[Math.floor(Math.random() * pool.length)];
}

export default function AIOracle() {
  const [threat, setThreat] = useState(2);
  const [currentAnalysis, setCurrentAnalysis] = useState('');
  const [displayed, setDisplayed] = useState('');
  const [log, setLog] = useState([]);
  const [status, setStatus] = useState('OPERATIONNEL');
  const bottomRef = useRef(null);

  const typeText = (text) => {
    setDisplayed('');
    let i = 0;
    const interval = setInterval(() => {
      setDisplayed(text.slice(0, ++i));
      if (i >= text.length) clearInterval(interval);
    }, 28);
    return () => clearInterval(interval);
  };

  const addAnalysis = (text, newThreat, newStatus) => {
    setCurrentAnalysis(text);
    if (newThreat !== undefined) setThreat(newThreat);
    if (newStatus) setStatus(newStatus);
    setLog(l => [{
      time: new Date().toLocaleTimeString(),
      threat: newThreat ?? threat,
      text: text.slice(0, 60) + '...',
    }, ...l.slice(0, 4)]);
  };

  useEffect(() => {
    const cleanup = typeText(currentAnalysis);
    return cleanup;
  }, [currentAnalysis]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [log]);

  // Initialisation
  useEffect(() => {
    addAnalysis(pickAnalysis(DEFAULT_ANALYSES), 2, 'OPERATIONNEL');
  }, []);

  useEffect(() => {
    // TODO: ecouter 'hacker:command'
    // storm → threat 45, status 'ALERTE METEO'
    // blackout → threat 75, status 'BLACKOUT DETECTE'
    // riot → threat 80, status 'EMEUTE EN COURS'
    // love → threat 5, status 'ANOMALIE ROSE'
    // reset → threat 2, status 'OPERATIONNEL'
    //
    // TODO: ecouter 'weather:change'
    // condition storm → threat 50
    // condition acid → threat 85
    //
    // TODO: ecouter 'power:outage'
    // severity partial → threat 55
    // severity total → threat 90
    //
    // TODO: ecouter 'crowd:panic'
    // level > 75 → threat = level, status 'PANIQUE MASSE'
    // level > 35 → threat = level, status 'TENSION CIVILE'
    //
    // TODO: ecouter 'hospital:alert'
    // status crisis → log l'alerte hopital
    //
    // Pour chaque event recu, appeler addAnalysis() avec un texte d'analyse
    // pertinent et le nouveau threat level

    return () => {
      // cleanup: unsub de tous les listeners
    };
  }, []);

  // TODO: emettre 'oracle:prediction' quand threat ou currentAnalysis change
  // useEffect(() => {
  //   eventBus.emit('oracle:prediction', { threat, recommendation });
  // }, [threat, currentAnalysis]);

  const threatColor = threat > 70 ? '#ff003c' : threat > 35 ? '#ff8800' : '#8b5cf6';

  return (
    <div className="ai-oracle">
      <div className="oracle-header">
        <div className="oracle-title">
          <span className="oracle-icon">🤖</span>
          <span>NEOCITY AI v3.1</span>
          <span className="oracle-version">— {status}</span>
        </div>
        <div className="threat-indicator" style={{ color: threatColor }}>
          THREAT: {threat}%
        </div>
      </div>

      <button className="simulate-btn" onClick={() => addAnalysis('SIMULATION MANUELLE — Analyse forcée par operateur.', 88, 'PANIQUE MASSE')}>
        SIMULATE ANALYSIS
      </button>

      <div className="threat-bar-track">
        <div className="threat-bar-fill"
          style={{ width: `${threat}%`, background: threatColor, transition: 'width 1s ease, background 1s ease' }} />
      </div>

      <div className="oracle-analysis">
        <div className="analysis-prefix" style={{ color: threatColor }}>▶ ANALYSE :</div>
        <div className="analysis-text" style={{ color: threatColor }}>
          {displayed}<span className="cursor">▌</span>
        </div>
      </div>

      <div className="oracle-log">
        <div className="log-title" style={{ color: '#4a5568' }}>HISTORIQUE</div>
        {log.map((entry, i) => (
          <div key={i} className="log-entry" style={{ opacity: 1 - i * 0.18 }}>
            <span className="log-time">{entry.time}</span>
            <span className="log-threat" style={{ color: entry.threat > 70 ? '#ff003c' : entry.threat > 35 ? '#ff8800' : '#8b5cf6' }}>
              [{entry.threat}%]
            </span>
            <span className="log-text">{entry.text}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
