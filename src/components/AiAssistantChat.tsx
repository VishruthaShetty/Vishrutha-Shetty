import React, { useState, useRef, useEffect } from 'react';
import { Employee, ProjectDefinition, ChatMessage } from '../types';
import { getAiChatResponse } from '../utils/workforceAlgorithms';
import { PROJECT_PRESETS } from '../data/initialData';
import { MessageSquare, X, Send, Sparkles, Bot, User, ArrowRight, CornerDownLeft } from 'lucide-react';

interface AiAssistantChatProps {
  employees: Employee[];
  onSelectEmployee?: (employee: Employee) => void;
  onNavigate?: (tab: 'dashboard' | 'employees' | 'new-project' | 'workload') => void;
}

const DEFAULT_SUGGESTIONS = [
  'Who is free this week?',
  'Who is overloaded?',
  'Who knows Cloud?',
  'Who specializes in Python / AI?',
  'What is our workload fairness score?',
];

export const AiAssistantChat: React.FC<AiAssistantChatProps> = ({
  employees,
  onSelectEmployee,
  onNavigate,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-init',
      sender: 'assistant',
      text: "👋 Hi! I'm **WorkforceIQ Assistant**. Ask me anything about employee availability, skills, workload bottlenecks, or team optimization.",
      timestamp: 'Just now',
    },
  ]);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [messages, isOpen]);

  const activeProjects: ProjectDefinition[] = PROJECT_PRESETS.map((p, idx) => ({
    id: `p-${idx}`,
    ...p,
  }));

  const handleSendMessage = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    if (!textToSend) setInput('');

    // Rule-based NLP matching
    setTimeout(() => {
      const response = getAiChatResponse(query, employees, activeProjects);
      const assistantMsg: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: 'assistant',
        text: response.text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        structuredData: response.structuredData,
      };
      setMessages(prev => [...prev, assistantMsg]);
    }, 250);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const renderFormattedText = (text: string) => {
    // Basic markdown support for bolding and bullets
    const lines = text.split('\n');
    return lines.map((line, idx) => {
      // Bold replacement
      const parts = line.split(/(\*\*.*?\*\*)/g);
      const formattedParts = parts.map((part, pIdx) => {
        if (part.startsWith('**') && part.endsWith('**')) {
          return <strong key={pIdx} className="font-semibold text-slate-900 dark:text-white">{part.slice(2, -2)}</strong>;
        }
        if (part.startsWith('*') && part.endsWith('*')) {
          return <em key={pIdx} className="italic text-slate-800 dark:text-slate-200">{part.slice(1, -1)}</em>;
        }
        return part;
      });

      return (
        <p key={idx} className={line.startsWith('•') ? 'pl-2 text-slate-700 dark:text-slate-300 py-0.5' : 'py-0.5'}>
          {formattedParts}
        </p>
      );
    });
  };

  return (
    <>
      {/* Floating Chat Trigger Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2.5 px-4 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all transform hover:scale-105"
          aria-label="Open AI Assistant Chat"
        >
          {isOpen ? (
            <X className="w-5 h-5" />
          ) : (
            <>
              <Bot className="w-5 h-5" />
              <span className="text-xs font-bold tracking-wide">Workforce AI</span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </>
          )}
        </button>
      </div>

      {/* Floating Chat Window */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 sm:right-6 z-50 w-full max-w-sm sm:max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col h-[520px] max-h-[80vh] overflow-hidden animate-in fade-in slide-in-from-bottom-5 duration-200 transition-colors">
          {/* Chat Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                <Bot className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  Workforce Intelligence Assistant
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">Rule-based NLP engine · Real-time data</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompt Chips */}
          <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 flex items-center gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
            {DEFAULT_SUGGESTIONS.map(s => (
              <button
                key={s}
                onClick={() => handleSendMessage(s)}
                className="px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-950/60 hover:text-indigo-600 dark:hover:text-indigo-300 whitespace-nowrap transition-colors shrink-0"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Messages Area */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3.5 text-xs">
            {messages.map(msg => (
              <div
                key={msg.id}
                className={`flex gap-2.5 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.sender === 'assistant' && (
                  <div className="w-6 h-6 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center text-[10px] shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3 leading-relaxed ${
                    msg.sender === 'user'
                      ? 'bg-indigo-600 text-white rounded-tr-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-xs'
                  }`}
                >
                  {renderFormattedText(msg.text)}

                  {/* Structured Employee Quick Cards */}
                  {msg.structuredData?.type === 'employees' && msg.structuredData.items && (
                    <div className="mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-700 space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Quick Staff Profiles:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {msg.structuredData.items.slice(0, 4).map((emp: Employee) => (
                          <button
                            key={emp.id}
                            onClick={() => onSelectEmployee && onSelectEmployee(emp)}
                            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 px-2 py-0.5 rounded text-[11px] font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-colors"
                          >
                            {emp.name} ({emp.currentLoad}h)
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <span
                    className={`block text-[9px] mt-1 font-mono text-right ${
                      msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'
                    }`}
                  >
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Box */}
          <div className="p-3 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="relative flex items-center">
              <input
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about free staff, cloud skills, overloaded..."
                className="w-full pl-3 pr-10 py-2 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 text-slate-900 dark:text-white placeholder:text-slate-400"
              />
              <button
                type="button"
                onClick={() => handleSendMessage()}
                disabled={!input.trim()}
                className="absolute right-1.5 p-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white rounded-lg transition-colors"
                title="Send message"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
