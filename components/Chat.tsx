
import React, { useState, useEffect, useRef } from 'react';
import { sendMessageToTutor, initializeChat, isAIEnabled } from '../services/geminiService';
import { ChatMessage, SupportedLanguage } from '../types';
import { TRANSLATIONS } from '../constants';

interface ChatProps {
  language: SupportedLanguage;
}

const Chat: React.FC<ChatProps> = ({ language }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const [hasKey, setHasKey] = useState(false);
  
  const t = (key: string) => TRANSLATIONS[language][key] || TRANSLATIONS['en'][key];

  useEffect(() => {
    setHasKey(isAIEnabled());
    if (isAIEnabled()) {
      const init = async () => {
        const welcome = await initializeChat();
        setMessages(prev => prev.length === 0 ? [{ role: 'model', text: welcome, timestamp: Date.now() }] : prev);
      };
      init();
    } else {
      setMessages(prev => prev.length === 0 ? [{ role: 'system', text: t('aiDisabled'), timestamp: Date.now() }] : prev);
    }
  }, [language]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || !hasKey) return;
    
    const userMsg: ChatMessage = { role: 'user', text: input, timestamp: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const response = await sendMessageToTutor(input);
    
    const aiMsg: ChatMessage = { role: 'model', text: response, timestamp: Date.now() };
    setMessages(prev => [...prev, aiMsg]);
    setIsLoading(false);
  };

  return (
    <div className={`fixed bottom-2 right-2 z-50 flex flex-col items-end transition-all duration-300 ${isOpen ? 'w-[90vw] md:w-80 h-[60vh] md:h-96' : 'w-auto h-auto'}`}>
      
      {/* Toggle Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="bg-black text-imperial-gold border-2 border-imperial-gold/50 p-3 rounded-full shadow-lg hover:bg-stone-900 transition-colors flex items-center gap-2 mb-2"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold hidden md:inline text-imperial-gold">{t('masterTitle')}</span>
            <div className="w-6 h-6 bg-aged-paper rounded-full flex items-center justify-center text-ink-black font-bold font-serif">?</div>
          </div>
        )}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="bg-stone-900 w-full h-full rounded-lg shadow-2xl border-4 border-stone-800 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-stone-950 text-imperial-gold p-2 font-serif text-center border-b border-stone-800 font-bold tracking-widest">
            {t('masterName')}
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-stone-900/95">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-2 rounded-md text-sm font-serif shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-urushi-red text-aged-paper border border-stone-700' 
                    : 'bg-aged-paper text-ink-black border border-gray-400'
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}
            {isLoading && (
               <div className="flex justify-start">
                 <div className="text-xs text-stone-500 italic animate-pulse pl-2">
                   {t('meditating')}
                 </div>
               </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <div className="p-2 bg-stone-950 border-t border-stone-800 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              disabled={!hasKey}
              placeholder={hasKey ? t('chatPlaceholder') : t('chatPlaceholderDisabled')}
              className="flex-1 bg-stone-800 text-aged-paper px-3 py-1 rounded-sm focus:outline-none focus:ring-2 focus:ring-imperial-gold font-serif placeholder-stone-400"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !hasKey}
              className="text-imperial-gold hover:text-white transition-colors"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;
