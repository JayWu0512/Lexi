
import React, { useState, useRef, useEffect, useContext } from 'react';
import { MessageCircle, X, Send, User, Bot, Loader2, Sparkles, Volume2, StopCircle, Wand2, BookOpen, Mic } from 'lucide-react';
import { sendChatToCoach, ChatMessage } from '../services/ai';
import { PageContext, AccessibilityContext, DictionaryPopup } from './Shared';
import { fetchDefinition } from '../services/utils';
import { DictionaryResult } from '../types';

export const AIChatSidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Interactive Features State
  const [dictResult, setDictResult] = useState<DictionaryResult | null>(null);
  const [dictPos, setDictPos] = useState<{x: number, y: number} | null>(null);
  const [isLoadingDict, setIsLoadingDict] = useState(false);
  const [speakingMsgIndex, setSpeakingMsgIndex] = useState<number | null>(null);
  
  // Voice Input State
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);

  const { pageText } = useContext(PageContext);
  const { settings } = useContext(AccessibilityContext);

  // Suggested Actions based on Context
  const defaultSuggestions = ["Tell me a joke", "How do I focus?", "Help me write", "I'm bored"];
  const contextSuggestions = ["Summarize this", "Explain hard words", "Give me a quiz", "Explain like I'm 5"];
  const suggestions = pageText ? contextSuggestions : defaultSuggestions;

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking, isListening]);

  // Cleanup speech on unmount
  useEffect(() => {
    return () => {
      synthRef.current.cancel();
      if (recognitionRef.current) recognitionRef.current.stop();
    };
  }, []);

  // Voice Recognition Setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false; // Stop after one sentence for chat feel
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        // Update input but don't send yet
        setInput(transcript);
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
        // Optional: Auto-send could happen here if we wanted
      };

      recognitionRef.current.onerror = (event: any) => {
        console.error("Speech recognition error", event.error);
        setIsListening(false);
      };
    }
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert("Voice input not supported in this browser.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInput(''); // Clear input to start fresh
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const handleSend = async (textOverride?: string) => {
    const textToSend = textOverride || input;
    if (!textToSend.trim() || isThinking) return;

    // Stop listening if active
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userMsg: ChatMessage = { role: 'user', text: textToSend };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsThinking(true);

    try {
      const responseText = await sendChatToCoach(messages, userMsg.text, pageText);
      const botMsg: ChatMessage = { role: 'model', text: responseText };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'model', text: "I'm having a little trouble connecting. Try again?" }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // --- Interactive Features ---

  const handleWordClick = async (e: React.MouseEvent, word: string) => {
    e.stopPropagation();
    const cleanWord = word.replace(/^[^\w]+|[^\w]+$/g, '');
    if (!cleanWord) return;

    // Stop speaking if clicking a word
    if (speakingMsgIndex !== null) {
        synthRef.current.cancel();
        setSpeakingMsgIndex(null);
    }

    setIsLoadingDict(true);
    // Adjust position to avoid going off-screen
    const x = Math.min(e.clientX, window.innerWidth - 320); 
    setDictPos({ x, y: e.clientY });
    
    const result = await fetchDefinition(cleanWord);
    setDictResult(result);
    setIsLoadingDict(false);
  };

  const handleSpeak = (index: number, text: string) => {
    if (speakingMsgIndex === index) {
      synthRef.current.cancel();
      setSpeakingMsgIndex(null);
      return;
    }

    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text.replace(/\*\*/g, '')); // Remove bold markdown for speech
    utterance.onend = () => setSpeakingMsgIndex(null);
    utterance.onerror = () => setSpeakingMsgIndex(null);
    
    setSpeakingMsgIndex(index);
    synthRef.current.speak(utterance);
  };

  const handleSimplify = () => {
    handleSend("Can you explain that last part again, but simpler?");
  };

  // Render text with clickable words and bold formatting
  const renderInteractiveText = (text: string, isUser: boolean) => {
    // 1. Split by bold markers
    const parts = text.split(/(\*\*.*?\*\*)/g);
    
    return parts.map((part, pIdx) => {
      const isBold = part.startsWith('**') && part.endsWith('**');
      const cleanPart = isBold ? part.slice(2, -2) : part;
      
      // 2. Split by spaces/newlines but PRESERVE them using capturing group
      // This fixes the "weird spacing" issue by respecting original whitespace
      return cleanPart.split(/(\s+)/).map((token, wIdx) => {
        // If it's whitespace, render as is
        if (/^\s+$/.test(token)) {
          return <span key={`${pIdx}-${wIdx}`}>{token}</span>;
        }

        // If it's empty
        if (!token) return null;
        
        // Render interactive word
        return (
          <span 
            key={`${pIdx}-${wIdx}`}
            onClick={(e) => handleWordClick(e, token)}
            className={`
              cursor-pointer transition-colors duration-200
              ${isBold ? 'font-bold' : ''}
              ${isUser 
                 ? (settings.isHighContrast ? 'hover:text-yellow-200 hover:underline' : 'hover:text-indigo-100 hover:underline') 
                 : (settings.isHighContrast ? 'hover:text-blue-400 hover:underline' : 'hover:text-indigo-600 hover:bg-indigo-50 rounded px-0.5')
              }
            `}
          >
            {token}
          </span>
        );
      });
    });
  };

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-[60] p-4 rounded-full shadow-2xl transition-all hover:scale-110 active:scale-95 flex items-center justify-center ${settings.isHighContrast ? 'bg-yellow-400 text-black border-4 border-black' : 'bg-indigo-600 text-white hover:bg-indigo-700'}`}
        aria-label="Open Learning Coach"
      >
        {isOpen ? <X size={28} /> : <MessageCircle size={28} />}
      </button>

      {/* Chat Panel */}
      <div 
        className={`
          fixed bottom-24 right-6 z-50 w-[90vw] md:w-96 h-[600px] max-h-[80vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden transition-all transform origin-bottom-right
          ${isOpen ? 'scale-100 opacity-100' : 'scale-0 opacity-0 pointer-events-none'}
          ${settings.isHighContrast ? 'bg-black border-4 border-yellow-400' : 'bg-white border border-gray-200'}
        `}
      >
        {/* Header */}
        <div className={`p-4 flex items-center justify-between ${settings.isHighContrast ? 'bg-yellow-400 text-black' : 'bg-indigo-600 text-white'}`}>
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/20 rounded-full backdrop-blur-sm">
              <Bot size={20} />
            </div>
            <div>
              <h3 className="font-bold text-lg leading-none">LD Coach</h3>
              <p className="text-xs opacity-80 mt-1">Here to help you learn!</p>
            </div>
          </div>
          {pageText && (
            <span className="text-[10px] px-2 py-1 rounded-full bg-white/20 backdrop-blur-md flex items-center">
              <Sparkles size={10} className="mr-1" /> Reading with you
            </span>
          )}
        </div>

        {/* Messages Area */}
        <div className={`flex-grow overflow-y-auto p-4 space-y-6 ${settings.isHighContrast ? 'bg-black' : 'bg-slate-50'}`}>
          {messages.length === 0 && (
            <div className="text-center py-10 opacity-60">
              <Bot size={48} className="mx-auto mb-4 text-gray-400" />
              <p className="text-sm px-6">
                Hi! I'm your learning coach. 
                {pageText ? " I can see the text you're reading. " : " "}
                Click any word to define it, or ask me to explain things simply!
              </p>
            </div>
          )}
          
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div 
                className={`
                  max-w-[90%] p-3.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap relative group
                  ${msg.role === 'user' 
                    ? (settings.isHighContrast ? 'bg-white text-black font-bold border-2 border-yellow-400' : 'bg-indigo-600 text-white rounded-br-none') 
                    : (settings.isHighContrast ? 'bg-yellow-400 text-black font-bold' : 'bg-white border border-gray-200 text-slate-800 rounded-bl-none shadow-sm')
                  }
                `}
              >
                {renderInteractiveText(msg.text, msg.role === 'user')}
              </div>
              
              {/* Bot Action Bar */}
              {msg.role === 'model' && (
                <div className="flex space-x-2 mt-1 ml-1 opacity-100 transition-opacity">
                   <button 
                     onClick={() => handleSpeak(idx, msg.text)}
                     className={`p-1.5 rounded-full transition-colors ${speakingMsgIndex === idx ? 'bg-red-100 text-red-500' : 'hover:bg-gray-100 text-gray-400'}`}
                     title={speakingMsgIndex === idx ? "Stop" : "Read Aloud"}
                   >
                     {speakingMsgIndex === idx ? <StopCircle size={14} /> : <Volume2 size={14} />}
                   </button>
                   {idx === messages.length - 1 && !isThinking && (
                     <button 
                       onClick={handleSimplify}
                       className="p-1.5 rounded-full hover:bg-gray-100 text-gray-400 hover:text-purple-500 transition-colors"
                       title="Simplify this answer"
                     >
                       <Wand2 size={14} />
                     </button>
                   )}
                </div>
              )}
            </div>
          ))}
          
          {isThinking && (
            <div className="flex justify-start">
              <div className={`p-4 rounded-2xl rounded-bl-none flex items-center space-x-2 ${settings.isHighContrast ? 'bg-yellow-400 text-black' : 'bg-white border border-gray-200'}`}>
                <Loader2 size={16} className="animate-spin text-indigo-500" />
                <span className="text-xs font-bold text-gray-500">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input & Suggestions Area */}
        <div className={`border-t flex-shrink-0 ${settings.isHighContrast ? 'bg-black border-yellow-400' : 'bg-white border-gray-100'}`}>
          
          {/* Quick Suggestions */}
          {!isThinking && (
             <div className="px-4 pt-3 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {suggestions.map((suggestion, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(suggestion)}
                    className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-bold border transition-colors ${
                      settings.isHighContrast 
                        ? 'border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black' 
                        : 'border-indigo-100 bg-indigo-50 text-indigo-600 hover:bg-indigo-100'
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
             </div>
          )}

          <div className="p-4 relative flex items-center gap-2">
            <button
               onClick={toggleVoiceInput}
               className={`p-2.5 rounded-xl transition-all ${
                 isListening 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : (settings.isHighContrast ? 'text-yellow-400 hover:bg-white/10' : 'bg-gray-50 text-gray-500 hover:bg-gray-100')
               }`}
               title="Voice Input"
            >
               {isListening ? <StopCircle size={20} /> : <Mic size={20} />}
            </button>

            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder={isListening ? "Listening..." : "Ask me anything..."}
              className={`flex-grow px-4 py-3 rounded-xl border focus:outline-none focus:ring-2 transition-all ${settings.isHighContrast ? 'bg-black text-yellow-400 border-yellow-400 focus:ring-yellow-200' : 'bg-gray-50 border-gray-200 focus:bg-white focus:ring-indigo-500'}`}
            />
            
            <button 
              onClick={() => handleSend()}
              disabled={!input.trim() || isThinking}
              className={`p-2.5 rounded-xl transition-colors ${!input.trim() ? 'text-gray-300' : (settings.isHighContrast ? 'bg-yellow-400 text-black hover:bg-yellow-300' : 'bg-indigo-600 text-white hover:bg-indigo-700')}`}
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>

      {/* Dictionary Popup Portal */}
      <DictionaryPopup 
        result={dictResult} 
        position={dictPos} 
        onClose={() => setDictPos(null)} 
        isLoading={isLoadingDict}
      />
    </>
  );
};
