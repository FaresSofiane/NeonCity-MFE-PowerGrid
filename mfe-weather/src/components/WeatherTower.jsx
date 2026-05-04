import React, { useState, useEffect } from 'react';
import eventBus from 'shared/eventBus';
import './WeatherTower.css';

const WEATHER_STATES = {
  normal: {
    condition: 'clear',
    temperature: 18,
    toxicity: 0,
    intensity: 0,
    label: 'NORMAL',
    icon: '🌙',
  },
  crisis: {
    condition: 'storm',
    temperature: -3,
    toxicity: 42,
    intensity: 72,
    label: 'CRISE',
    icon: '⚡',
  },
  danger: {
    condition: 'acid',
    temperature: -8,
    toxicity: 87,
    intensity: 95,
    label: 'DANGER',
    icon: '☢️',
  },
  love: {
    condition: 'rainbow',
    temperature: 22,
    toxicity: 0,
    intensity: 10,
    label: 'LOVE',
    icon: '🌈',
  },
};

export default function WeatherTower() {
  const [weather, setWeather] = useState(WEATHER_STATES.normal);

  useEffect(() => {
    // TODO: ecouter l'event 'hacker:command'
    // Quand command = 'storm' → passer en mode CRISE
    // Quand command = 'storm max' → passer en mode DANGER
    // Quand command = 'love' → passer en mode LOVE
    // Quand command = 'reset' → revenir au mode NORMAL
    //
    // Puis, emettre 'weather:change' avec le payload:
    // { condition, intensity, temperature, toxicity }
    //
    // N'oublie pas le cleanup: return () => eventBus.off('hacker:command', handler)

    return () => {
      // cleanup ici
    };
  }, []);

  const handleSimulate = () => {
    // TODO: emettre un event pour simuler une tempete
    console.log('[WeatherTower] simulate button clicked');
  };

  const handleReset = () => {
    // TODO: emettre un event pour reset la meteo
    console.log('[WeatherTower] reset button clicked');
  };

  return (
    <div className={`weather-tower weather-${weather.condition}`}>
      <div className="weather-header">
        <span className="weather-label">WEATHER TOWER</span>
        <span className={`weather-status ${weather.condition}`}>{weather.label}</span>
      </div>

      <div className="weather-content">
        <div className="weather-icon-large">{weather.icon}</div>

        <div className="weather-metrics">
          <div className="metric">
            <span className="metric-label">TEMP</span>
            <span className="metric-value">{weather.temperature}°C</span>
          </div>
          <div className="metric">
            <span className="metric-label">TOXICITY</span>
            <span className="metric-value">{weather.toxicity}%</span>
          </div>
          <div className="metric">
            <span className="metric-label">INTENSITY</span>
            <span className="metric-value">{weather.intensity}%</span>
          </div>
        </div>
      </div>

      <div className="weather-controls">
        <button className="ctrl-btn simulate-btn" onClick={handleSimulate}>
          SIMULATE STORM
        </button>

        {(weather.condition === 'storm' || weather.condition === 'acid') && (
          <button className="ctrl-btn reset-btn" onClick={handleReset}>
            RESET
          </button>
        )}
      </div>

      {weather.condition === 'storm' && <div className="rain-effect" />}
      {weather.condition === 'acid' && <div className="acid-rain-effect" />}
    </div>
  );
}
