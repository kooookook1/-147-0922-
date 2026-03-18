import { useState } from 'react';
import { ChevronLeft, ClipboardList } from 'lucide-react';

export default function Record() {
  const [activeTab, setActiveTab] = useState('doing');

  const tabs = [
    { id: 'doing', label: 'قيد التنفيذ' },
    { id: 'audit', label: 'مراجعة' },
    { id: 'completed', label: 'مكتمل' },
    { id: 'failed', label: 'فشل' },
  ];

  return (
    <div className="bg-[#f5f7fa] min-h-screen pb-20">
      {/* Header */}
      <div className="bg-white text-gray-800 p-4 text-center text-lg font-bold relative shadow-sm">
        سجل المهام
        <ChevronLeft className="absolute right-4 top-4 w-6 h-6 text-gray-500" />
      </div>

      {/* Tabs */}
      <div className="flex bg-white border-b border-gray-100 sticky top-0 z-10 shadow-sm">
        {tabs.map((tab) => (
          <button 
            key={tab.id}
            className={`flex-1 py-3.5 text-sm font-medium transition-colors relative ${activeTab === tab.id ? 'text-blue-500' : 'text-gray-500'}`}
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
            {activeTab === tab.id && (
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-8 h-1 bg-blue-500 rounded-t-full"></div>
            )}
          </button>
        ))}
      </div>

      {/* Empty State */}
      <div className="flex flex-col items-center justify-center mt-32 text-gray-400">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <ClipboardList className="w-12 h-12 text-gray-300" />
        </div>
        <p className="text-sm font-medium text-gray-500">لا توجد بيانات حالياً</p>
      </div>
    </div>
  );
}
