import React from 'react';
import ReactMarkdown from 'react-markdown';
import { User, Bot, AlertCircle } from 'lucide-react';
import type { ChatMessage } from '@neuroswarm/shared';

interface MessageBubbleProps {
  message: ChatMessage;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'web';
  const isSystem = message.sender === 'system';
  
  return (
    <div className={`flex w-full mb-4 ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className={`flex max-w-[80%] ${isUser ? 'flex-row-reverse' : 'flex-row'} items-start gap-2`}>
        
        {/* Avatar */}
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-neuro-primary text-white' : 
          isSystem ? 'bg-red-100 text-red-600' : 'bg-gray-200 text-gray-600'
        }`}>
          {isUser ? <User size={16} /> : isSystem ? <AlertCircle size={16} /> : <Bot size={16} />}
        </div>

        {/* Message Content */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          <div className={`px-4 py-2 rounded-2xl text-sm ${
            isUser 
              ? 'bg-neuro-primary text-white rounded-tr-none' 
              : isSystem
                ? 'bg-red-50 text-red-800 border border-red-100 rounded-tl-none'
                : 'bg-white border border-gray-100 shadow-sm text-gray-800 rounded-tl-none'
          }`}>
            <ReactMarkdown 
              className={`prose prose-sm max-w-none ${isUser ? 'prose-invert' : ''}`}
              components={{
                p: ({node, ...props}) => <p className="m-0" {...props} />,
                a: ({node, ...props}) => <a className="underline hover:text-opacity-80" target="_blank" rel="noopener noreferrer" {...props} />
              }}
            >
              {message.content}
            </ReactMarkdown>
          </div>
          
          {/* Metadata */}
          {message.cid && (
            <div className="mt-1 text-[10px] text-gray-400 flex items-center gap-1">
              <span className="font-mono">CID: {message.cid.slice(0, 8)}...</span>
              {message.txSignature && (
                <>
                  <span>•</span>
                  <a 
                    href={`https://explorer.solana.com/tx/${message.txSignature}?cluster=devnet`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-neuro-primary transition-colors"
                  >
                    View TX
                  </a>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
