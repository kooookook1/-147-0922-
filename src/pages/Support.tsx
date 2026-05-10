import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, Send, User as UserIcon } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { databaseService, ChatMessage, User } from '../services/databaseService';
import toast from 'react-hot-toast';

export default function Support() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const currentUser = databaseService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
      return;
    }
    setUser(currentUser);
    
    // Load initial messages
    setMessages(databaseService.getChatMessages(currentUser.id));
    
    // Simple polling for new messages (every 3 seconds)
    const interval = setInterval(() => {
        setMessages(databaseService.getChatMessages(currentUser.id));
    }, 3000);
    
    return () => clearInterval(interval);
  }, [navigate]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newMessage.trim()) return;

    databaseService.sendChatMessage({
      userId: user.id,
      sender: 'user',
      text: newMessage.trim(),
    });

    setNewMessage('');
    setMessages(databaseService.getChatMessages(user.id));
  };

  if (!user) return null;

  return (
    <div className="bg-[#f0f5fc] min-h-screen font-sans flex flex-col text-right h-screen" dir="rtl">
      {/* Header */}
      <div className="bg-[#3b82f6] text-white px-5 py-4 flex items-center justify-between shadow-md shrink-0">
        <div className="w-10"></div>
        <h1 className="text-[17px] font-bold flex-1 text-center">مركز الدعم</h1>
        <Link to="/home" className="w-10 flex justify-end">
          <ChevronLeft />
        </Link>
      </div>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 pb-20 space-y-4">
        <div className="text-center">
            <span className="text-xs bg-black/5 text-gray-500 px-3 py-1 rounded-full font-medium">مرحباً بك في مركز دعم منصة ZEA</span>
        </div>
        
        {messages.map((msg) => (
          <motion.div
            key={msg.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex flex-col max-w-[80%] ${msg.sender === 'user' ? 'self-start mr-auto items-start' : 'self-end ml-auto items-end'}`}
          >
            <div className="flex items-end gap-2 mb-1">
                {msg.sender === 'admin' && (
                    <div className="w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center shrink-0 mb-1">
                        <span className="text-blue-600 text-[10px] font-black">Z</span>
                    </div>
                )}
                <div 
                className={`py-2 px-4 rounded-2xl text-[14px] leading-relaxed shadow-sm ${
                    msg.sender === 'user' 
                    ? 'bg-[#1a56db] text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 rounded-tl-none border border-gray-100'
                }`}
                >
                {msg.text}
                </div>
            </div>
            <span className={`text-[10px] text-gray-400 font-medium px-2 ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>
              {new Date(msg.createdAt).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' })}
            </span>
          </motion.div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="bg-white p-4 border-t border-gray-100 shrink-0">
        <form onSubmit={handleSendMessage} className="flex flex-row-reverse gap-2 items-center bg-gray-50 rounded-full p-1.5 border border-gray-200">
          <button 
            type="submit"
            disabled={!newMessage.trim()}
            className="w-10 h-10 bg-[#1a56db] text-white rounded-full flex items-center justify-center disabled:bg-gray-300 disabled:text-gray-500 transition-colors shrink-0 outline-none"
          >
            <Send size={18} className="rotate-180" />
          </button>
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="اكتب رسالتك هنا..."
            className="flex-1 bg-transparent border-none text-sm px-3 py-2 outline-none text-gray-800 placeholder:text-gray-400"
            dir="auto"
          />
        </form>
      </div>
    </div>
  );
}
