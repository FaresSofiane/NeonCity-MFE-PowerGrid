import React, { useState, useEffect, useRef, useCallback } from "react";
import "./PowerGrid.css";
import eventBus from "shared/eventBus";

const ZONES = [
  { id: "A", name: "Downtown Sector", mw: 120 },
  { id: "B", name: "Industrial Bay", mw: 95 },
  { id: "C", name: "Neon Heights", mw: 78 },
  { id: "D", name: "Old Grid", mw: 64 },
  { id: "E", name: "Harbor Lines", mw: 88 },
  { id: "F", name: "Metro Core", mw: 110 },
];

const ZONE_IDS = ZONES.map((z) => z.id);
const ZONE_IDS_REV = [...ZONE_IDS].reverse();

const defaultZoneStates = () =>
  Object.fromEntries(ZONE_IDS.map((id) => [id, "online"]));

function affectedZoneIds(states) {
  return ZONE_IDS.filter(
    (id) => states[id] !== "online" && states[id] !== "love",
  );
}

function emitPowerOutage(states, cityPowerValue) {
  const zones = affectedZoneIds(states);
  const severity = cityPowerValue === 0 ? "total" : "partial";
  eventBus.emit("power:outage", {
    zones,
    severity,
    cityPower: cityPowerValue,
  });
}

function stateFromWeatherIntensity(intensity) {
  const n = Number(intensity ?? 0);
  const states = defaultZoneStates();
  let power = 100;
  if (n >= 80) {
    ["A", "B", "D", "E"].forEach((id) => {
      states[id] = "red";
    });
    power = 34;
  } else if (n >= 50) {
    states.B = "orange";
    states.D = "orange";
    power = 72;
  }
  return { states, power };
}

export default function PowerGrid() {
  const [cityPower, setCityPower] = useState(100);
  const [showFailure, setShowFailure] = useState(false);
  const [zoneStates, setZoneStates] = useState(defaultZoneStates);
  const timersRef = useRef([]);

  const clearTimers = useCallback(() => {
    timersRef.current.forEach(clearTimeout);
    timersRef.current = [];
  }, []);

  const pushTimer = useCallback((fn, ms) => {
    const id = setTimeout(fn, ms);
    timersRef.current.push(id);
  }, []);

  useEffect(() => {
    const onWeather = (data) => {
      clearTimers();
      const { states, power } = stateFromWeatherIntensity(data?.intensity);
      setZoneStates(states);
      setCityPower(power);
      setShowFailure(false);
      emitPowerOutage(states, power);
    };

    const runBlackoutCascade = () => {
      ZONE_IDS.forEach((zoneId, i) => {
        pushTimer(() => {
          const next = { ...defaultZoneStates() };
          for (let j = 0; j <= i; j++) {
            next[ZONE_IDS[j]] = "black";
          }
          const done = i + 1;
          const power = Math.round(
            (100 * (ZONE_IDS.length - done)) / ZONE_IDS.length,
          );
          setZoneStates(next);
          setCityPower(power);
          setShowFailure(done === ZONE_IDS.length);
          emitPowerOutage(next, power);
        }, i * 300);
      });
    };

    const runResetCascade = () => {
      ZONE_IDS_REV.forEach((zoneId, i) => {
        pushTimer(() => {
          const next = {};
          ZONE_IDS.forEach((z) => {
            next[z] = "black";
          });
          for (let j = 0; j <= i; j++) {
            next[ZONE_IDS_REV[j]] = "online";
          }
          const done = i + 1;
          const power = Math.round((100 * done) / ZONE_IDS.length);
          setZoneStates(next);
          setCityPower(power);
          setShowFailure(false);
          emitPowerOutage(next, power);
        }, i * 300);
      });
    };

    const onHacker = (data) => {
      const cmd = data?.command;
      if (!cmd) return;

      if (cmd === "blackout") {
        clearTimers();
        setShowFailure(false);
        runBlackoutCascade();
        return;
      }

      if (cmd === "love") {
        clearTimers();
        const next = Object.fromEntries(ZONE_IDS.map((id) => [id, "love"]));
        setZoneStates(next);
        setCityPower(100);
        setShowFailure(false);
        emitPowerOutage(next, 100);
        return;
      }

      if (cmd === "reset") {
        clearTimers();
        setShowFailure(false);
        runResetCascade();
      }
    };

    const unsubWeather = eventBus.on("weather:change", onWeather);
    const unsubHacker = eventBus.on("hacker:command", onHacker);

    return () => {
      unsubWeather();
      unsubHacker();
      clearTimers();
    };
  }, [clearTimers, pushTimer]);

  const indicatorColor = (status) => {
    switch (status) {
      case "orange":
        return "#ff8800";
      case "red":
        return "#ff003c";
      case "black":
        return "#222";
      case "love":
        return "#00ff88";
      default:
        return "#00ff88";
    }
  };

  const zoneClass = (status) => {
    switch (status) {
      case "orange":
        return "zone zone-warning";
      case "red":
        return "zone zone-critical";
      case "black":
        return "zone zone-offline";
      case "love":
        return "zone zone-love";
      default:
        return "zone zone-online";
    }
  };

  const powerBarStyle = {
    width: `${Math.max(0, Math.min(100, cityPower))}%`,
    background:
      cityPower === 0 ? "#ff003c" : cityPower <= 50 ? "#ff8800" : "#00ff88",
  };

  return (
    <div className="powergrid">
      <div className="grid-header">
        <span className="grid-title">POWER GRID</span>
        <span className="city-power">CITY POWER: {cityPower}%</span>
      </div>

      <div className="power-bar-track">
        <div className="power-bar-fill" style={powerBarStyle} />
      </div>

      {showFailure && <div className="blackout-alert">GRID FAILURE</div>}

      <div className="zones-grid">
        {ZONES.map((z) => {
          const status = zoneStates[z.id];
          return (
            <div key={z.id} className={zoneClass(status)}>
              <div
                className="zone-indicator"
                style={{ background: indicatorColor(status) }}
              />
              <div className="zone-id">ZONE {z.id}</div>
              <div className="zone-name">{z.name}</div>
              <div className="zone-power">{z.mw} MW</div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
