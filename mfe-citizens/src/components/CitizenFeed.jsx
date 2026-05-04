import React, { useState, useEffect, useRef } from 'react';
import eventBus from 'shared/eventBus';
import './CitizenFeed.css';

const PANIC_POSTS = {
  calm: [
    { text: "La vue depuis Zone A ce soir...", delay: 4000 },
    { text: "Cafe au Blue Moon, comme d'hab", delay: 4000 },
    { text: "Les neons sont beaux ce soir", delay: 5000 },
  ],
  storm: [
    { text: "Il pleut un truc violet... ca brule ??", delay: 2000 },
    { text: "C'est pas normal ce ciel...", delay: 2000 },
    { text: "Toxicite en hausse!", delay: 2000 },
  ],
  blackout: [
    { text: "COUPURE CHEZ MOI !!", delay: 1000 },
    { text: "Les ascenseurs bloques!!", delay: 1000 },
    { text: "TOUT EST NOIR", delay: 1000 },
    { text: "Qui a du courant??", delay: 1000 },
  ],
  riot: [
    { text: "ANONYMOUS EST LA", delay: 1000 },
    { text: "CHAOS EN LIGNE!!", delay: 1000 },
    { text: "Tout s'effondre!!", delay: 1000 },
  ],
  love: [
    { text: "C'est magnifique", delay: 3000 },
    { text: "Je comprends pas mais je pleure ??", delay: 3000 },
    { text: "Ressenti de l'amour...", delay: 3000 },
  ],
};

const AVATARS = ['👥', '🤖', '👨', '👩', '👾', '🎭', '🕵️', '💀'];

function generatePost(category = 'calm') {
  const posts = PANIC_POSTS[category] || PANIC_POSTS.calm;
  const post = posts[Math.floor(Math.random() * posts.length)];
  const avatar = AVATARS[Math.floor(Math.random() * AVATARS.length)];
  const user = `@citizen_${Math.floor(Math.random() * 9999)}`;

  return {
    id: Date.now() + Math.random(),
    avatar,
    user,
    text: post.text,
    timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    delay: post.delay,
  };
}

export default function CitizenFeed() {
  const [panicLevel, setPanicLevel] = useState(5);
  const [posts, setPosts] = useState([generatePost('calm')]);
  const [isCrisis, setIsCrisis] = useState(false);
  const [trending, setTrending] = useState('#CalmNight');
  const [onlineCount] = useState(1247);
  const postIntervalRef = useRef(null);

  // TODO: quand panicLevel change, emettre 'crowd:panic'
  // payload: { level: number, trending: string }

  useEffect(() => {
    const generatePostsInterval = () => {
      let category = 'calm';
      let interval = 4000;

      if (panicLevel > 80) {
        category = 'blackout';
        interval = 1000;
      } else if (panicLevel > 60) {
        category = 'riot';
        interval = 1000;
      } else if (panicLevel > 40) {
        category = 'storm';
        interval = 2000;
      }

      postIntervalRef.current = setInterval(() => {
        const newPost = generatePost(category);
        setPosts(prevPosts => {
          const updated = [newPost, ...prevPosts];
          return updated.slice(0, 20);
        });
      }, interval);
    };

    generatePostsInterval();

    return () => {
      if (postIntervalRef.current) {
        clearInterval(postIntervalRef.current);
      }
    };
  }, [panicLevel]);

  useEffect(() => {
    // TODO: ecouter 'power:outage'
    // → passer panicLevel a 87, afficher des posts blackout

    // TODO: ecouter 'weather:change'
    // → panicLevel = 45 + toxicity, afficher des posts storm

    // TODO: ecouter 'hacker:command'
    // Si command = 'riot' → panicLevel 95, posts riot
    // Si command = 'love' → panicLevel 10, posts love
    // Si command = 'reset' → panicLevel 5, posts calm

    return () => {
      // cleanup: unsub de tous les listeners
    };
  }, []);

  const handleSimulate = (type) => {
    console.log('[CitizenFeed] TODO: simulate', type);
  };

  const panicColor = panicLevel > 60 ? '#ff003c' : panicLevel > 40 ? '#ff6b35' : '#00ff88';
  const badgeEmoji = isCrisis ? '🔴' : '🟢';

  return (
    <div className={`citizen-feed ${isCrisis ? 'crisis-mode' : ''}`}>
      <div className="feed-header">
        <span>{badgeEmoji} NEOCITY SOCIAL - {onlineCount} en ligne</span>
        <span style={{ fontSize: '0.7rem', color: panicColor }}>
          PANIC: {panicLevel}% | {trending}
        </span>
      </div>

      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
        <button className="simulate-btn" onClick={() => handleSimulate('storm')}>
          WEATHER
        </button>
        <button className="simulate-btn" onClick={() => handleSimulate('blackout')}>
          BLACKOUT
        </button>
        <button className="simulate-btn" onClick={() => handleSimulate('riot')}>
          RIOT
        </button>
        <button className="simulate-btn" onClick={() => handleSimulate('love')}>
          LOVE
        </button>
        <button className="simulate-btn" onClick={() => handleSimulate('reset')}>
          RESET
        </button>
      </div>

      <div className="panic-bar">
        <div className="panic-fill" style={{ width: `${panicLevel}%`, backgroundColor: panicColor }} />
      </div>

      <div className="feed-posts">
        {posts.map(post => (
          <div key={post.id} className="post">
            <div className="post-avatar">{post.avatar}</div>
            <div className="post-content">
              <div style={{ display: 'flex', gap: '6px' }}>
                <span className="post-user">{post.user}</span>
                <span className="post-ts">{post.timestamp}</span>
              </div>
              <div className="post-text">{post.text}</div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ fontSize: '0.65rem', color: '#4a5568' }}>
        listen: power:outage, weather:change, hacker:command | emit: crowd:panic
      </div>
    </div>
  );
}
