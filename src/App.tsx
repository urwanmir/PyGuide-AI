import { useState, useRef, useEffect } from 'react';
import { 
  BrowserRouter, 
  Routes, 
  Route, 
  Navigate, 
  useNavigate,
  Link
} from 'react-router-dom';
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
  Code2,
  Github,
  ExternalLink,
  ShieldCheck,
  User,
  Settings,
  Search,
  History,
  Brain,
  Sparkles,
  Image as ImageIcon,
  Video,
  Mic,
  Search as SearchIcon,
  Bolt,
  Network,
  FileSearch,
  Camera,
  Languages,
  ArrowRight,
  Loader2,
  Volume2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Markdown from 'react-markdown';
import { 
  getChatResponse, 
  generateImage, 
  editImage, 
  generateSpeech, 
  animateImage,
  transcribeAudio
} from './services/gemini';
import { cn } from './lib/utils';
import { LiveVoice } from './components/LiveVoice';

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

interface UserSettings {
  nickname: string;
  occupation: string;
  aboutMe: string;
}

function LandingPage({ onAccept }: { onAccept: () => void }) {
  const navigate = useNavigate();
  const [accepted, setAccepted] = useState(false);

  const handleAccept = () => {
    localStorage.setItem('pyguide_privacy_accepted', 'true');
    onAccept();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-6 max-w-4xl mx-auto">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="w-20 h-20 bg-[#3776ab]/10 rounded-3xl flex items-center justify-center mb-6 mx-auto">
          <Code2 size={48} className="text-[#3776ab]" />
        </div>
        <h1 className="text-5xl font-bold mb-4 tracking-tight">Welcome to PyGuide AI</h1>
        <p className="text-xl text-black/60 max-w-2xl mx-auto">
          Your friendly, personal Python tutor. Designed to help you master Python with ease and analogies.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full mb-12">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="p-8 border border-black/5 rounded-3xl bg-[#f9f9f9]"
        >
          <div className="flex items-center gap-3 mb-4">
            <User className="text-[#3776ab]" size={24} />
            <h2 className="text-2xl font-bold">The Developers</h2>
          </div>
          <div className="space-y-6">
            <div>
              <p className="text-black/70 mb-2 leading-relaxed">
                PyGuide AI is primarily crafted by **Hadi (Urwan Mir)**. I'm passionate about making coding education accessible to everyone through AI.
              </p>
              <a 
                href="https://urwanportfolio.netlify.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#3776ab] font-semibold hover:underline text-sm"
              >
                Hadi's Portfolio <ExternalLink size={14} />
              </a>
            </div>
            
            <div className="pt-4 border-t border-black/5">
              <p className="text-black/70 mb-2 leading-relaxed">
                Co-developed by **Luqman**, who contributed significantly to the project's vision and features.
              </p>
              <a 
                href="https://the.pop.site/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-[#3776ab] font-semibold hover:underline text-sm"
              >
                Luqman's Portfolio <ExternalLink size={14} />
              </a>
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="p-8 border border-black/5 rounded-3xl bg-[#f9f9f9]"
        >
          <div className="flex items-center gap-3 mb-4">
            <Github className="text-black" size={24} />
            <h2 className="text-2xl font-bold">Open Source</h2>
          </div>
          <p className="text-black/70 mb-6 leading-relaxed">
            This project is fully open source. We believe in transparency and community-driven development.
          </p>
          <a 
            href="https://github.com/urwanmir/PyGuide-AI" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-black font-semibold hover:underline"
          >
            GitHub Repository <ExternalLink size={16} />
          </a>
        </motion.div>
      </div>

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full p-8 border-2 border-[#3776ab]/20 rounded-3xl bg-[#3776ab]/5"
      >
        <div className="flex items-center gap-3 mb-4">
          <ShieldCheck className="text-[#3776ab]" size={24} />
          <h2 className="text-2xl font-bold">Privacy Policy</h2>
        </div>
        <div className="text-sm text-black/70 space-y-4 mb-8 max-h-40 overflow-y-auto pr-4 custom-scrollbar">
          <p>
            PyGuide AI values your privacy. We use local storage to save your chat history directly on your device. We do not store your personal conversations on our servers.
          </p>
          <p>
            By using this application, you agree to the following:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>Your chat data is stored locally in your browser's cache.</li>
            <li>We use the Gemini API to process your messages. Please do not share sensitive personal information.</li>
            <li>We use cookies/local storage to remember your preferences and acceptance of this policy.</li>
          </ul>
        </div>
        
        <div className="flex items-center gap-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative w-6 h-6">
              <input 
                type="checkbox" 
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="peer sr-only"
              />
              <div className="w-6 h-6 border-2 border-black/20 rounded-md peer-checked:bg-[#3776ab] peer-checked:border-[#3776ab] transition-all" />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 peer-checked:opacity-100 transition-opacity">
                <ShieldCheck size={14} className="text-white" />
              </div>
            </div>
            <span className="text-sm font-medium">I have read and accept the privacy policy</span>
          </label>
          
          <button
            disabled={!accepted}
            onClick={handleAccept}
            className="ml-auto px-8 py-3 bg-black text-white rounded-xl font-bold disabled:opacity-20 disabled:cursor-not-allowed hover:bg-black/80 transition-all"
          >
            Start Learning
          </button>
        </div>
      </motion.div>

      <footer className="mt-12 text-black/30 text-sm">
        © {new Date().getFullYear()} PyGuide AI by Hadi (Urwan Mir)
      </footer>
    </div>
  );
}

function ChatInterface() {
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

  const [userSettings, setUserSettings] = useState<UserSettings>(() => {
    try {
      const saved = localStorage.getItem('pyguide_personalization');
      if (saved) return JSON.parse(saved);
    } catch (err) {
      console.error("Failed to load settings:", err);
    }
    return { nickname: '', occupation: '', aboutMe: '' };
  });

  const [memories, setMemories] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pyguide_memories');
      if (saved) return JSON.parse(saved);
    } catch (err) {
      console.error("Failed to load memories:", err);
    }
    return [];
  });

  const [currentSessionId, setCurrentSessionId] = useState(sessions[0].id);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isPowerMenuOpen, setIsPowerMenuOpen] = useState(false);
  const [settingsTab, setSettingsTab] = useState<'settings' | 'memory' | 'api' | 'auto_memory'>('settings');
  const [newMemory, setNewMemory] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Auto-Memory State
  const [autoMemory, setAutoMemory] = useState(() => localStorage.getItem('pyguide_auto_memory') || '');
  const [hasNewAutoMemory, setHasNewAutoMemory] = useState(false);
  const [nextAutoMemoryThreshold, setNextAutoMemoryThreshold] = useState(() => Math.floor(Math.random() * 11) + 5); // 5-15
  const messageCountRef = useRef(0);
  
  // API and Model Settings
  const [userApiKey, setUserApiKey] = useState(() => localStorage.getItem('pyguide_user_api_key') || '');
  const [useCustomKeys, setUseCustomKeys] = useState(() => localStorage.getItem('pyguide_use_custom_keys') === 'true');
  const [customKeys, setCustomKeys] = useState<string[]>(() => {
    const saved = localStorage.getItem('pyguide_custom_keys');
    return saved ? JSON.parse(saved) : ['', '', ''];
  });
  const [selectedModel, setSelectedModel] = useState<string>(() => localStorage.getItem('pyguide_selected_model') || 'gemma-3-27b');
  const [selectedImageModel, setSelectedImageModel] = useState<string>(() => localStorage.getItem('pyguide_selected_image_model') || 'gemini-3-pro-image-preview');

  // Power Feature States
  const [activePowerFeature, setActivePowerFeature] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<{ data: string, mimeType: string } | null>(null);
  const [imageSize, setImageSize] = useState<"1K" | "2K" | "4K">("1K");
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLiveOpen, setIsLiveOpen] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const currentSession = sessions.find(s => s.id === currentSessionId) || sessions[0];

  useEffect(() => {
    localStorage.setItem('pyguide_sessions', JSON.stringify(sessions));
  }, [sessions]);

  useEffect(() => {
    localStorage.setItem('pyguide_personalization', JSON.stringify(userSettings));
  }, [userSettings]);

  useEffect(() => {
    localStorage.setItem('pyguide_memories', JSON.stringify(memories));
  }, [memories]);

  useEffect(() => {
    localStorage.setItem('pyguide_user_api_key', userApiKey);
  }, [userApiKey]);

  useEffect(() => {
    localStorage.setItem('pyguide_use_custom_keys', useCustomKeys.toString());
  }, [useCustomKeys]);

  useEffect(() => {
    localStorage.setItem('pyguide_custom_keys', JSON.stringify(customKeys));
  }, [customKeys]);

  useEffect(() => {
    localStorage.setItem('pyguide_selected_model', selectedModel);
  }, [selectedModel]);

  useEffect(() => {
    localStorage.setItem('pyguide_selected_image_model', selectedImageModel);
  }, [selectedImageModel]);

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

    const apiKey = process.env.GEMINI_API_KEY || import.meta.env.VITE_GEMINI_API_KEY;
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

    const responseText = await getChatResponse(
      text, 
      history.slice(0, -1), 
      userSettings, 
      memories,
      {
        model: activePowerFeature === 'thinking' ? 'gemini-3.1-pro-preview' : 
               activePowerFeature === 'fast' ? 'gemini-3-flash-preview' : 
               activePowerFeature === 'analyze' ? 'gemini-3.1-pro-preview' : 
               selectedModel,
        useSearch: activePowerFeature === 'search',
        useThinking: activePowerFeature === 'thinking',
        image: selectedImage || undefined,
        userKey: userApiKey || undefined,
        customKeys,
        useCustomKeys
      }
    );

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

  const addMemory = () => {
    if (!newMemory.trim()) return;
    setMemories(prev => [...prev, newMemory.trim()]);
    setNewMemory('');
  };

  const deleteMemory = (index: number) => {
    setMemories(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllMemories = () => {
    if (confirm("Are you sure you want to delete all saved memories?")) {
      setMemories([]);
    }
  };

  const handlePowerFeature = async (feature: string) => {
    if (feature === 'live') {
      setIsLiveOpen(true);
      setIsPowerMenuOpen(false);
      return;
    }
    setActivePowerFeature(feature === activePowerFeature ? null : feature);
    setIsPowerMenuOpen(false);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement> | React.DragEvent | React.ClipboardEvent) => {
    let file: File | null = null;
    
    if ('files' in e.target && e.target.files?.[0]) {
      file = e.target.files[0];
    } else if ('dataTransfer' in e && e.dataTransfer.files?.[0]) {
      file = e.dataTransfer.files[0];
    } else if ('clipboardData' in e && e.clipboardData.items) {
      const items = e.clipboardData.items;
      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          file = items[i].getAsFile();
          break;
        }
      }
    }

    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1];
      setSelectedImage({ data: base64, mimeType: file!.type });
      // Automatically switch to analyze mode if an image is added and no other special feature is active
      if (!activePowerFeature) {
        setActivePowerFeature('analyze');
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleImageUpload(e);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    handleImageUpload(e);
  };

  const handleSpecialAction = async () => {
    if (!input.trim()) return;
    
    setIsProcessing(true);
    try {
      let resultUrl = '';
      if (activePowerFeature === 'generate_image') {
        resultUrl = await generateImage(input, imageSize, userApiKey || undefined, selectedImageModel, customKeys, useCustomKeys);
        addMessageToChat('model', `Here is your generated image using **${selectedImageModel}**:\n\n![Generated Image](${resultUrl})`);
      } else if (activePowerFeature === 'edit_image' && selectedImage) {
        resultUrl = await editImage(input, selectedImage.data, selectedImage.mimeType, userApiKey || undefined, customKeys, useCustomKeys);
        addMessageToChat('model', `Here is your edited image:\n\n![Edited Image](${resultUrl})`);
      } else if (activePowerFeature === 'animate' && selectedImage) {
        resultUrl = await animateImage(selectedImage.data, selectedImage.mimeType, input, userApiKey || undefined, customKeys, useCustomKeys);
        addMessageToChat('model', `Here is your animated video:\n\n<video controls src="${resultUrl}" className="w-full rounded-xl" />`);
      }
      setInput('');
      setSelectedImage(null);
    } catch (err: any) {
      console.error(err);
      let errorMsg = "⚠️ Action failed";
      if (err?.message?.includes("429") || err?.status === 429) {
        errorMsg = "⚠️ Rate limit exceeded. Please try again in a moment.";
      }
      addMessageToChat('model', errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      mediaRecorderRef.current?.stop();
      setIsRecording(false);
      return;
    }
    
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64 = (reader.result as string).split(',')[1];
          setIsProcessing(true);
          try {
            const text = await transcribeAudio(base64, 'audio/webm', userApiKey || undefined, customKeys, useCustomKeys);
            setInput(prev => prev + (prev ? ' ' : '') + text);
          } catch (err) {
            console.error(err);
          } finally {
            setIsProcessing(false);
          }
        };
        reader.readAsDataURL(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error(err);
      alert("Microphone access denied or error occurred.");
    }
  };

  const speakMessage = async (messageId: string, text: string) => {
    if (isSpeaking === messageId) return;
    setIsSpeaking(messageId);
    try {
      const base64Audio = await generateSpeech(text, userApiKey || undefined, customKeys, useCustomKeys);
      if (base64Audio) {
        const audio = new Audio(`data:audio/mp3;base64,${base64Audio}`);
        audio.onended = () => setIsSpeaking(null);
        audio.play();
      } else {
        setIsSpeaking(null);
      }
    } catch (err) {
      console.error("TTS Error:", err);
      setIsSpeaking(null);
    }
  };

  const addMessageToChat = (role: 'user' | 'model', text: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      role,
      text,
      timestamp: Date.now()
    };
    setSessions(prev => prev.map(s => 
      s.id === currentSessionId 
        ? { ...s, messages: [...s.messages, newMessage], updatedAt: Date.now() } 
        : s
    ));
  };

  const powerFeatures = [
    { id: 'search', icon: SearchIcon, label: 'Search Grounding', description: 'Real-time Google Search' },
    { id: 'thinking', icon: Network, label: 'Thinking Mode', description: 'Complex reasoning (Pro)' },
    { id: 'fast', icon: Bolt, label: 'Fast Response', description: 'Low-latency (Flash-Lite)' },
    { id: 'generate_image', icon: ImageIcon, label: 'Generate Image', description: 'Nano Banana Pro' },
    { id: 'edit_image', icon: Camera, label: 'Edit Image', description: 'Nano Banana Edit' },
    { id: 'analyze', icon: FileSearch, label: 'Analyze Image', description: 'Image understanding' },
    { id: 'animate', icon: Video, label: 'Animate Image', description: 'Veo 3 Animation' },
    { id: 'live', icon: Zap, label: 'Live Voice', description: 'Conversational AI' },
  ];

  const filteredSessions = sessions.filter(s => 
    s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.messages.some(m => m.text.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
            <div className="p-3 space-y-3">
              <button 
                onClick={createNewChat}
                className="w-full flex items-center gap-3 px-3 py-2.5 border border-black/10 rounded-lg text-sm hover:bg-black/5 transition-colors"
              >
                <Plus size={16} />
                New Chat
              </button>

              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" />
                <input 
                  type="text"
                  placeholder="Search chats..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/5 rounded-lg py-2 pl-9 pr-3 text-xs focus:outline-none focus:ring-1 focus:ring-[#3776ab]/20"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-3 space-y-1">
              {filteredSessions.length > 0 ? (
                filteredSessions.map(session => (
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
                ))
              ) : (
                <div className="text-center py-8 opacity-30 text-xs">
                  No chats found
                </div>
              )}
            </div>

            <div className="p-3 border-t border-black/5 space-y-1">
              <button 
                onClick={() => setIsSettingsOpen(true)}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-black/5 transition-colors"
              >
                <Settings size={16} className="opacity-60" />
                Personalization
              </button>
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
              <Link 
                to="/main"
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm hover:bg-black/5 transition-colors"
              >
                <HelpCircle size={16} className="opacity-60" />
                About & Policy
              </Link>
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
                    "flex gap-4 group",
                    message.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3 relative",
                    message.role === 'user' 
                      ? "bg-[#f4f4f4] text-black" 
                      : "bg-white border border-black/5"
                  )}>
                    <div className="markdown-body">
                      <Markdown>{message.text}</Markdown>
                    </div>
                    {message.role === 'model' && (
                      <button 
                        onClick={() => speakMessage(message.id, message.text)}
                        className={cn(
                          "absolute -right-10 top-2 p-2 rounded-full hover:bg-black/5 transition-all opacity-0 group-hover:opacity-100",
                          isSpeaking === message.id && "text-[#3776ab] opacity-100"
                        )}
                      >
                        {isSpeaking === message.id ? <Loader2 size={16} className="animate-spin" /> : <Volume2 size={16} />}
                      </button>
                    )}
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
        <div 
          className={cn(
            "p-4 bg-white border-t border-black/5 transition-colors relative",
            isDragging && "bg-[#3776ab]/5"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          {isDragging && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#3776ab]/10 backdrop-blur-[2px] pointer-events-none">
              <div className="flex flex-col items-center gap-2 text-[#3776ab]">
                <ImageIcon size={48} className="animate-bounce" />
                <p className="font-bold">Drop image to analyze</p>
              </div>
            </div>
          )}
          <div className="max-w-3xl mx-auto space-y-4">
            {selectedImage && (
              <div className="relative inline-block">
                <img 
                  src={`data:${selectedImage.mimeType};base64,${selectedImage.data}`} 
                  className="h-20 w-20 object-cover rounded-xl border border-black/10" 
                  alt="Selected"
                />
                <button 
                  onClick={() => setSelectedImage(null)}
                  className="absolute -top-2 -right-2 bg-black text-white rounded-full p-1 shadow-lg"
                >
                  <X size={12} />
                </button>
              </div>
            )}

            {activePowerFeature && (
              <div className="flex items-center gap-2 px-3 py-1.5 bg-[#3776ab]/10 text-[#3776ab] rounded-full text-xs font-semibold w-fit">
                <Sparkles size={12} />
                <span>{powerFeatures.find(f => f.id === activePowerFeature)?.label} Active</span>
                <button onClick={() => setActivePowerFeature(null)} className="hover:text-black">
                  <X size={12} />
                </button>
                {activePowerFeature === 'generate_image' && (
                  <select 
                    value={imageSize} 
                    onChange={(e) => setImageSize(e.target.value as any)}
                    className="bg-transparent border-none focus:ring-0 cursor-pointer ml-2"
                  >
                    <option value="1K">1K</option>
                    <option value="2K">2K</option>
                    <option value="4K">4K</option>
                  </select>
                )}
                {(activePowerFeature === 'edit_image' || activePowerFeature === 'analyze' || activePowerFeature === 'animate') && !selectedImage && (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="ml-2 flex items-center gap-1 hover:underline"
                  >
                    <Upload size={12} />
                    Upload Image
                  </button>
                )}
              </div>
            )}

            <div className="relative flex items-end gap-2">
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsPowerMenuOpen(!isPowerMenuOpen)}
                  className={cn(
                    "p-3 rounded-2xl transition-all",
                    activePowerFeature ? "bg-[#3776ab] text-white" : "bg-[#f4f4f4] text-black/40 hover:text-black"
                  )}
                >
                  <Sparkles size={20} />
                </button>

                <button
                  onClick={toggleRecording}
                  className={cn(
                    "p-3 rounded-2xl transition-all",
                    isRecording ? "bg-red-500 text-white animate-pulse" : "bg-[#f4f4f4] text-black/40 hover:text-black"
                  )}
                >
                  <Mic size={20} />
                </button>
              </div>

                <AnimatePresence>
                  {isPowerMenuOpen && (
                    <>
                      <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsPowerMenuOpen(false)}
                        className="fixed inset-0 z-20"
                      />
                      <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 10 }}
                        className="absolute bottom-full left-0 mb-2 w-64 bg-white rounded-2xl shadow-2xl border border-black/5 overflow-hidden z-30"
                      >
                        <div className="p-3 border-b border-black/5 bg-[#f9f9f9] flex flex-col gap-2">
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-black/40 uppercase tracking-wider">Text Model</h3>
                            <select 
                              value={selectedModel}
                              onChange={(e) => setSelectedModel(e.target.value)}
                              className="text-[10px] font-bold bg-white border border-black/10 rounded px-1 py-0.5 focus:outline-none max-w-[120px]"
                            >
                              <optgroup label="Gemma 3">
                                <option value="gemma-3-27b">Gemini 3 27B</option>
                                <option value="gemma-3-12b">Gemma 3 12B</option>
                              </optgroup>
                              <optgroup label="Gemini">
                                <option value="gemini-3-flash-preview">Gemini 3 Flash</option>
                                <option value="gemini-3.1-pro-preview">Gemini 3.1 Pro</option>
                                <option value="gemini-2.5-flash">Gemini 2.5 Flash</option>
                                <option value="gemini-2.5-pro">Gemini 2.5</option>
                              </optgroup>
                            </select>
                          </div>
                          <div className="flex items-center justify-between">
                            <h3 className="text-xs font-bold text-black/40 uppercase tracking-wider">Image Model</h3>
                            <select 
                              value={selectedImageModel}
                              onChange={(e) => setSelectedImageModel(e.target.value)}
                              className="text-[10px] font-bold bg-white border border-black/10 rounded px-1 py-0.5 focus:outline-none max-w-[120px]"
                            >
                              <optgroup label="Imagen">
                                <option value="imagen-4-generate">Imagen 4</option>
                                <option value="imagen-4-ultra-generate">Imagen 4 Ultra</option>
                                <option value="imagen-4-fast-generate">Imagen 4 Fast</option>
                              </optgroup>
                              <optgroup label="Nano Banana">
                                <option value="gemini-3-pro-image-preview">Nano Banana Pro</option>
                                <option value="gemini-2.5-flash-image">Nano Banana</option>
                              </optgroup>
                            </select>
                          </div>
                          <p className="text-[9px] text-black/30 leading-tight">
                            Gemma 3 models are lightweight, efficient open models from Google. 27B is the smartest for complex tasks.
                          </p>
                        </div>
                        <div className="max-h-80 overflow-y-auto p-1">
                          {powerFeatures.map((feature) => (
                            <button
                              key={feature.id}
                              onClick={() => handlePowerFeature(feature.id)}
                              className={cn(
                                "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors",
                                activePowerFeature === feature.id ? "bg-[#3776ab]/10 text-[#3776ab]" : "hover:bg-black/5"
                              )}
                            >
                              <feature.icon size={18} className={cn(activePowerFeature === feature.id ? "text-[#3776ab]" : "opacity-60")} />
                              <div>
                                <div className="text-sm font-semibold">{feature.label}</div>
                                <div className="text-[10px] opacity-50">{feature.description}</div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex-1 relative">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onPaste={handlePaste}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      if (['generate_image', 'edit_image', 'animate'].includes(activePowerFeature || '')) {
                        handleSpecialAction();
                      } else {
                        handleSend();
                      }
                    }
                  }}
                  placeholder={
                    activePowerFeature === 'generate_image' ? "Describe the image to generate..." :
                    activePowerFeature === 'edit_image' ? "Describe the edits to make..." :
                    "Message PyGuide AI..."
                  }
                  className="w-full bg-[#f4f4f4] rounded-2xl py-3 pl-4 pr-12 resize-none focus:outline-none focus:ring-1 focus:ring-[#3776ab]/20 min-h-[52px] max-h-40"
                  rows={1}
                />
                <button
                  onClick={() => {
                    if (['generate_image', 'edit_image', 'animate'].includes(activePowerFeature || '')) {
                      handleSpecialAction();
                    } else {
                      handleSend();
                    }
                  }}
                  disabled={!input.trim() || isLoading || isProcessing}
                  className="absolute right-2 bottom-2 p-2 bg-black text-white rounded-xl disabled:opacity-20 disabled:cursor-not-allowed transition-opacity"
                >
                  {isProcessing ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                </button>
              </div>
            </div>
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleImageUpload} 
            />
            <p className="text-[10px] text-center mt-2 opacity-30">
              PyGuide AI can make mistakes. Check important info. Created by Hadi (Urwan Mir).
            </p>
          </div>
      </main>

      {/* Live Voice Modal */}
      <AnimatePresence>
        {isLiveOpen && (
          <LiveVoice 
            onClose={() => setIsLiveOpen(false)} 
            userApiKey={userApiKey || undefined}
            customKeys={customKeys}
            useCustomKeys={useCustomKeys}
          />
        )}
      </AnimatePresence>

      {/* Settings Modal */}
      <AnimatePresence>
        {isSettingsOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh]"
            >
              <div className="p-6 border-b border-black/5 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <Settings size={20} className="text-[#3776ab]" />
                  <h2 className="text-xl font-bold">Settings</h2>
                </div>
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="p-2 hover:bg-black/5 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex border-b border-black/5 shrink-0">
                <button 
                  onClick={() => setSettingsTab('settings')}
                  className={cn(
                    "flex-1 py-3 text-sm font-semibold transition-colors relative",
                    settingsTab === 'settings' ? "text-[#3776ab]" : "text-black/40 hover:text-black/60"
                  )}
                >
                  Settings
                  {settingsTab === 'settings' && (
                    <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3776ab]" />
                  )}
                </button>
                <button 
                  onClick={() => setSettingsTab('memory')}
                  className={cn(
                    "flex-1 py-3 text-sm font-semibold transition-colors relative",
                    settingsTab === 'memory' ? "text-[#3776ab]" : "text-black/40 hover:text-black/60"
                  )}
                >
                  Memory
                  {settingsTab === 'memory' && (
                    <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3776ab]" />
                  )}
                </button>
                <button 
                  onClick={() => setSettingsTab('api')}
                  className={cn(
                    "flex-1 py-3 text-sm font-semibold transition-colors relative",
                    settingsTab === 'api' ? "text-[#3776ab]" : "text-black/40 hover:text-black/60"
                  )}
                >
                  API Keys
                  {settingsTab === 'api' && (
                    <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#3776ab]" />
                  )}
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-6">
                {settingsTab === 'settings' ? (
                  <div className="space-y-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-black/40 uppercase tracking-wider">Nickname</label>
                      <input 
                        type="text"
                        placeholder="What should PyGuide call you?"
                        value={userSettings.nickname}
                        onChange={(e) => setUserSettings(prev => ({ ...prev, nickname: e.target.value }))}
                        className="w-full bg-black/5 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#3776ab]/20"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-black/40 uppercase tracking-wider">Occupation</label>
                      <input 
                        type="text"
                        placeholder="e.g. Student, Accountant, Hobbyist"
                        value={userSettings.occupation}
                        onChange={(e) => setUserSettings(prev => ({ ...prev, occupation: e.target.value }))}
                        className="w-full bg-black/5 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#3776ab]/20"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-black/40 uppercase tracking-wider">More about you</label>
                      <textarea 
                        placeholder="Interests, goals, or preferences to keep in mind..."
                        value={userSettings.aboutMe}
                        onChange={(e) => setUserSettings(prev => ({ ...prev, aboutMe: e.target.value }))}
                        className="w-full bg-black/5 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#3776ab]/20 min-h-[100px] resize-none"
                      />
                    </div>
                  </div>
                ) : settingsTab === 'memory' ? (
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-black/40 uppercase tracking-wider">Saved Memories</label>
                        {memories.length > 0 && (
                          <button 
                            onClick={clearAllMemories}
                            className="text-[10px] text-red-500 hover:underline uppercase font-bold tracking-wider"
                          >
                            Delete all
                          </button>
                        )}
                      </div>
                      
                      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2">
                        {memories.length > 0 ? (
                          memories.map((memory, i) => (
                            <div key={i} className="group flex items-start gap-3 p-3 bg-black/5 rounded-xl relative">
                              <div className="mt-1 shrink-0">
                                <Sparkles size={14} className="text-[#3776ab]" />
                              </div>
                              <p className="text-sm pr-6 leading-relaxed">{memory}</p>
                              <button 
                                onClick={() => deleteMemory(i)}
                                className="absolute right-2 top-2 p-1 opacity-0 group-hover:opacity-40 hover:!opacity-100 transition-opacity"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ))
                        ) : (
                          <div className="text-center py-12 px-4 border-2 border-dashed border-black/5 rounded-2xl">
                            <Brain size={32} className="mx-auto mb-3 opacity-10" />
                            <p className="text-sm opacity-30">No saved memories yet. Tell PyGuide what to remember!</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 pt-4 border-t border-black/5">
                      <label className="text-xs font-bold text-black/40 uppercase tracking-wider">Add New Memory</label>
                      <div className="flex gap-2">
                        <input 
                          type="text"
                          placeholder="e.g. My favorite color is blue"
                          value={newMemory}
                          onChange={(e) => setNewMemory(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && addMemory()}
                          className="flex-1 bg-black/5 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#3776ab]/20 text-sm"
                        />
                        <button 
                          onClick={addMemory}
                          disabled={!newMemory.trim()}
                          className="px-4 bg-black text-white rounded-xl text-sm font-bold disabled:opacity-20 transition-opacity"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="p-4 bg-[#3776ab]/5 rounded-2xl border border-[#3776ab]/10">
                      <p className="text-xs text-[#3776ab] font-medium leading-relaxed">
                        Configure your Gemini API keys. You can use environment variables or provide up to 3 custom keys for automatic failover.
                      </p>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-black/5 rounded-2xl">
                      <div>
                        <h4 className="text-sm font-bold">Use Custom API Keys</h4>
                        <p className="text-[10px] opacity-40">Override environment variables with your own keys</p>
                      </div>
                      <button 
                        onClick={() => setUseCustomKeys(!useCustomKeys)}
                        className={cn(
                          "w-12 h-6 rounded-full transition-all relative",
                          useCustomKeys ? "bg-[#3776ab]" : "bg-black/20"
                        )}
                      >
                        <div className={cn(
                          "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                          useCustomKeys ? "right-1" : "left-1"
                        )} />
                      </button>
                    </div>

                    {useCustomKeys ? (
                      <div className="space-y-4">
                        <label className="text-xs font-bold text-black/40 uppercase tracking-wider">Custom API Keys (Failover enabled)</label>
                        {customKeys.map((key, index) => (
                          <div key={index} className="space-y-1">
                            <label className="text-[10px] font-bold opacity-30 uppercase">Key {index + 1}</label>
                            <input 
                              type="password"
                              placeholder={`Enter API key ${index + 1}...`}
                              value={key}
                              onChange={(e) => {
                                const newKeys = [...customKeys];
                                newKeys[index] = e.target.value;
                                setCustomKeys(newKeys);
                              }}
                              className="w-full bg-black/5 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#3776ab]/20 text-sm"
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-black/40 uppercase tracking-wider">Primary Gemini API Key</label>
                          <input 
                            type="password"
                            placeholder="Enter your primary API key here..."
                            value={userApiKey}
                            onChange={(e) => setUserApiKey(e.target.value)}
                            className="w-full bg-black/5 rounded-xl px-4 py-2.5 focus:outline-none focus:ring-1 focus:ring-[#3776ab]/20 text-sm"
                          />
                        </div>
                        <p className="text-[10px] opacity-40 italic">
                          When custom keys are OFF, PyGuide uses environment variables with this primary key as the first priority.
                        </p>
                      </div>
                    )}

                    <div className="p-4 bg-yellow-500/5 rounded-2xl border border-yellow-500/10">
                      <p className="text-[10px] text-yellow-600 leading-relaxed">
                        <strong>Security Note:</strong> Your keys are stored locally in your browser's <code>localStorage</code>. They are never sent to any server except directly to Google's API endpoints.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-6 border-t border-black/5 shrink-0">
                <button 
                  onClick={() => setIsSettingsOpen(false)}
                  className="w-full py-3 bg-black text-white rounded-xl font-bold hover:bg-black/80 transition-all"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function AppContent() {
  const [isAccepted, setIsAccepted] = useState<boolean | null>(null);

  const checkAcceptance = () => {
    const accepted = localStorage.getItem('pyguide_privacy_accepted');
    setIsAccepted(accepted === 'true');
  };

  useEffect(() => {
    checkAcceptance();
    
    // Listen for storage changes (in case of multiple tabs, though not strictly needed here)
    window.addEventListener('storage', checkAcceptance);
    return () => window.removeEventListener('storage', checkAcceptance);
  }, []);

  if (isAccepted === null) return null;

  return (
    <Routes>
      <Route path="/main" element={<LandingPage onAccept={checkAcceptance} />} />
      <Route 
        path="/" 
        element={isAccepted ? <ChatInterface /> : <Navigate to="/main" replace />} 
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  );
}
