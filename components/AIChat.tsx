
import React, { useState } from 'react';
import { MessageCircle, X, Send } from 'lucide-react';

export const AIChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<{role: 'user'|'ai', text: string}[]>([ {role: 'ai', text: 'سلام! چطور می‌تونم در مورد سگتون یا خدمات باشگاه کمکتون کنم؟'} ]);
  const [input, setInput] = useState('');

  const handleSend = (e: React.FormEvent) => {
      e.preventDefault();
      if(!input.trim()) return;
      setMessages(prev => [...prev, {role: 'user', text: input}]);
      setInput('');
      setTimeout(() => { setMessages(prev => [...prev, {role: 'ai', text: 'این یک پاسخ هوشمند نمونه است. در نسخه نهایی به API متصل می‌شوم.'}]); }, 1000);
  };

  return (
    <>
      {!isOpen && (<button onClick={() => setIsOpen(true)} className="fixed bottom-6 left-6 bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-4 rounded-full shadow-2xl hover:scale-110 transition-transform z-50 animate-bounce-slow group"><MessageCircle size={28} /><span className="absolute right-full mr-3 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">از من بپرسید</span></button>)}
      {isOpen && (<div className="fixed bottom-6 left-6 w-80 md:w-96 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 z-50 flex flex-col overflow-hidden animate-fade-in-up max-h-[500px]"><div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-4 flex justify-between items-center text-white"><div className="flex items-center gap-2"><div className="bg-white/20 p-1.5 rounded-full"><MessageCircle size={16}/></div><span className="font-bold text-sm">پشتیبانی هوشمند</span></div><button onClick={() => setIsOpen(false)} className="hover:bg-white/20 p-1 rounded transition-colors"><X size={18} /></button></div><div className="flex-1 p-4 overflow-y-auto space-y-3 bg-gray-50 dark:bg-gray-900/50 h-64">{messages.map((msg, idx) => (<div key={idx} className={`flex ${msg.role === 'user' ? 'justify-start' : 'justify-end'}`}><div className={`max-w-[80%] p-3 rounded-2xl text-sm ${msg.role === 'user' ? 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white rounded-br-none shadow-sm border border-gray-100 dark:border-gray-600' : 'bg-blue-600 text-white rounded-bl-none'}`}>{msg.text}</div></div>))}</div><form onSubmit={handleSend} className="p-3 border-t dark:border-gray-700 flex gap-2 bg-white dark:bg-gray-800"><input type="text" value={input} onChange={(e) => setInput(e.target.value)} placeholder="پیام خود را بنویسید..." className="flex-1 bg-gray-100 dark:bg-gray-700 rounded-full px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"/><button type="submit" className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-colors"><Send size={18} className={input ? 'text-white' : 'text-white/50'} /></button></form></div>)}
    </>
  );
};
