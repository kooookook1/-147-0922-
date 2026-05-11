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
          isActive ? 'text-emerald-400' : 'text-gray-500'
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
                  "w-16 h-16 rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-all duration-300 border border-white/10",
                  "bg-gradient-to-br from-[#1a2333] to-[#0a0e17] text-white",
                  isActive && "scale-110 shadow-[0_0_30px_rgba(16,185,129,0.4)] border-emerald-500/50"
                )}
              >
                <item.icon className="w-8 h-8 brightness-0 invert" style={isActive ? { filter: 'drop-shadow(0 0 8px rgba(16,185,129,0.8))' } : {}} />
              </motion.div>
              <span className={cn(
                "text-[10px] font-black mt-2 transition-colors",
                isActive ? "text-emerald-400" : "text-gray-400"
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
              <span className="text-[10px] font-bold">{item.label}</span>
              {isActive && (
                <motion.div 
                  layoutId="nav-indicator"
                  className="absolute bottom-1 w-1.5 h-1.5 bg-emerald-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,1)]"
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
    <div className="flex flex-col h-screen bg-[#0a0e17] font-sans text-right" dir="rtl">
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
        <nav className="fixed bottom-0 w-full bg-[#131b2c]/90 backdrop-blur-xl flex justify-around items-end h-[75px] px-2 z-40 border-t border-white/10 shadow-[0_-15px_30px_rgba(0,0,0,0.5)]">
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
            className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl shadow-[0_10px_30px_rgba(16,185,129,0.4)] flex items-center justify-center text-white border border-white/20 overflow-hidden relative group"
          >
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
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
            className="fixed bottom-44 right-4 left-4 md:left-auto md:w-[350px] bg-[#131b2c] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] border border-white/10 z-50 flex flex-col h-[420px] overflow-hidden"
          >
            <div className="p-4 bg-gradient-to-r from-[#1a2333] to-[#0a0e17] border-b border-white/10 text-white flex justify-between items-center">
              <div className="flex items-center gap-3">
                 <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-xl flex items-center justify-center border border-emerald-500/30">
                   <MessageSquare size={18} />
                 </div>
                 <div>
                   <h3 className="font-black text-sm tracking-wide">خدمة العملاء (VIP)</h3>
                   <span className="text-[10px] text-emerald-400 font-bold block flex items-center gap-1"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></div> متصل الآن</span>
                 </div>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0a0e17]">
              {chatMessages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                   <MessageSquare size={32} className="mb-3 text-emerald-500/50" />
                   <p className="text-xs font-bold text-gray-300">مرحباً بك في خدمة عملاء ZEA</p>
                   <p className="text-[10px] font-bold text-gray-500 mt-1">تواصل معنا لأي مساعدة</p>
                </div>
              ) : (
                chatMessages.map(msg => (
                  <div key={msg.id} className={`max-w-[85%] p-3.5 rounded-2xl text-[13px] font-bold shadow-sm ${msg.sender === 'user' ? 'bg-gradient-to-br from-emerald-600 to-teal-700 text-white self-start rounded-tr-sm' : 'bg-[#1a2333] border border-white/5 text-gray-200 self-end rounded-tl-sm mr-auto'}`}>
                    {msg.text}
                    <div className={`text-[9px] font-mono mt-1.5 opacity-60 ${msg.sender === 'user' ? 'text-right text-emerald-100' : 'text-left text-gray-400'}`}>
                      {new Date(msg.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-[#131b2c] border-t border-white/5 flex items-center gap-2">
               <input 
                 value={replyText}
                 onChange={(e) => setReplyText(e.target.value)}
                 onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                 placeholder="اكتب رسالتك هنا..." 
                 className="flex-1 py-3 px-4 bg-[#0a0e17] border border-white/10 rounded-xl text-xs font-bold text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 focus:shadow-[0_0_10px_rgba(16,185,129,0.1)] transition-all"
               />
               <button 
                 onClick={handleSendMessage}
                 disabled={!replyText.trim()}
                 className="w-12 h-12 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:bg-emerald-500 transition-all disabled:opacity-50 disabled:scale-100"
               >
                 <Send size={18} className="translate-x-[-2px]" />
               </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}


