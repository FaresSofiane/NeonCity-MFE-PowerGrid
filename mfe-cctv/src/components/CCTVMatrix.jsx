import React, { useState, useEffect } from "react";
import eventBus from "shared/eventBus";
import "./CCTVMatrix.css";

const CAMERAS_DATA = [
  { id: "CAM-A", zone: "Zone Nord", defaultFeed: "RAS — Circulation normale" },
  { id: "CAM-B", zone: "Zone Centrale", defaultFeed: "Marche nocturne actif — 34 civils" },
  { id: "CAM-C", zone: "Port Est", defaultFeed: "Dock 7 — 2 vehicules stationnes" },
  { id: "CAM-D", zone: "Banlieue Sud", defaultFeed: "Patrouille Alpha en transit" },
  { id: "CAM-E", zone: "District K", defaultFeed: "Acces autorise — Zone securisee" },
  { id: "CAM-F", zone: "Underground", defaultFeed: "Flux tunnel normal — 12 km/h" },
];

function getStatusLabel(status) {
  switch (status) {
    case "online": return "REC";
    case "degraded": return "DEGRADE";
    case "hacked": return "INTRUSION";
    case "offline": return "HORS LIGNE";
    default: return "REC";
  }
}

function getOverallStatus(cameras) {
  if (cameras.some((c) => c.status === "hacked")) return "BRECHE DETECTEE";
  if (cameras.some((c) => c.status === "offline")) return "PANNE DETECTEE";
  if (cameras.some((c) => c.status === "degraded")) return "DEGRADATION";
  return "TOUTES OPERATIONNELLES";
}

export default function CCTVMatrix() {
  const [cameras, setCameras] = useState(
    CAMERAS_DATA.map((cam) => ({
      ...cam,
      status: "online",
      feed: cam.defaultFeed,
      drone: false,
    }))
  );
  const [time, setTime] = useState(new Date());
  const [glitching, setGlitching] = useState(false);
  const [droneAlert, setDroneAlert] = useState(false);
  const [breachActive, setBreachActive] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (date) =>
    date.toLocaleTimeString("fr-FR", { hour12: false });

  const triggerGlitch = () => {
    setGlitching(true);
    setTimeout(() => setGlitching(false), 600);
  };

  useEffect(() => {
    // TODO: ecouter 'hacker:command'
    // → certaines cameras passent en hacked, breach actif
    // → auto-reset apres 8 secondes
    //
    // TODO: ecouter 'power:outage'
    // → certaines cameras passent offline, autres degraded
    // → auto-reset apres 8 secondes
    //
    // TODO: ecouter 'drone:formation'
    // → certaines cameras indiquent drone detecte, alert drone
    // → auto-reset apres 8 secondes
    //
    // Utilise eventBus.on() pour ecouter ces events
    // N'oublie pas le cleanup: return () => unsub()

    return () => {
      // cleanup ici
    };
  }, []);

  const simulateBreach = () => {
    triggerGlitch();
    setBreachActive(true);
    // TODO: emettre 'surveillance:breach'
    console.log('[CCTVMatrix] TODO: emit surveillance:breach');
  };

  const overallStatus = getOverallStatus(cameras);

  return (
    <div className="cctv-matrix">
      <button className="simulate-btn" onClick={simulateBreach}>
        SIMULATE BREACH
      </button>

      <div className="cctv-header">
        <span>CCTV MATRIX — NEOCITY SURVEILLANCE</span>
        <span className={`breach-badge${breachActive ? " active" : ""}`}>
          {overallStatus}
        </span>
      </div>

      {droneAlert && (
        <div className="drone-alert">
          ALERTE DRONE — FORMATION DETECTEE EN APPROCHE
        </div>
      )}

      <div className={`cameras-grid${glitching ? " glitching" : ""}`}>
        {cameras.map((cam) => (
          <div key={cam.id} className={`camera camera-${cam.status}`}>
            <div className="camera-header">
              <span className="cam-id">{cam.id}</span>
              <span className={`cam-status ${cam.status}`}>
                {getStatusLabel(cam.status)}
              </span>
            </div>
            <div className="camera-feed">
              {cam.status === "offline" ? (
                <span className="no-signal">NO SIGNAL</span>
              ) : (
                <span className={`feed-text${cam.status !== "online" ? " " + cam.status : ""}`}>
                  {cam.feed}
                </span>
              )}
              {cam.drone && <div className="drone-overlay">DRONE</div>}
            </div>
            <div className="camera-footer">
              <span>{cam.zone}</span>
              <span className="cam-time">{formatTime(time)}</span>
            </div>
            <div className="scanlines" />
          </div>
        ))}
      </div>

      <div style={{ fontSize: "0.65rem", color: "#4a5568" }}>
        listen: hacker:command, power:outage, drone:formation | emit: surveillance:breach
      </div>
    </div>
  );
}
