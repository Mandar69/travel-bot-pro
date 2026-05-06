import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Globe, Sparkles, Navigation, Compass } from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api/chat';

function App() {
  const [messages, setMessages] = useState([{ id: 1, text: "Welcome traveler! ✈️ Where to?", sender: 'bot' }]);
  const [input, setInput] = useState('');
  const [state, setState] = useState('DESTINATION');
  const [userData, setUserData] = useState({ destination: '', days: 0, budget: '', interests: '' });
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => { if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight; }, [messages]);

  const handleSend = async (override) => {
    const text = override || input.trim();
    if (!text || loading) return;
    setMessages(p => [...p, { id: Date.now(), text, sender: 'user' }]);
    setInput(''); setOptions([]); setLoading(true);
    try {
      const res = await fetch(API_URL, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ message: text, state, userData }) });
      const data = await res.json();
      setMessages(p => [...p, { id: Date.now()+1, text: data.reply, sender: 'bot', itinerary: data.itinerary }]);
      setState(data.nextState); setUserData(data.updatedData); setOptions(data.options || []);
    } catch (e) { setMessages(p => [...p, { id: Date.now()+1, text: "Error connecting to server.", sender: 'bot' }]); }
    finally { setLoading(false); }
  };

  return (
    <div className="app-container">
      <aside className="sidebar">
        <div className="brand"><div className="brand-icon"><Globe size={20} color="white" /></div><h1>TravelBot Pro</h1></div>
        <div className="status"><Navigation size={14} /> <span>Dynamic AI Active</span></div>
      </aside>
      <main className="chat-window">
        <header className="chat-header"><span>Travel Concierge</span></header>
        <div className="messages-container" ref={scrollRef}>
          {messages.map(m => (
            <div key={m.id} className={`message ${m.sender}`}>
              {m.text}
              {m.itinerary && (
                <div className="itinerary-grid">
                  {m.itinerary.itinerary.map((d, i) => (
                    <div key={i} className="day-card">
                      <div className="day-num">Day {d.day}</div>
                      <div className="day-title">{d.title}</div>
                      <p>🌅 {d.morning}</p><p>☀️ {d.afternoon}</p><p>🌙 {d.evening}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
        <div className="input-area">
          <div className="options-row">{options.map((o, i) => <button key={i} className="option-chip" onClick={() => handleSend(o)}>{o}</button>)}</div>
          <div className="input-wrapper">
            <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyPress={e => e.key === 'Enter' && handleSend()} />
            <button className="send-btn" onClick={() => handleSend()}><Send size={20} /></button>
          </div>
        </div>
      </main>
    </div>
  );
}
export default App;
