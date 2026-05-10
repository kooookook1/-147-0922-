import { motion } from 'motion/react';
import { Sparkles } from 'lucide-react';

export default function ZeaLogo({ className = "" }: { className?: string }) {
  return (
    <motion.div 
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className={`flex items-center gap-2 ${className}`}
    >
      <div className="w-10 h-10 bg-white rounded-[14px] flex items-center justify-center shadow-lg border border-blue-100">
        <Sparkles size={24} className="text-blue-600" />
      </div>
      <span className="text-2xl font-black tracking-tighter text-white">ZEA</span>
    </motion.div>
  );
}
