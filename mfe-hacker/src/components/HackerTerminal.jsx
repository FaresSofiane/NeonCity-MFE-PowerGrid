import React, { useState } from "react";
import eventBus from "shared/eventBus";
import "./HackerTerminal.css";

export default function Terminal() {
  const [history, setHistory] = useState([]);
  const [command, setCommand] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const cmd = command.trim().toLowerCase();
    const newHistory = [...history, `root@neocity:~$ ${cmd}`];

    // TODO: selon la commande, emettre l'event 'hacker:command'
    // avec le payload: { command: string, level: number }
    //
    // Commandes attendues :
    //   storm     → { command: 'storm', level: 2 }
    //   storm max → { command: 'storm', level: 3 }
    //   blackout  → { command: 'blackout', level: 2 }
    //   riot      → { command: 'riot', level: 2 }
    //   drones    → { command: 'drones', level: 1 }
    //   love      → { command: 'love', level: 1 }
    //   reset     → { command: 'reset', level: 0 }
    //   help      → pas d'event, juste afficher la liste des commandes
    //
    // Utilise eventBus.emit('hacker:command', payload)

    if (cmd === "help") {
      newHistory.push("Commands: storm | storm max | blackout | riot | drones | love | reset");
      setHistory(newHistory);
      setCommand("");
      return;
    }

    // TODO: remplacer ce console.log par eventBus.emit()
    console.log("TODO: emit hacker:command", { command: cmd });
    newHistory.push(`Command '${cmd}' received`);

    setHistory(newHistory);
    setCommand("");
  };

  const handleStorm = () => {
    // TODO: emettre 'hacker:command' pour 'storm'
    console.log("TODO: emit hacker:command storm");
  };

  const handleBlackout = () => {
    // TODO: emettre 'hacker:command' pour 'blackout'
    console.log("TODO: emit hacker:command blackout");
  };

  const handleReset = () => {
    // TODO: emettre 'hacker:command' pour 'reset'
    console.log("TODO: emit hacker:command reset");
  };

  return (
    <div className="terminal">
      <div className="header">
        <div>[ NEOCITY BREACH v2.7 ]</div>
        <div>- CONNECTED</div>
      </div>

      <div className="history">
        {history.map((line, index) => (
          <div key={index}>{line}</div>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="input-line">
        <span>root@neocity:~$ </span>
        <input
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          autoFocus
          autoComplete="off"
        />
      </form>
    </div>
  );
}
