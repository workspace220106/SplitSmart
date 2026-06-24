'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useUserStore } from '@/store/userStore';
import { generateAIResponse } from '@/services/aiService';
import { AIMessage } from '@/types';

export default function FloatingChatbot() {
  const { user, missions } = useUserStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Uplink Established. I'm your AI Agent Manager. Ask me anything about your PacPay stats, market trends, or financial strategy.",
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isThinking, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    const userMsg: AIMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    try {
      const response = await generateAIResponse(input, {
        level: user.level,
        xp: user.xp,
        behaviorScore: user.behaviorScore,
        pacTokens: user.pacTokens,
        monthlyBudget: 2000,
        currentSpending: 850,
        savingsRate: 0.15,
        activeMissions: missions,
        recentTransactions: [],
        streakDays: user.streakDays
      }, messages);

      const aiMsg: AIMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
       console.error("Agent Manager connection error", error);
    } finally {
      setIsThinking(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-[100] flex flex-col items-end">
      {/* Chat Window */}
      <div 
        className={`transition-all duration-300 ease-in-out origin-bottom-right mb-4 ${
          isOpen 
            ? 'scale-100 opacity-100 pointer-events-auto' 
            : 'scale-90 opacity-0 pointer-events-none'
        } w-[360px] h-[500px] max-h-[70vh] bg-[#0c0c0c] border border-outline/30 rounded-3xl shadow-[0_10px_40px_rgba(0,0,0,0.8),0_0_20px_rgba(0,240,255,0.1)] flex flex-col overflow-hidden relative`}
      >
        {/* Subtle glow background inside */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-secondary/5 to-transparent pointer-events-none"></div>
        
        {/* Messages Area */}
        <div 
          ref={scrollRef}
          className="flex-grow overflow-y-auto p-5 space-y-5 scrollbar-hide relative z-10"
        >
          {messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] relative p-4 rounded-2xl text-[13px] leading-relaxed font-body transition-all ${
                msg.role === 'user' 
                  ? 'bg-[#183944] border border-[#235868] text-white ml-auto rounded-tr-sm shadow-md' 
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-tl-sm shadow-md'
              }`}>
                {msg.content}
                <div className="mt-2 text-[9px] font-mono opacity-40 text-right">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
          
          {isThinking && (
             <div className="flex justify-start">
                <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-2xl rounded-tl-sm flex gap-2 items-center shadow-md">
                   <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 bg-[#00abec] rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-[#00abec] rounded-full animate-bounce [animation-delay:0.15s]"></span>
                      <span className="w-1.5 h-1.5 bg-[#00abec] rounded-full animate-bounce [animation-delay:0.3s]"></span>
                   </div>
                </div>
             </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-[#0a0a0a] border-t border-zinc-800 relative z-10">
          <div className="flex gap-3 items-center bg-zinc-950 border border-zinc-800 rounded-full pr-1.5 pl-5 focus-within:border-[#00abec]/50 transition-colors">
            <input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask about your budget..."
              className="flex-grow bg-transparent py-3.5 text-[13px] text-white outline-none placeholder:text-zinc-600 font-body"
            />
            <button 
              onClick={handleSend}
              disabled={!input.trim() || isThinking}
              className="bg-[#1c4b5c] text-white p-2 rounded-full hover:bg-[#00abec] transition-all disabled:opacity-50 flex items-center justify-center min-w-[36px] min-h-[36px]"
            >
              <span className="material-symbols-outlined text-[16px]">near_me</span>
            </button>
          </div>
        </div>
      </div>

      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-14 h-14 bg-[#00abec] text-white rounded-2xl flex items-center justify-center shadow-[0_0_20px_rgba(0,171,236,0.3)] hover:scale-105 hover:bg-[#00c0ff] transition-all relative group z-20"
      >
        <span className="material-symbols-outlined text-[28px] group-hover:scale-105 transition-transform text-white">
          {isOpen ? 'close' : 'smart_toy'}
        </span>
        {!isOpen && (
          <div className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-error rounded-full border-2 border-background"></div>
        )}
      </button>
    </div>
  );
}
