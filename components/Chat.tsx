import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '@neuroswarm/shared';
import { Send, Loader2, Settings, Trophy } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { ScoreCard } from './ScoreCard';

// Extended message type to support custom UI components
interface ExtendedMessage extends ChatMessage {
  type?: 'text' | 'nba-scores';
  data?: any;
}

export const Chat: React.FC = () => {
  const [messages, setMessages] = useState<ExtendedMessage[]>([]);
  const [text, setText] = useState('');
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

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
    if (!text.trim() || isLoading) return;

    const content = text.trim();
    const payload: ExtendedMessage = { sender: 'web', content };

    setText('');
    setMessages(prev => [...prev, payload]);
    setIsLoading(true);

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
        setMessages(prev => [...prev, { sender: 'system', content: `Error: ${textErr}` } as ExtendedMessage]);
      }
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'system', content: 'Network error. Please check your connection.' } as ExtendedMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNbaScores = async () => {
    if (isLoading) return;

    // Add user message to show intent
    setMessages(prev => [...prev, { sender: 'web', content: 'Show me live NBA scores' }]);
    setIsLoading(true);

    try {
      // Call the adapter query endpoint directly
      const res = await fetch('/v1/adapter/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({
          adapter: 'nba-scores',
          params: {} // Empty params = all games today
        })
      });

      if (res.ok) {
        const response = await res.json();

        if (response.success && response.data) {
          // Add system message with the score card data
          setMessages(prev => [...prev, {
            sender: 'system',
            content: 'Here are the latest NBA scores:',
            type: 'nba-scores',
            data: response.data.value
          }]);
        } else {
          setMessages(prev => [...prev, { sender: 'system', content: 'Failed to fetch NBA data.' }]);
        }
      } else {
        setMessages(prev => [...prev, { sender: 'system', content: 'Error connecting to data service.' }]);
      }
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { sender: 'system', content: 'Network error while fetching data.' }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    try {
      const res = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: 'admin', password: 'password' })
      });
      if (res.ok) {
        const data = await res.json();
        setToken(data.token);
        setShowSettings(false);
      }
    } catch (e) {
      console.error('Login failed', e);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800">
      {/* Logo */}
      <div className="flex justify-center pt-6 pb-2 bg-white dark:bg-gray-900">
        <img src="/icon.png" alt="NeuroSwarm" className="w-[300px] h-auto" />
      </div>

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 p-4 border-b border-gray-200 dark:border-gray-800 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Neuro Chat</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">Connected to Swarm Network</p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className={`p-2 rounded-lg transition-colors ${showSettings ? 'bg-gray-100 dark:bg-gray-800 text-neuro-primary' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'}`}
        >
          <Settings size={20} />
        </button>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="bg-gray-50 dark:bg-gray-800/50 p-4 border-b border-gray-200 dark:border-gray-800 animate-in slide-in-from-top-2">
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-medium text-gray-500">Authentication</label>
            <button
              onClick={handleLogin}
              className="text-xs text-neuro-primary hover:underline font-medium"
            >
              Login as Demo User
            </button>
          </div>
          <div className="flex gap-2">
            <input
              className="flex-1 text-sm border rounded-md p-2 bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-neuro-primary/20 outline-none"
              placeholder="Paste your auth token here..."
              value={token}
              onChange={e => setToken(e.target.value)}
            />
            <button
              className="px-3 py-1 text-xs border border-gray-300 dark:border-gray-700 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              onClick={() => setToken('')}
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50 dark:bg-gray-950 scroll-smooth">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-gray-400 opacity-50">
            <div className="w-16 h-16 bg-gray-200 dark:bg-gray-800 rounded-full mb-4 flex items-center justify-center">
              <Send size={24} />
            </div>
            <p>Start a conversation with the swarm</p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div key={i}>
              <MessageBubble message={m} />
              {m.type === 'nba-scores' && m.data && (
                <div className="mb-4 ml-12 max-w-[80%]">
                  <ScoreCard data={m.data} />
                </div>
              )}
            </div>
          ))
        )}

        {isLoading && (
          <div className="flex justify-start mb-4 animate-in fade-in slide-in-from-bottom-2">
            <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 px-4 py-3 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
              <Loader2 size={16} className="animate-spin text-neuro-primary" />
              <span className="text-sm text-gray-500">Thinking...</span>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Quick Actions & Input Area */}
      <div className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">

        {/* Quick Actions Bar */}
        <div className="px-4 pt-3 flex gap-2 overflow-x-auto no-scrollbar">
          <button
            onClick={fetchNbaScores}
            disabled={isLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 text-orange-600 hover:bg-orange-100 border border-orange-200 rounded-full text-xs font-medium transition-colors whitespace-nowrap"
          >
            <Trophy size={12} />
            NBA Scores
          </button>
          {/* Future buttons can go here */}
        </div>

        <div className="p-4">
          <div className="flex gap-2 items-end max-w-4xl mx-auto">
            <textarea
              className="flex-1 border border-gray-300 dark:border-gray-700 rounded-xl p-3 max-h-32 min-h-[50px] resize-none focus:ring-2 focus:ring-neuro-primary/20 focus:border-neuro-primary outline-none bg-transparent"
              value={text}
              onChange={e => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              rows={1}
            />
            <button
              className={`p-3 rounded-xl flex items-center justify-center transition-all ${text.trim() && !isLoading
                ? 'bg-neuro-primary text-white shadow-lg hover:shadow-neuro-primary/25 hover:-translate-y-0.5'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              onClick={send}
              disabled={!text.trim() || isLoading}
            >
              {isLoading ? <Loader2 size={20} className="animate-spin" /> : <Send size={20} />}
            </button>
          </div>
          <div className="text-center mt-2">
            <p className="text-[10px] text-gray-400">
              AI responses are generated by decentralized nodes and verified on Solana.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chat;
