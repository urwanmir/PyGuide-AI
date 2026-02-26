import React, { useEffect, useRef, useState } from 'react';
import { Mic, MicOff, X, Zap, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { connectLive } from '../services/gemini';
import { cn } from '../lib/utils';

interface LiveVoiceProps {
  onClose: () => void;
  userApiKey?: string;
  customKeys?: string[];
  useCustomKeys?: boolean;
}

export const LiveVoice: React.FC<LiveVoiceProps> = ({ onClose, userApiKey, customKeys, useCustomKeys }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [transcript, setTranscript] = useState('');
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const processorRef = useRef<ScriptProcessorNode | null>(null);

  useEffect(() => {
    const startLive = async () => {
      try {
        audioContextRef.current = new AudioContext({ sampleRate: 16000 });
        streamRef.current = await navigator.mediaDevices.getUserMedia({ audio: true });
        
        const sessionPromise = connectLive({
          onopen: () => {
            setIsConnected(true);
            setIsConnecting(false);
            startStreaming();
          },
          onmessage: async (message) => {
            if (message.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data) {
              playAudio(message.serverContent.modelTurn.parts[0].inlineData.data);
            }
            if (message.serverContent?.modelTurn?.parts?.[0]?.text) {
              setTranscript(prev => prev + ' ' + message.serverContent.modelTurn.parts[0].text);
            }
          },
          onerror: (err) => {
            console.error("Live API Error:", err);
            onClose();
          },
          onclose: () => {
            setIsConnected(false);
            onClose();
          }
        }, userApiKey, customKeys, useCustomKeys);

        sessionRef.current = await sessionPromise;
      } catch (err) {
        console.error("Failed to start Live API:", err);
        onClose();
      }
    };

    startLive();

    return () => {
      stopStreaming();
      sessionRef.current?.close();
      streamRef.current?.getTracks().forEach(track => track.stop());
      audioContextRef.current?.close();
    };
  }, []);

  const startStreaming = () => {
    if (!audioContextRef.current || !streamRef.current || !sessionRef.current) return;

    const source = audioContextRef.current.createMediaStreamSource(streamRef.current);
    processorRef.current = audioContextRef.current.createScriptProcessor(4096, 1, 1);

    processorRef.current.onaudioprocess = (e) => {
      if (isMuted) return;
      
      const inputData = e.inputBuffer.getChannelData(0);
      const pcmData = new Int16Array(inputData.length);
      for (let i = 0; i < inputData.length; i++) {
        pcmData[i] = Math.max(-1, Math.min(1, inputData[i])) * 0x7FFF;
      }
      
      const base64Data = btoa(String.fromCharCode(...new Uint8Array(pcmData.buffer)));
      sessionRef.current.sendRealtimeInput({
        media: { data: base64Data, mimeType: 'audio/pcm;rate=16000' }
      });
    };

    source.connect(processorRef.current);
    processorRef.current.connect(audioContextRef.current.destination);
  };

  const stopStreaming = () => {
    processorRef.current?.disconnect();
    processorRef.current = null;
  };

  const playAudio = (base64Data: string) => {
    if (!audioContextRef.current) return;
    
    const binaryString = atob(base64Data);
    const bytes = new Uint8Array(binaryString.length);
    for (let i = 0; i < binaryString.length; i++) {
      bytes[i] = binaryString.charCodeAt(i);
    }
    
    const pcmData = new Int16Array(bytes.buffer);
    const floatData = new Float32Array(pcmData.length);
    for (let i = 0; i < pcmData.length; i++) {
      floatData[i] = pcmData[i] / 0x7FFF;
    }

    const buffer = audioContextRef.current.createBuffer(1, floatData.length, 16000);
    buffer.getChannelData(0).set(floatData);
    
    const source = audioContextRef.current.createBufferSource();
    source.buffer = buffer;
    source.connect(audioContextRef.current.destination);
    source.start();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b border-black/5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#3776ab]/10 flex items-center justify-center">
              <Zap size={20} className="text-[#3776ab]" />
            </div>
            <div>
              <h3 className="font-bold">Live Voice Mode</h3>
              <p className="text-xs opacity-40">{isConnected ? 'Connected' : 'Connecting...'}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-12 flex flex-col items-center justify-center gap-8">
          <div className="relative">
            <div className={cn(
              "w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500",
              isConnected ? "bg-[#3776ab] shadow-[0_0_40px_rgba(55,118,171,0.4)]" : "bg-black/5"
            )}>
              {isConnecting ? (
                <Loader2 size={48} className="text-[#3776ab] animate-spin" />
              ) : (
                <Mic size={48} className={cn(isConnected ? "text-white" : "text-black/20")} />
              )}
            </div>
            {isConnected && (
              <motion.div 
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="absolute inset-0 rounded-full border-2 border-[#3776ab]/30"
              />
            )}
          </div>

          <div className="text-center space-y-2">
            <p className="text-sm font-medium opacity-60">
              {isConnected ? "I'm listening... Go ahead and speak!" : "Initializing secure connection..."}
            </p>
            {transcript && (
              <p className="text-xs italic opacity-40 max-w-xs mx-auto line-clamp-2">
                "{transcript}"
              </p>
            )}
          </div>
        </div>

        <div className="p-6 bg-black/5 flex items-center justify-center gap-4">
          <button 
            onClick={() => setIsMuted(!isMuted)}
            className={cn(
              "w-12 h-12 rounded-full flex items-center justify-center transition-all",
              isMuted ? "bg-red-500 text-white" : "bg-white text-black shadow-sm hover:bg-black/5"
            )}
          >
            {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          <button 
            onClick={onClose}
            className="px-8 py-3 bg-black text-white rounded-full font-bold hover:bg-black/80 transition-all"
          >
            End Session
          </button>
        </div>
      </div>
    </motion.div>
  );
};

