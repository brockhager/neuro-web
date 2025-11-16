import React from 'react';
import Chat from '../components/Chat';

const ChatPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <Chat />
      </div>
    </div>
  );
};

export default ChatPage;
