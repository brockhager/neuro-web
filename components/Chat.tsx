import React, { useState, useEffect, useRef } from 'react';
import type { ChatMessage } from '@neuroswarm/shared';
import { Send, Loader2, Settings, Trophy, CloudSun, Newspaper, Globe } from 'lucide-react';
import { MessageBubble } from './MessageBubble';
import { ScoreCard } from './ScoreCard';
import { WeatherCard } from './WeatherCard';
import { NewsCard } from './NewsCard';
import { NewsAggregatorCard } from './NewsAggregatorCard';

// Extended message type to support custom UI components
interface ExtendedMessage extends ChatMessage {
  type?: 'text' | 'nba-scores' | 'weather' | 'news' | 'news-aggregator';
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

  const fetchAdapterData = async (adapter: string, label: string, params: any = {}) => {
    if (isLoading) return;

    setMessages(prev => [...prev, { sender: 'web', content: `Show me ${label}` }]);
    setIsLoading(true);

    try {
      const res = await fetch('/v1/adapter/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify({ adapter, params })
      });

      if (res.ok) {
        const response = await res.json();

        if (response.success && response.data) {
          setMessages(prev => [...prev, {
            sender: 'system',
            content: `Here is the latest ${label}:`,
            type: adapter as any,
            data: response.data.value
          }]);
        } else {
          setMessages(prev => [...prev, { sender: 'system', content: `Failed to fetch ${label}.` }]);
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
    <div className="flex h-[calc(100vh-100px)] max-w-5xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden border border-gray-200 dark:border-gray-800">

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
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
                  <div className="mb-4 ml-12 max-w-[80%] animate-in fade-in slide-in-from-bottom-2">
                    <ScoreCard data={m.data} />
                  </div>
                )}
                {(m.type === 'weather' || m.type === 'allie-weather' as any) && m.data && (
                  <div className="mb-4 ml-12 max-w-[80%] animate-in fade-in slide-in-from-bottom-2">
                    <WeatherCard data={m.data} />
                  </div>
                )}
                {(m.type === 'news' || m.type === 'allie-news' as any) && m.data && (
                  <div className="mb-4 ml-12 max-w-[80%] animate-in fade-in slide-in-from-bottom-2">
                    <NewsCard data={m.data} />
                  </div>
                )}
                {(m.type === 'news-aggregator' as any) && m.data && (
                  <div className="mb-4 ml-12 max-w-[80%] animate-in fade-in slide-in-from-bottom-2">
                    <NewsAggregatorCard data={m.data} />
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

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800">
          <div className="flex gap-2 items-end">
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

      {/* Right Sidebar - Quick Actions */}
      <div className="w-48 bg-gray-50 dark:bg-gray-900 border-l border-gray-200 dark:border-gray-800 flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Quick Actions</h3>
        </div>

        <div className="p-3 flex flex-col gap-2 overflow-y-auto">
          <button
            onClick={() => fetchAdapterData('nba-scores', 'NBA scores')}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 hover:bg-orange-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:border-orange-200 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-orange-600 transition-all text-left group shadow-sm"
          >
            <div className="p-1.5 bg-orange-100 text-orange-600 rounded-md group-hover:bg-orange-200 transition-colors">
              <Trophy size={14} />
            </div>
            <span>NBA Scores</span>
          </button>

          <button
            onClick={() => fetchAdapterData('allie-weather', 'local weather', { city: 'San Francisco' })}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 hover:bg-blue-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:border-blue-200 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-blue-600 transition-all text-left group shadow-sm"
          >
            <div className="p-1.5 bg-blue-100 text-blue-600 rounded-md group-hover:bg-blue-200 transition-colors">
              <CloudSun size={14} />
            </div>
            <span>Weather</span>
          </button>

          <button
            onClick={() => fetchAdapterData('allie-news', 'top news')}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 hover:bg-purple-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:border-purple-200 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-purple-600 transition-all text-left group shadow-sm"
          >
            <div className="p-1.5 bg-purple-100 text-purple-600 rounded-md group-hover:bg-purple-200 transition-colors">
              <Newspaper size={14} />
            </div>
            <span>Tech News</span>
          </button>

          <button
            onClick={() => fetchAdapterData('news-aggregator', 'global news')}
            disabled={isLoading}
            className="flex items-center gap-2 px-3 py-2 bg-white dark:bg-gray-800 hover:bg-green-50 dark:hover:bg-gray-700 border border-gray-200 dark:border-gray-700 hover:border-green-200 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-200 hover:text-green-600 transition-all text-left group shadow-sm"
          >
            <div className="p-1.5 bg-green-100 text-green-600 rounded-md group-hover:bg-green-200 transition-colors">
              <Globe size={14} />
            </div>
            <span>Global News</span>
          </button>
        </div>

        <div className="mt-auto p-4 text-[10px] text-gray-400 text-center border-t border-gray-200 dark:border-gray-800">
          <p>Powered by NeuroSwarm Adapters</p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
