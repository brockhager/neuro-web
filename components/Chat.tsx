import React, { useState, useEffect } from 'react';
import type { ChatMessage } from '@neuroswarm/shared';

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState('');
  const [token, setToken] = useState('');

  useEffect(() => {
    // load recent messages from gateway
    (async () => {
      try {
        const res = await fetch('/v1/chat/history', {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined
        });
        if (res.ok) {
          const data = await res.json();
          setMessages(data || []);
        }
      } catch (e) {
        console.warn('Failed to load history', e);
      }
    })();
  }, [token]);

  const send = async () => {
    if (!text) return;
    const payload = { sender: 'web', content: text };
    setText('');
    setMessages(prev => [...prev, payload]);
    try {
      const res = await fetch('/v1/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, data]);
      } else {
        const textErr = await res.text();
        setMessages(prev => [...prev, { sender: 'system', content: `error: ${textErr}` } as ChatMessage]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'system', content: 'Network error' } as ChatMessage]);
    }
  };

  return (
    <div className="p-6 w-full sm:w-[60%] mx-auto min-w-[280px]">
      <h2 className="text-xl font-semibold mb-4">Neuro Chat</h2>
      <div className="border rounded p-4 h-64 overflow-auto bg-white" id="messages">
        {messages.map((m, i) => (
          <div key={i} className="mb-2">
            <strong>{m.sender}:</strong> {m.content}
            {m.cid ? <div className="text-xs text-gray-500">CID: {m.cid} {m.txSignature ? `| ${m.txSignature}` : ''}</div> : null}
          </div>
        ))}
      </div>
      <div className="mt-4 flex gap-2">
        <input className="flex-1 border p-2 rounded" value={text} onChange={e => setText(e.target.value)} placeholder="Message..." />
        <button className="px-4 py-2 bg-gray-800 text-white rounded" onClick={send}>Send</button>
      </div>
      <div className="mt-2 flex gap-2 items-center">
        <input className="border p-2 rounded flex-1" placeholder="JWT Token (optional)" value={token} onChange={e => setToken(e.target.value)} />
        <button className="px-3 py-1 border rounded" onClick={() => setToken('')}>Clear</button>
      </div>
    </div>
  );
};

export default Chat;
