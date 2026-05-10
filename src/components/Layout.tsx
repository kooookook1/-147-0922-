import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { HomeIcon, TasksIcon, VIPIcon, RecordIcon, ProfileIcon } from './Icons';
import { MessageSquare, Send, X } from 'lucide-react';
import { cn } from '../utils';
import { databaseService, ChatMessage, User } from '../services/databaseService';
import { motion, AnimatePresence } from 'motion/react';

// Navigation Item Configuration
interface NavItemConfig {
  path: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  special?: boolean;
}

const NAV_ITEMS: NavItemConfig[] = [
  { path: '/home', label: 'الرئيسية', icon: HomeIcon },
  { path: '/tasks', label: 'التوظيف', icon: TasksIcon },
  { path: '/vip', label: 'المنصب', icon: VIPIcon, special: true },
  { path: '/record', label: 'السجل', icon: RecordIcon },
  { path: '/profile', label: 'المركز الشخصي', icon: ProfileIcon },
];

/**
 * Individual Navigation Link Component
 */
const NavItem: React.FC<{ item: NavItemConfig }> = ({ item }) => {
  return (
    <NavLink
      to={item.path}
      className={({ isActive }) =>
        cn(
          'flex flex-col items-center justify-center w-full h-full pb-3 transition-all relative group',
          isActive ? 'text-[#2563eb]' : 'text-[#94a3b8]'
        )
      }
    >
      {({ isActive }) => (
        <>
          {item.special ? (
            <div className="flex flex-col items-center -translate-y-4">
              <motion.div 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "w-16 h-16 rounded-[22px] flex items-center justify-center shadow-xl transition-all duration-300",
                  "bg-gradient-to-br from-[#2563eb] to-[#1e40af] text-white shadow-blue-500/30 ring-4 ring-white",
                  isActive && "scale-110 shadow-blue-600/40"
                )}
              >
                <item.icon className="w-9 h-9 brightness-0 invert" />
              </motion.div>
              <span className={cn(
                "text-[10px] font-black mt-2 transition-colors",
                isActive ? "text-[#2563eb]" : "text-[#94a3b8]"
              )}>
                {item.label}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <motion.div 
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className={cn(
                  "flex items-center justify-center mb-1.5 transition-all duration-300",
                  isActive ? "scale-110" : "group-hover:scale-110"
                )}
              >
                <item.icon className="w-6 h-6" />
              </motion.div>
              <span className="text-[10px] font-black">{item.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="nav-indicator"
                  className="absolute bottom-1 w-1.5 h-1.5 bg-[#2563eb] rounded-full shadow-[0_0_8px_#2563eb]"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                />
              )}
            </div>
          )}
        </>
      )}
    </NavLink>
  );
}

export default function Layout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState<User | null>(null);
  
  // Chat States
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    const currentUser = databaseService.getCurrentUser();
    if (!currentUser) {
      navigate('/login');
    } else {
      setUser(currentUser);
      setChatMessages(databaseService.getChatMessages(currentUser.id));
    }
  }, [navigate]);

  useEffect(() => {
    // Refresh connection to chat when opened
    let timer: any;
    if (isChatOpen && user) {
      timer = setInterval(() => {
        setChatMessages(databaseService.getChatMessages(user.id));
      }, 3000);
    }
    return () => clearInterval(timer);
  }, [isChatOpen, user]);

  const handleSendMessage = () => {
    if (!user || !replyText.trim()) return;
    databaseService.sendChatMessage({
      userId: user.id,
      sender: 'user',
      text: replyText,
    });
    setReplyText('');
    setChatMessages(databaseService.getChatMessages(user.id));
  };

  return (
    <div className="flex flex-col h-screen bg-[#fcfdfe] font-sans text-right" dir="rtl">
      <main className={`flex-1 overflow-y-auto ${location.pathname !== '/owner-admin' ? 'pb-[75px]' : ''}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={location.pathname}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="w-full h-full"
          >
            <Outlet />
          </motion.div>
        </AnimatePresence>
      </main>
      {location.pathname !== '/owner-admin' && (
        <nav className="fixed bottom-0 w-full bg-white/80 backdrop-blur-xl flex justify-around items-end h-[75px] px-2 z-40 shadow-[0_-10px_30px_rgba(37,99,235,0.06)] border-t border-gray-50">
          {NAV_ITEMS.map((item) => (
            <NavItem key={item.path} item={item} />
          ))}
        </nav>
      )}

      {/* Floating Chat Button */}
      {user && (user.totalInvited !== undefined ? user.totalInvited >= 3 : false) && location.pathname !== '/owner-admin' && (
        <motion.div 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-24 right-4 z-50 pointer-events-auto"
        >
          <button 
            onClick={() => {
              setIsChatOpen(!isChatOpen);
              if (!isChatOpen) setChatMessages(databaseService.getChatMessages(user.id));
            }}
            className="w-16 h-16 bg-[#3b82f6] rounded-[30px] shadow-[0_15px_40px_rgba(59,130,246,0.5)] flex items-center justify-center text-white border-4 border-white overflow-hidden relative group"
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
            {isChatOpen ? <X size={24} className="relative z-10" /> : <MessageSquare size={24} className="relative z-10" />}
          </button>
        </motion.div>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isChatOpen && user && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className="fixed bottom-44 right-4 left-4 md:left-auto md:w-[350px] bg-white rounded-[32px] shadow-2xl border border-gray-100 z-50 flex flex-col h-[400px] overflow-hidden"
          >
            <div className="p-5 bg-gradient-to-r from-blue-600 to-blue-500 text-white flex justify-between items-center rounded-t-[32px]">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                   <MessageSquare size={20} className="text-white" />
                 </div>
                 <div>
                   <h3 className="font-black text-sm">خدمة العملاء</h3>
                   <span className="text-[10px] text-blue-100 font-bold block">متاح للرد الآن</span>
                 </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-40">
                   <MessageSquare size={32} className="mb-2" />
                   <p className="text-xs font-black text-gray-800">لا توجد رسائل سابقة</p>
                   <p className="text-[10px] font-bold text-gray-400">تواصل مع الدعم الفني لأي استفسار</p>
                </div>
              ) : (
                chatMessages.map(msg => (
                  <div key={msg.id} className={`max-w-[85%] p-3.5 rounded-2xl text-[13px] font-bold shadow-sm ${msg.sender === 'user' ? 'bg-blue-600 text-white self-start rounded-tr-none' : 'bg-white border border-gray-100 text-gray-800 self-end rounded-tl-none mr-auto'}`}>
                    {msg.text}
                    <div className={`text-[8px] font-bold mt-1.5 opacity-60 ${msg.sender === 'user' ? 'text-right text-blue-100' : 'text-left text-gray-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-white border-t border-gray-50 flex items-center gap-2">
               <input 
                 value={replyText}
                 onChange={(e) => setReplyText(e.target.value)}
                 onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                 placeholder="اكتب رسالتك..." 
                 className="flex-1 py-3 px-4 bg-gray-50 border border-gray-100 rounded-xl text-xs font-bold focus:outline-none focus:ring-2 focus:ring-blue-500/20"
               />
               <button 
                 onClick={handleSendMessage}
                 disabled={!replyText.trim()}
                 className="w-10 h-10 bg-blue-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
               >
                 <Send size={16} />
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

