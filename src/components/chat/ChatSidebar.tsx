'use client';

import { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Brain } from 'lucide-react';
import { clsx } from 'clsx';
import { useChat } from '@ai-sdk/react';
import TypingIndicator from './TypingIndicator';

interface UserProfile {
  name: string;
  age: string;
  sex: string;
  height: string;
  currentWeight: string;
  targetWeight: string;
  activityLevel: string;
  conditions: string[];
  allergies: string[];
}

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  userProfile: UserProfile;
}

export default function ChatSidebar({ isOpen, onClose, userProfile }: ChatSidebarProps) {
  const { messages, sendMessage, status, setMessages, error } = useChat({
    // @ts-expect-error api is required for custom endpoints but may not be in type
    api: '/api/chat',
    body: {
      userProfile,
    },
    initialMessages: [
      {
        id: '1',
        role: 'assistant',
        content: `¡Hola, ${userProfile?.name || 'paciente'}! Soy el asistente virtual del Dr. Vásquez. ¿En qué te puedo ayudar hoy con tu plan nutricional?`,
      }
    ]
  });

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isLoading = status === 'streaming' || status === 'submitted';

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading, isOpen]);

  const handleManualSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input;
    setInput('');
    try {
      // Pasamos explícitamente el body por si la versión del SDK omite el hook body global
      await sendMessage(
        { text }, 
        { body: { userProfile } }
      );
    } catch (err) {
      console.error('Error sending message:', err);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop for mobile mostly */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/20 backdrop-blur-sm sm:hidden"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-[#0a0a0c]/95 border-l border-white/[0.08] shadow-2xl flex flex-col backdrop-blur-2xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-white/[0.08] bg-white/[0.02]">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
                  <Brain className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">Dr. Vásquez Assistant</h3>
                  <p className="text-xs text-emerald-400">En línea</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 rounded-full text-zinc-400 hover:text-white hover:bg-white/[0.1] transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={clsx(
                    'flex w-full',
                    msg.role === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div
                    className={clsx(
                      'max-w-[85%] rounded-2xl p-3 text-sm shadow-md',
                      msg.role === 'user'
                        ? 'bg-emerald-600 text-white rounded-tr-sm'
                        : 'bg-white/[0.06] border border-white/[0.08] text-zinc-200 rounded-tl-sm whitespace-pre-wrap'
                    )}
                  >
                    {typeof msg.content === 'string' ? msg.content : msg.parts?.map((part, i) => (
                      part.type === 'text' ? <span key={i}>{part.text}</span> : null
                    ))}
                  </div>
                </div>
              ))}
              {isLoading && messages[messages.length - 1]?.role === 'user' && (
                <div className="flex w-full justify-start">
                  <div className="max-w-[85%] rounded-2xl p-3 text-sm bg-white/[0.04] border border-white/[0.04] rounded-tl-sm">
                    <TypingIndicator text="El Dr. Vásquez está escribiendo..." />
                  </div>
                </div>
              )}
              {error && (
                <div className="flex w-full justify-center my-2">
                  <div className="text-red-400 text-xs bg-red-400/10 rounded px-3 py-2 border border-red-400/20 text-center">
                    {error.message || 'Error al comunicarse con la IA.'}
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-white/[0.08] bg-white/[0.02]">
              <form onSubmit={handleManualSubmit} className="relative flex items-center">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Pregúntale al Dr. Vásquez..."
                  className="w-full bg-white/[0.06] border border-white/[0.1] rounded-full pl-4 pr-12 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
                />
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 p-2 rounded-full bg-emerald-500 text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-emerald-400 transition"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
