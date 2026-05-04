import React, { useState, useEffect, useRef, useCallback } from 'react';
import eventBus from 'shared/eventBus';
import './UndergroundRadio.css';

const DEFAULTS = {
  frequency: '87.7',
  stationName: 'NEON FM',
  subContext: 'La Voix de la Cite',
  themeColor: 'blue',
  fullMessage: 'Synthwave non-stop. La ville brille pour vous.',
};

export default function UndergroundRadio() {
  const bars = Array.from({ length: 14 });

  const [frequency, setFrequency] = useState(DEFAULTS.frequency);
  const [stationName, setStationName] = useState(DEFAULTS.stationName);
  const [subContext, setSubContext] = useState(DEFAULTS.subContext);
  const [themeColor, setThemeColor] = useState(DEFAULTS.themeColor);
  const [fullMessage, setFullMessage] = useState(DEFAULTS.fullMessage);
  const [displayedMessage, setDisplayedMessage] = useState('');

  const typewriterRef = useRef(null);

  const applyState = useCallback(({ freq, name, sub, color, msg }) => {
    setFrequency(freq);
    setStationName(name);
    setSubContext(sub);
    setThemeColor(color);
    setFullMessage(msg);
  }, []);

  // Typewriter effect
  useEffect(() => {
    setDisplayedMessage('');
    let index = 0;

    if (typewriterRef.current) {
      clearInterval(typewriterRef.current);
    }

    typewriterRef.current = setInterval(() => {
      if (index < fullMessage.length) {
        setDisplayedMessage(fullMessage.slice(0, index + 1));
        index += 1;
      } else {
        clearInterval(typewriterRef.current);
        typewriterRef.current = null;
      }
    }, 40);

    return () => {
      if (typewriterRef.current) {
        clearInterval(typewriterRef.current);
        typewriterRef.current = null;
      }
    };
  }, [fullMessage]);

  useEffect(() => {
    // TODO: ecouter 'weather:change'
    // Si condition = 'storm' → passer en mode ALERTE METEO (couleur rouge, freq 87.7)
    // Emettre 'radio:broadcast' avec { message, frequency, isEmergency: true }

    // TODO: ecouter 'power:outage'
    // Si severity = 'partial' → mode UNDERGROUND (couleur orange, freq 91.3)
    // Si severity = 'total' → mode BLACKOUT (couleur rouge, freq 91.3)
    // Emettre 'radio:broadcast' avec le message approprie

    // TODO: ecouter 'hacker:command'
    // Si command = 'riot' → mode RESISTANCE (couleur rouge, freq 666.6)
    // Si command = 'love' → mode PEACE FM (couleur green, freq 88.8)
    // Si command = 'reset' → revenir aux DEFAULTS
    // Emettre 'radio:broadcast' avec le message approprie

    return () => {
      // cleanup: unsub de tous les listeners
    };
  }, [applyState]);

  const handleSimulate = () => {
    // TODO: simuler un event au choix
    console.log('[UndergroundRadio] simulate button clicked');
  };

  const barColorMap = {
    red: 'linear-gradient(180deg, #ff6b6b 0%, #ff2d2d 55%, #b91c1c 100%)',
    orange: 'linear-gradient(180deg, #ffbe76 0%, #f39c12 55%, #e67e22 100%)',
    green: 'linear-gradient(180deg, #a8ffce 0%, #34d399 55%, #059669 100%)',
    blue: 'linear-gradient(180deg, #8bf6ff 0%, #45b3ff 55%, #2a6fd8 100%)',
  };
  const barGradient =
    barColorMap[themeColor] ||
    'linear-gradient(180deg, #8bf6ff 0%, #45b3ff 55%, #2a6fd8 100%)';
  const isCrisis = frequency !== '87.7';

  return (
    <div className={`underground-radio${isCrisis ? ' crisis' : ''}`}>
      <div className="radio-top">
        <div className="radio-freq">[ {frequency} FM ]</div>
        <div className="radio-top-right">
          <button className="simulate-btn" type="button" onClick={handleSimulate}>
            SIMULATE EVENT
          </button>
          <div className="on-air">
            <span className="on-air-dot" />
            ON AIR
          </div>
        </div>
      </div>

      <div className="radio-station">
        <div className="station-title">{stationName}</div>
        <div className="station-sub">{subContext || ' '}</div>
      </div>

      <div className="vu-meter">
        {bars.map((_, index) => (
          <div
            key={`bar-${index}`}
            className={`vu-bar${isCrisis ? ' vu-bar-intense' : ''}`}
            style={{
              animationDelay: `${index * 0.08}s`,
              background: barGradient,
            }}
          />
        ))}
      </div>

      <div className="radio-message">
        {displayedMessage}
        <span className="typewriter-cursor">|</span>
      </div>
    </div>
  );
}
