'use client';

import React, { useState, useRef, useEffect } from 'react';
import AgentHeader from '@/components/agent/AgentHeader';
import { useUserStore } from '@/store/userStore';
import { generateAIResponse } from '@/services/aiService';
import { AIMessage } from '@/types';

export default function AgentPage() {
  const { user, missions } = useUserStore();
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Welcome. I'm your AI Agent Manager — your dedicated financial advisor on SplitSmart. Ask me anything about budgets, savings, expenses, investments, or financial planning. I'm here to help you make smarter money decisions.",
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
  }, [messages, isThinking]);

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
    <div className="agent-theme min-h-screen bg-background text-on-surface font-body pb-24 md:pb-8 pt-16 agent-gradient">
      <AgentHeader />
      
      <main className="relative z-10 container mx-auto p-4 md:p-6 max-w-4xl mt-4 h-[calc(100vh-160px)] flex flex-col">
        <div className="flex flex-col mb-8">
          <h1 className="font-headline text-4xl font-bold tracking-[0.1em] text-primary uppercase text-center drop-shadow-[0_0_15px_rgba(0,163,255,0.3)]">
            Financial AI <span className="text-on-surface">Manager</span>
          </h1>
          <div className="mx-auto flex gap-6 text-[11px] font-mono text-primary/70 uppercase mt-4 tracking-widest bg-primary/5 px-4 py-1.5 rounded-full border border-primary/20">
             <span className="flex items-center gap-2"><span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span> SYSTEM_ONLINE</span>
             <span className="opacity-50">|</span>
             <span>PROTOCOL: FIN_STRAT_V4</span>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-grow bg-surface/30 border border-outline/30 backdrop-blur-xl flex flex-col overflow-hidden rounded-2xl shadow-2xl relative">
           <div 
             ref={scrollRef}
             className="flex-grow overflow-y-auto p-8 space-y-8 scrollbar-hide"
           >
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] relative p-5 rounded-2xl shadow-lg transition-all ${
                    msg.role === 'user' 
                      ? 'bg-primary/20 border border-primary/40 text-on-surface ml-auto' 
                      : 'bg-surface border border-outline/40 text-on-surface'
                  }`}>
                    {/* Role Tag */}
                    <div className="flex items-center gap-2 mb-3">
                       <span className={`material-symbols-outlined text-sm ${msg.role === 'user' ? 'text-secondary' : 'text-primary'}`}>
                          {msg.role === 'user' ? 'person' : 'smart_toy'}
                       </span>
                       <span className={`text-[10px] font-mono font-bold uppercase tracking-widest ${msg.role === 'user' ? 'text-secondary/70' : 'text-primary/70'}`}>
                          {msg.role === 'user' ? 'Client' : 'AI Agent Manager'}
                       </span>
                    </div>
                    
                    <p className="font-body text-sm leading-relaxed whitespace-pre-wrap">
                      {msg.content}
                    </p>
                    <div className="mt-4 font-mono text-[9px] opacity-40 uppercase text-right tracking-widest">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              ))}
              
              {isThinking && (
                 <div className="flex justify-start">
                    <div className="bg-surface border border-outline/40 p-5 rounded-2xl flex gap-3 items-center shadow-lg">
                       <div className="flex gap-1.5">
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse"></span>
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse [animation-delay:0.2s]"></span>
                          <span className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse [animation-delay:0.4s]"></span>
                       </div>
                       <span className="font-mono text-[10px] text-primary/80 uppercase tracking-widest font-bold">Processing Logic...</span>
                    </div>
                 </div>
              )}
           </div>

           {/* Input System */}
           <div className="p-6 border-t border-outline/30 bg-surface/50 backdrop-blur-3xl">
              <div className="flex gap-4 items-center max-w-3xl mx-auto">
                 <div className="flex-grow relative group">
                    <input 
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                      placeholder="Ask for financial strategies..."
                      className="w-full bg-background/50 border border-outline px-6 py-4 font-body text-sm text-on-surface outline-none focus:border-primary/50 transition-all placeholder:text-zinc-600 rounded-xl"
                    />
                    <div className="absolute inset-0 rounded-xl pointer-events-none border border-primary/0 group-focus-within:border-primary/20 transition-all"></div>
                 </div>
                 <button 
                   onClick={handleSend}
                   disabled={!input.trim() || isThinking}
                   className="bg-primary text-background font-headline font-black px-8 py-4 uppercase tracking-[0.15em] hover:bg-white hover:scale-105 transition-all disabled:opacity-30 disabled:grayscale rounded-xl shadow-[0_0_20px_rgba(0,163,255,0.3)]"
                 >
                    Analyze
                 </button>
              </div>
           </div>
        </div>
      </main>


    </div>
  );
}
