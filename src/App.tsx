import { useState, useRef, useEffect } from 'react';
import { 
  Send, 
  Plus, 
  Download, 
  Upload, 
  Trash2, 
  MessageSquare, 
  Menu, 
  X,
  HelpCircle,
  Zap,
  DollarSign,
  Code2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { getChatResponse } from './services/gemini';
import { cn } from './lib/utils';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

interface ChatSession {
  id: string;
  title: string;
  messages: Message[];
  updatedAt: number;
}

export default function App() {
  const [sessions, setSessions] = useState<ChatSession[]>(() => {
    try {
      const saved = localStorage.getItem('pyguide_sessions');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (err) {
      console.error("Failed to load sessions from localStorage:", err);
    }
    return [{
      id: 'default',
      title: 'New Chat',
      messages: [],
      updatedAt: Date.now()
    }];
  });
  const [currentSessionId, setCurrentSessionId] = useState(sessions[0].id);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];

  useEffect(() => {
    localStorage.setItem('pyguide_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentSession.messages]);

  const handleSend = async (textOverride?: string) => {
    const text = textOverride || input;
    if (!text.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: Date.now()
    };

    const updatedMessages = [...currentSession.messages, userMessage];
    
    // Update session title if it's the first message
    let newTitle = currentSession.title;
    if (currentSession.messages.length === 0) {
      newTitle = text.slice(0, 30) + (text.length > 30 ? '...' : '');
    }

    setSessions(prev => prev.map(s => 
      s.id === currentSessionId 
        ? { ...s, messages: updatedMessages, title: newTitle, updatedAt: Date.now() } 
        : s
    ));
    
    setInput('');
    setIsLoading(true);

    const history = updatedMessages.map(m => ({
      role: m.role,
      parts: [{ text: m.text }]
    }));

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey === "") {
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'model',
        text: "⚠️ **API Key Missing**: It looks like the Gemini API key is not configured. Please add `GEMINI_API_KEY` to your environment variables to enable the AI tutor.",
        timestamp: Date.now()
      };
      setSessions(prev => prev.map(s => 
        s.id === currentSessionId 
          ? { ...s, messages: [...updatedMessages, aiMessage], updatedAt: Date.now() } 
          : s
      ));
      setIsLoading(false);
      return;
    }

    const responseText = await getChatResponse(text, history.slice(0, -1));

    const aiMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'model',
      text: responseText,
      timestamp: Date.now()
    };

    setSessions(prev => prev.map(s => 
      s.id === currentSessionId 
        ? { ...s, messages: [...updatedMessages, aiMessage], updatedAt: Date.now() } 
        : s
    ));
    setIsLoading(false);
  };

  const createNewChat = () => {
    const newSession: ChatSession = {
      id: Date.now().toString(),
      title: 'New Chat',
      messages: [],
      updatedAt: Date.now()
    };
    setSessions([newSession, ...sessions]);
    setCurrentSessionId(newSession.id);
  };

  const deleteSession = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    const newSessions = sessions.filter(s => s.id !== id);
    if (newSessions.length === 0) {
      const defaultSession = {
        id: 'default',
        title: 'New Chat',
        messages: [],
        updatedAt: Date.now()
      };
      setSessions([defaultSession]);
      setCurrentSessionId('default');
    } else {
      setSessions(newSessions);
      if (currentSessionId === id) {
        setCurrentSessionId(newSessions[0].id);
      }
    }
  };

  const exportData = () => {
    const dataStr = JSON.stringify(sessions, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `pyguide_export_${new Date().toISOString().split('T')[0]}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const importData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const imported = JSON.parse(event.target?.result as string);
        if (Array.isArray(imported)) {
          setSessions(imported);
          setCurrentSessionId(imported[0].id);
        }
      } catch (err) {
        alert('Invalid file format');
      }
    };
    reader.readAsText(file);
  };

  const quickPrompts = [
    { icon: HelpCircle, text: "What is Python?", label: "Basics" },
    { icon: Zap, text: "What is Python related to?", label: "Ecosystem" },
    { icon: DollarSign, text: "How much money can I earn with Python?", label: "Career" },
    { icon: Code2, text: "Help me start learning Python as a beginner.", label: "Start" },
  ];

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* Sidebar */}
      <AnimatePresence mode="wait">
        {isSidebarOpen && (
          <motion.aside 
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 260, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            className="bg-[#f9f9f9] border-r border-black/5 flex flex-col h-full"
          >
            <div className="p-3">
              <button 
                onClick={createNewChat}
                className="w-full flex items-center gap-3 px-3 py-2.5 border border-black/10 rounded-lg text-sm hover:bg-black/5 transition-colors"
              >
                <Plus size={16} />
                New Chat
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 space-y-1">
              {sessions.map(session => (
                <button
                  key={session.id}
                  onClick={() => setCurrentSessionId(session.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors group relative",
                    currentSessionId === session.id ? "bg-black/5" : "hover:bg-black/5"
                  )}
                >
                  <MessageSquare size={16} className="shrink-0 opacity-60" />
                  <span className="truncate pr-6">{session.title}</span>
                  <Trash2 
                    size={14} 
                    className="absolute right-3 opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity"
                    onClick={(e) => deleteSession(e, session.id)}
                  />
                </button>
              ))}
            </div>

            <div className="p-3 border-t border-black/5 space-y-1">
              <button 
                onClick={exportData}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-black/5 transition-colors"
              >
                <Download size={16} className="opacity-60" />
                Export Data
              </button>
              <label className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-black/5 transition-colors cursor-pointer">
                <Upload size={16} className="opacity-60" />
                Import Data
                <input type="file" className="hidden" onChange={importData} accept=".json" />
              </label>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative">
        {/* Header */}
        <header className="h-14 flex items-center px-4 border-b border-black/5 sticky top-0 bg-white z-10">
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="p-2 hover:bg-black/5 rounded-lg transition-colors mr-2"
          >
            {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div className="flex items-center gap-2 font-semibold text-lg">
            <Code2 className="text-[#3776ab]" size={24} />
            <span>PyGuide AI</span>
          </div>
        </header>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto">
          {currentSession.messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center p-6 max-w-2xl mx-auto text-center">
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="mb-8"
              >
                <div className="w-16 h-16 bg-[#3776ab]/10 rounded-2xl flex items-center justify-center mb-4 mx-auto">
                  <Code2 size={40} className="text-[#3776ab]" />
                </div>
                <h1 className="text-3xl font-bold mb-2">How can I help you with Python?</h1>
                <p className="text-black/50">Ask me anything about Python, from basics to career advice.</p>
              </motion.div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {quickPrompts.map((prompt, i) => (
                  <button
                    key={i}
                    onClick={() => handleSend(prompt.text)}
                    className="flex flex-col items-start p-4 border border-black/10 rounded-xl hover:bg-black/5 transition-all text-left group"
                  >
                    <prompt.icon size={18} className="mb-2 opacity-60 group-hover:text-[#3776ab] group-hover:opacity-100" />
                    <span className="text-xs font-semibold uppercase tracking-wider opacity-40 mb-1">{prompt.label}</span>
                    <span className="text-sm">{prompt.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto w-full py-8 px-4 space-y-8">
              {currentSession.messages.map((message) => (
                <div 
                  key={message.id}
                  className={cn(
                    "flex gap-4",
                    message.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3",
                    message.role === 'user' 
                      ? "bg-[#f4f4f4] text-black" 
                      : "bg-white border border-black/5"
                  )}>
                    <div className="markdown-body">
                      <Markdown>{message.text}</Markdown>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-black/5 rounded-2xl px-4 py-3 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-black/20 rounded-full animate-bounce" />
                    <div className="w-1.5 h-1.5 bg-black/20 rounded-full animate-bounce [animation-delay:0.2s]" />
                    <div className="w-1.5 h-1.5 bg-black/20 rounded-full animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-black/5">
          <div className="max-w-3xl mx-auto relative">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Message PyGuide AI..."
              className="w-full bg-[#f4f4f4] rounded-2xl py-3 pl-4 pr-12 resize-none focus:outline-none focus:ring-1 focus:ring-[#3776ab]/20 min-h-[52px] max-h-40"
              rows={1}
            />
            <button
              onClick={() => handleSend()}
              disabled={!input.trim() || isLoading}
              className="absolute right-2 bottom-2 p-2 bg-black text-white rounded-xl disabled:opacity-20 disabled:cursor-not-allowed transition-opacity"
            >
              <Send size={18} />
            </button>
          </div>
          <p className="text-[10px] text-center mt-2 opacity-30">
            PyGuide AI can make mistakes. Check important info.
          </p>
        </div>
      </main>
    </div>
  );
}
