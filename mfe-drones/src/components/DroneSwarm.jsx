import React, { useState, useEffect } from 'react';
import './DroneSwarm.css';
import eventBus from 'shared/eventBus';

const commandMap = {
  storm: 'chaos',
  drones: 'skull',
  riot: 'X',
  love: 'heart',
  blackout: 'off',
  off: 'off',
  reset: 'grid',
};

export default function DroneSwarm() {
  const [formation, setFormation] = useState('grid');

  const changeFormation = (nextFormation) => {
    setFormation(nextFormation);
    // TODO: emettre 'drone:formation' avec { formation: nextFormation }
    console.log('[DroneSwarm] formation changed to:', nextFormation);
  };

  useEffect(() => {
    // TODO: ecouter 'hacker:command'
    // Utiliser commandMap pour convertir command → formation
    // Ex: 'storm' → 'chaos', 'drones' → 'skull', 'love' → 'heart', etc.

    // TODO: ecouter 'power:outage'
    // Si cityPower === 0 ou severity === 'critical' → formation 'off'

    return () => {
      // cleanup: unsub des deux listeners
    };
  }, []);

  return (
    <div className="drone-swarm">
      <div className="drone-header">
        <span>DRONE SWARM</span>
        <span className="formation-status">FORMATION: {formation.toUpperCase()}</span>
      </div>

      <div className="drone-grid">
        {Array.from({ length: 48 }).map((_, i) => (
          <div key={i} className={`drone ${formation}`} />
        ))}
      </div>

      <div className="formation-buttons">
        {['grid', 'skull', 'heart', 'X', 'chaos', 'off'].map((item) => (
          <button
            key={item}
            className={`formation-btn ${formation === item ? 'active' : ''}`}
            onClick={() => changeFormation(item)}
          >
            {item.toLowerCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
