import React, { useReducer, useEffect } from 'react';
import eventBus from 'shared/eventBus';
import { INITIAL, STATES, THRESHOLDS, COMMANDS, POWER_SEVERITY } from '../hospitalConfig';
import './NeoHospital.css';
import ECGDisplay from './ECGDisplay';
import BedsGrid from './BedsGrid';
import StatusBadge from './StatusBadge';
import IntakesLog from './IntakesLog';

function hospitalReducer(state, action) {
  // TODO: implementer le reducer pour chaque type d'event
  // case 'weather:change': si toxicity > THRESHOLDS.toxicity → status 'busy'
  // case 'power:outage': si severity total → status 'critical', generator true
  // case 'crowd:panic': si level > THRESHOLDS.panicLevel → status 'overwhelmed'
  // case 'hacker:command': si love → status 'love', si reset → retour a INITIAL
  return state;
}

export default function NeoHospital() {
  const [state, dispatch] = useReducer(hospitalReducer, INITIAL);

  useEffect(() => {
    // TODO: ecouter 'weather:change'
    // TODO: ecouter 'power:outage'
    // TODO: ecouter 'crowd:panic'
    // TODO: ecouter 'hacker:command'
    //
    // Dispatch vers le reducer avec { type: 'event:name', payload }

    return () => {
      // cleanup: unsub de tous les listeners
    };
  }, []);

  // TODO: emettre 'hospital:alert' quand state change
  // useEffect(() => {
  //   eventBus.emit('hospital:alert', { status, beds, generator });
  // }, [state.status, state.occupied, state.generator]);

  const simulate = () => {
    console.log('[NeoHospital] TODO: simulate panic crisis');
  };

  const rootClass = `neo-hospital${state.love ? ' love-mode' : ''}`;

  return (
    <div className={rootClass}>
      <div className="hospital-header">
        <span>NEO HOSPITAL</span>
        <StatusBadge status={state.status} love={state.love} />
      </div>

      <button className="simulate-btn" onClick={simulate}>
        SIMULATE CRISIS
      </button>

      <div className="hospital-body">
        <ECGDisplay bpm={state.bpm} status={state.love ? 'love' : state.status} generator={state.generator} />
        <BedsGrid occupied={state.occupied} status={state.status} />
      </div>

      <IntakesLog status={state.status} love={state.love} />
    </div>
  );
}
