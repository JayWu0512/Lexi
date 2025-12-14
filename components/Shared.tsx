

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { Link, useLocation } from 'react-router-dom';
import { UserRole, AccessibilityState, DictionaryResult } from '../types';
import { fetchDefinition, getVoices } from '../services/utils';
import { getSimplifiedText } from '../services/ai';
import { 
  BookOpen, 
  Volume2, 
  Pause, 
  Play, 
  Settings, 
  X, 
  Search,
  Home,
  Menu,
  RotateCcw,
  Gauge,
  Type,
  Maximize,
  Minimize,
  StopCircle,
  Wand2,
  Sparkles,
  Loader2,
  AlertCircle,
  Layout,
  Briefcase,
  Target,
  Timer,
  ChevronDown,
  Users,
  Calculator
} from 'lucide-react';

// --- Context for Accessibility ---
export const AccessibilityContext = React.createContext<{
  settings: AccessibilityState;
  setSettings: React.Dispatch<React.SetStateAction<AccessibilityState>>;
}>({
  settings: { isDyslexicFont: false, isHighContrast: false, isFocusMode: false, textSize: 'normal' },
  setSettings: () => {},
});

// --- Context for Page Content (AI Awareness) ---
export const PageContext = React.createContext<{
  pageText: string | null;
  setPageText: (text: string | null) => void;
}>({
  pageText: null,
  setPageText: () => {},
});

export const PageContextProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [pageText, setPageText] = useState<string | null>(null);
  return (
    <PageContext.Provider value={{ pageText, setPageText }}>
      {children}
    </PageContext.Provider>
  );
};

// --- Context for Focus Timer (Global) ---
export type FocusMode = 'focus' | 'break' | 'dash';

interface FocusContextType {
  timeLeft: number;
  isActive: boolean;
  mode: FocusMode;
  toggleTimer: () => void;
  resetTimer: () => void;
  switchMode: (newMode: FocusMode) => void;
  formatTime: (seconds: number) => string;
  totalTime: number; // To calculate progress
}

export const FocusContext = React.createContext<FocusContextType>({
  timeLeft: 25 * 60,
  isActive: false,
  mode: 'focus',
  toggleTimer: () => {},
  resetTimer: () => {},
  switchMode: () => {},
  formatTime: () => "00:00",
  totalTime: 25 * 60,
});

export const FocusProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const FOCUS_TIME = 25 * 60;
  const BREAK_TIME = 5 * 60;
  const DASH_TIME = 5 * 60;

  const [mode, setMode] = useState<FocusMode>('focus');
  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isActive, setIsActive] = useState(false);
  const [totalTime, setTotalTime] = useState(FOCUS_TIME);

  // Timer Logic
  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((time) => time - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      // Optional: Sound effect could play here
      if (mode === 'focus') {
         // Auto-switch logic or notification could go here
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, mode]);

  const toggleTimer = () => setIsActive(!isActive);

  const switchMode = (newMode: FocusMode) => {
    setIsActive(false);
    setMode(newMode);
    let newTime = FOCUS_TIME;
    if (newMode === 'break') newTime = BREAK_TIME;
    if (newMode === 'dash') newTime = DASH_TIME;
    setTimeLeft(newTime);
    setTotalTime(newTime);
  };

  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(totalTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <FocusContext.Provider value={{ timeLeft, isActive, mode, toggleTimer, resetTimer, switchMode, formatTime, totalTime }}>
      {children}
    </FocusContext.Provider>
  );
};

// --- Components ---

export const Navbar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false); // Mobile Menu
  const [isPortalsOpen, setIsPortalsOpen] = useState(false); // Portals Dropdown
  
  const location = useLocation();
  const { settings, setSettings } = React.useContext(AccessibilityContext);
  const { timeLeft, isActive, formatTime, mode } = React.useContext(FocusContext); // Consume Timer Data
  const [showSettings, setShowSettings] = useState(false);

  // Close menus when route changes
  useEffect(() => {
    setIsOpen(false);
    setIsPortalsOpen(false);
    setShowSettings(false);
  }, [location]);

  const toggleSetting = (key: keyof AccessibilityState) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const setFontSize = (size: 'normal' | 'large' | 'xl') => {
    setSettings(prev => ({ ...prev, textSize: size }));
  };

  // Group 1: Role Portals
  const portalLinks = [
    { name: 'Students', path: '/student', icon: BookOpen },
    { name: 'Parents', path: '/parent', icon: Home },
    { name: 'Teachers', path: '/teacher', icon: BookOpen },
    { name: 'Adults', path: '/adult', icon: Briefcase },
  ];

  // Group 2: Tools & Resources
  const toolLinks = [
    { name: 'Math Play', path: '/math-playground', icon: Calculator },
    { name: 'Focus Zone', path: '/focus', icon: Target },
    { name: 'Visual Lab', path: '/visual', icon: Layout },
    { name: 'Resources', path: '/resources', icon: Search },
  ];

  // Check if any portal link is active for highlighting the parent button
  const isPortalActive = portalLinks.some(link => location.pathname.startsWith(link.path));

  // Helper to determine active link style
  const getLinkClass = (path: string) => {
    const isActiveLink = location.pathname.startsWith(path);
    if (isActiveLink) {
       return settings.isHighContrast ? 'bg-slate-800 underline' : 'bg-brand-50 text-brand-700';
    }
    return 'hover:bg-gray-100/10';
  };

  return (
    <nav className={`sticky top-0 z-50 shadow-sm transition-colors duration-300 ${settings.isHighContrast ? 'bg-slate-900 text-yellow-400 border-b border-yellow-400' : 'bg-white text-slate-800 border-b border-slate-200'}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${settings.isHighContrast ? 'bg-yellow-400 text-black' : 'bg-brand-600 text-white'}`}>
                <span className="font-bold text-lg">LD</span>
              </div>
              <span className="font-bold text-xl tracking-tight hidden sm:block">Support Hub</span>
            </Link>
          </div>

          <div className="hidden md:flex space-x-2 lg:space-x-4 items-center">
             
             {/* Portals Dropdown */}
             <div className="relative">
               <button 
                 onClick={() => setIsPortalsOpen(!isPortalsOpen)}
                 className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                   isPortalActive
                   ? (settings.isHighContrast ? 'bg-slate-800 text-yellow-400 border border-yellow-400' : 'bg-brand-50 text-brand-700')
                   : (settings.isHighContrast ? 'text-yellow-400 hover:bg-slate-800' : 'text-slate-600 hover:bg-gray-50')
                 }`}
               >
                 <Users size={16} className="mr-1.5" />
                 Portals
                 <ChevronDown size={14} className={`ml-1.5 transition-transform duration-200 ${isPortalsOpen ? 'rotate-180' : ''}`} />
               </button>

               {isPortalsOpen && (
                 <div className={`absolute left-0 mt-2 w-56 rounded-xl shadow-xl border overflow-hidden z-50 animate-fade-in-up ${
                   settings.isHighContrast ? 'bg-slate-900 border-yellow-400' : 'bg-white border-slate-100'
                 }`}>
                   {portalLinks.map((link) => (
                      <Link 
                        key={link.path} 
                        to={link.path}
                        className={`flex items-center px-4 py-3 text-sm font-medium transition-colors border-b last:border-0 ${settings.isHighContrast ? 'border-slate-800 hover:bg-yellow-900' : 'border-slate-50 hover:bg-slate-50 text-slate-700'}`}
                      >
                        <link.icon size={16} className={`mr-3 ${settings.isHighContrast ? 'text-yellow-400' : 'text-brand-500'}`} />
                        {link.name}
                      </Link>
                   ))}
                 </div>
               )}
             </div>

             <div className="h-6 w-px bg-gray-200 mx-2 hidden lg:block"></div>

             {/* Tools Links */}
             {toolLinks.map((link) => {
                // Special rendering for Focus Zone when timer is active
                if (link.name === 'Focus Zone' && isActive) {
                  const timerColor = mode === 'break' ? 'text-green-600 bg-green-50' : (mode === 'dash' ? 'text-orange-600 bg-orange-50' : 'text-blue-600 bg-blue-50');
                  return (
                    <Link 
                      key={link.path}
                      to={link.path}
                      className={`flex items-center px-3 py-2 rounded-md text-sm font-bold transition-all animate-pulse ${timerColor} border border-current`}
                    >
                      <Timer size={16} className="mr-1.5" />
                      {formatTime(timeLeft)}
                    </Link>
                  );
                }

                return (
                  <Link 
                    key={link.path} 
                    to={link.path}
                    className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${getLinkClass(link.path)}`}
                  >
                    {link.name === 'Visual Lab' && <Layout size={16} className="mr-1.5" />}
                    {link.name === 'Focus Zone' && <Target size={16} className="mr-1.5" />}
                    {link.name === 'Math Play' && <Calculator size={16} className="mr-1.5" />}
                    {link.name}
                  </Link>
                );
             })}
             
             {/* Accessibility Toggle */}
             <button 
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 ml-2 rounded-full hover:bg-gray-200/20 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500"
              aria-label="Accessibility Settings"
             >
               <Settings className="h-5 w-5" />
             </button>
          </div>

           {/* Mobile menu button */}
           <div className="flex items-center md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-brand-500"
            >
              <Menu className="block h-6 w-6" />
            </button>
          </div>
        </div>
      </div>

      {/* Accessibility Settings Panel */}
      {showSettings && (
        <div className="absolute right-0 mt-2 w-72 bg-white shadow-xl border border-gray-200 rounded-lg p-4 z-50 mr-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-900">Accessibility</h3>
            <button onClick={() => setShowSettings(false)}><X className="h-4 w-4" /></button>
          </div>
          
          <div className="space-y-3">
            <label className="flex items-center justify-between text-gray-800">
              <span>Dyslexia Font</span>
              <input type="checkbox" checked={settings.isDyslexicFont} onChange={() => toggleSetting('isDyslexicFont')} className="h-4 w-4 text-brand-600" />
            </label>
            <label className="flex items-center justify-between text-gray-800">
              <span>High Contrast</span>
              <input type="checkbox" checked={settings.isHighContrast} onChange={() => toggleSetting('isHighContrast')} className="h-4 w-4 text-brand-600" />
            </label>
            <label className="flex items-center justify-between text-gray-800">
              <span>Focus Mode</span>
              <input type="checkbox" checked={settings.isFocusMode} onChange={() => toggleSetting('isFocusMode')} className="h-4 w-4 text-brand-600" />
            </label>
            
            <div className="pt-2">
              <span className="block text-sm text-gray-600 mb-2">Text Size</span>
              <div className="flex space-x-2">
                <button onClick={() => setFontSize('normal')} className={`px-2 py-1 border rounded ${settings.textSize === 'normal' ? 'bg-brand-100 border-brand-500' : 'bg-gray-50 text-black'}`}>A</button>
                <button onClick={() => setFontSize('large')} className={`px-2 py-1 border rounded text-lg ${settings.textSize === 'large' ? 'bg-brand-100 border-brand-500' : 'bg-gray-50 text-black'}`}>A</button>
                <button onClick={() => setFontSize('xl')} className={`px-2 py-1 border rounded text-xl ${settings.textSize === 'xl' ? 'bg-brand-100 border-brand-500' : 'bg-gray-50 text-black'}`}>A</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
             
             {/* Mobile Portals Accordion */}
             <div className="border-b border-gray-100 pb-2 mb-2">
               <button 
                 onClick={() => setIsPortalsOpen(!isPortalsOpen)}
                 className={`w-full flex items-center justify-between px-3 py-2 rounded-md text-base font-bold ${settings.isHighContrast ? 'text-yellow-400' : 'text-gray-800'}`}
               >
                 <span className="flex items-center"><Users size={18} className="mr-2" /> Portals</span>
                 <ChevronDown size={16} className={`transform transition-transform ${isPortalsOpen ? 'rotate-180' : ''}`} />
               </button>
               
               {isPortalsOpen && (
                 <div className="pl-4 space-y-1 mt-1 animate-fade-in-up">
                   {portalLinks.map((link) => (
                      <Link 
                        key={link.path} 
                        to={link.path}
                        className={`flex items-center px-3 py-2 rounded-md text-sm font-medium ${settings.isHighContrast ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:bg-gray-50'}`}
                      >
                        <link.icon size={16} className="mr-2" />
                        {link.name}
                      </Link>
                   ))}
                 </div>
               )}
             </div>

             {/* Tools */}
             {toolLinks.map((link) => (
                <Link 
                  key={link.path} 
                  to={link.path}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                  onClick={() => setIsOpen(false)}
                >
                  {link.name === 'Focus Zone' && isActive ? (
                    <span className="flex items-center text-blue-600 font-bold">
                       <Timer size={16} className="mr-2" /> {formatTime(timeLeft)}
                    </span>
                  ) : link.name}
                </Link>
             ))}

             <button 
               onClick={() => { setShowSettings(!showSettings); setIsOpen(false); }}
               className="block w-full text-left px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50 mt-4 border-t border-gray-100 pt-4"
             >
               Accessibility Settings
             </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export const DictionaryPopup: React.FC<{ 
  result: DictionaryResult | null; 
  position: { x: number, y: number } | null; 
  onClose: () => void;
  isLoading: boolean;
}> = ({ result, position, onClose, isLoading }) => {
  if (!position) return null;

  const playAudio = () => {
    if (result?.audioUrl) {
      const audio = new Audio(result.audioUrl);
      audio.play().catch(e => console.error("Audio play failed", e));
    }
  };

  return createPortal(
    <div 
      className="fixed z-[1000] bg-white border border-gray-200 shadow-2xl rounded-xl p-5 w-80 max-w-[90vw] animate-fade-in-up"
      style={{ left: Math.min(position.x, window.innerWidth - 320), top: position.y + 20 }}
    >
      <div className="flex justify-between items-start mb-3 border-b border-gray-100 pb-3">
        <div className="flex flex-col">
          <h4 className="font-bold text-2xl capitalize text-brand-900 leading-tight">
            {isLoading ? 'Loading...' : result?.word || 'Not found'}
          </h4>
          {result?.phonetic && <span className="text-gray-400 font-mono text-sm mt-1">{result.phonetic}</span>}
        </div>
        <div className="flex items-center gap-2">
            {result?.audioUrl && (
              <button 
                onClick={playAudio} 
                className="p-2 rounded-full bg-brand-50 text-brand-600 hover:bg-brand-100 hover:text-brand-700 transition-colors shadow-sm"
                title="Listen to pronunciation"
              >
                <Volume2 size={18} />
              </button>
            )}
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 rounded-full transition-colors">
              <X className="h-5 w-5" />
            </button>
        </div>
      </div>
      
      {isLoading ? (
         <div className="animate-pulse flex space-x-4 py-2">
           <div className="flex-1 space-y-3">
             <div className="h-2 bg-gray-200 rounded w-1/4"></div>
             <div className="h-2 bg-gray-200 rounded"></div>
             <div className="h-2 bg-gray-200 rounded w-5/6"></div>
           </div>
         </div>
      ) : result ? (
        <div className="text-sm space-y-4">
          {result.meanings.slice(0, 1).map((m, idx) => (
            <div key={idx}>
              <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 mb-2 border border-slate-200">
                {m.partOfSpeech}
              </span>
              <p className="text-slate-800 leading-relaxed text-[15px]">{m.definitions[0].definition}</p>
              {m.definitions[0].example && (
                <div className="mt-2 pl-3 border-l-2 border-brand-200 bg-brand-50/30 py-1 pr-1 rounded-r">
                   <p className="text-slate-500 italic">"{m.definitions[0].example}"</p>
                </div>
              )}
            </div>
          ))}

          {result.synonyms && result.synonyms.length > 0 && (
             <div className="pt-3 border-t border-gray-100">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Synonyms</p>
                <div className="flex flex-wrap gap-2">
                   {result.synonyms.map(syn => (
                      <span key={syn} className="px-2.5 py-1 bg-slate-50 text-slate-600 text-xs rounded-full border border-slate-200 hover:border-brand-300 hover:text-brand-600 cursor-default transition-colors">
                        {syn}
                      </span>
                   ))}
                </div>
             </div>
          )}
        </div>
      ) : (
        <p className="text-sm text-gray-500 py-2">No definition found. Try selecting a simpler word or check your spelling.</p>
      )}
    </div>,
    document.body
  );
};

// --- Immersive Reader Component ---

interface SentenceObj {
  text: string;
  globalIndex: number;
}

interface BlockObj {
  sentences: SentenceObj[];
}

export const InteractiveText: React.FC<{ content: string }> = ({ content }) => {
  const { settings, setSettings } = React.useContext(AccessibilityContext);
  const { setPageText } = React.useContext(PageContext);
  const [dictResult, setDictResult] = useState<DictionaryResult | null>(null);
  const [dictPos, setDictPos] = useState<{x: number, y: number} | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Update Global Context with content for AI Coach
  useEffect(() => {
    setPageText(content);
    return () => setPageText(null); // Clear context on unmount
  }, [content, setPageText]);

  // Simplification State
  const [viewMode, setViewMode] = useState<'original' | 'simple'>('original');
  const [simplifiedText, setSimplifiedText] = useState<string | null>(null);
  const [isSimplifying, setIsSimplifying] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Reading State
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentGlobalIndex, setCurrentGlobalIndex] = useState(-1);
  const [playbackRate, setPlaybackRate] = useState(0.9);
  
  const synthRef = useRef<SpeechSynthesis>(window.speechSynthesis);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // --- DATA PARSING ---
  const contentToRender = viewMode === 'simple' && simplifiedText ? simplifiedText : content;
  
  const { blocks, flatSentences } = useMemo(() => {
    const paragraphs = contentToRender.split(/\n+/).filter(p => p.trim().length > 0);
    
    let globalCounter = 0;
    const _flatSentences: string[] = [];
    const _blocks: BlockObj[] = [];

    paragraphs.forEach(para => {
      const rawSentences = para.match(/[^.!?]+[.!?]+(\s|$)|[^.!?]+$/g) || [para];
      const blockSentences: SentenceObj[] = [];
      let buffer = ""; 

      rawSentences.forEach(s => {
        if (/^(\d+|[a-zA-Z])\.\s*$/.test(s)) {
            buffer += s;
            return;
        }

        const fullText = buffer + s;
        buffer = ""; 
        
        const trimmed = fullText.trim();
        if (trimmed.length > 0) {
          const speechText = trimmed.replace(/\*\*/g, '');
          _flatSentences.push(speechText);
          blockSentences.push({
            text: trimmed, 
            globalIndex: globalCounter
          });
          globalCounter++;
        }
      });
      
      if (buffer.trim().length > 0) {
          const speechText = buffer.trim().replace(/\*\*/g, '');
          _flatSentences.push(speechText);
          blockSentences.push({
            text: buffer.trim(),
            globalIndex: globalCounter
          });
          globalCounter++;
      }

      if (blockSentences.length > 0) {
        _blocks.push({ sentences: blockSentences });
      }
    });

    return { blocks: _blocks, flatSentences: _flatSentences };
  }, [contentToRender]);


  // Playback Logic
  const playSentence = useCallback((index: number) => {
    if (index >= flatSentences.length) {
      setIsPlaying(false);
      setCurrentGlobalIndex(-1);
      return;
    }

    synthRef.current.cancel();

    const text = flatSentences[index]; 
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = playbackRate;
    
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v => v.name.includes('Google US English')) || voices.find(v => v.lang === 'en-US');
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onend = () => {
      if (isPlaying) { 
        playSentence(index + 1);
      }
    };

    utterance.onerror = (e) => {
      if (e.error === 'canceled' || e.error === 'interrupted') return;
      console.error("Speech error", e);
      setIsPlaying(false);
    };

    utteranceRef.current = utterance;
    setCurrentGlobalIndex(index);
    synthRef.current.speak(utterance);

    const el = document.getElementById(`sentence-${index}`);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

  }, [flatSentences, playbackRate, isPlaying]);

  // Handle simplification
  const toggleSimplify = async () => {
    setErrorMsg(null);
    if (viewMode === 'simple') {
      setViewMode('original');
      handleStop(); 
      return;
    }

    if (simplifiedText) {
      setViewMode('simple');
      handleStop();
      return;
    }

    setIsSimplifying(true);
    handleStop();
    try {
      const result = await getSimplifiedText(content);
      setSimplifiedText(result);
      setViewMode('simple');
    } catch (e: any) {
      console.error("Simplification error:", e);
      setErrorMsg(e.message || "Failed to simplify text.");
    } finally {
      setIsSimplifying(false);
    }
  };

  useEffect(() => {
    if (isPlaying && currentGlobalIndex === -1) {
      playSentence(0);
    } else if (!isPlaying) {
      synthRef.current.cancel();
    }
  }, [isPlaying, playSentence]); 

  useEffect(() => {
    return () => synthRef.current.cancel();
  }, []);

  const handleStop = () => {
    setIsPlaying(false);
    setCurrentGlobalIndex(-1);
    synthRef.current.cancel();
  };

  const handleRestart = () => {
    synthRef.current.cancel();
    setCurrentGlobalIndex(0);
    setIsPlaying(true);
    playSentence(0);
  };

  const toggleFont = () => {
    setSettings(prev => ({ ...prev, isDyslexicFont: !prev.isDyslexicFont }));
  };

  const toggleSize = () => {
    setSettings(prev => ({ 
      ...prev, 
      textSize: prev.textSize === 'normal' ? 'large' : (prev.textSize === 'large' ? 'xl' : 'normal') 
    }));
  };

  const handleWordClick = async (e: React.MouseEvent, word: string) => {
    e.stopPropagation();
    if (isPlaying) {
      setIsPlaying(false);
      synthRef.current.cancel();
    }
    const cleanWord = word.replace(/^[^\w]+|[^\w]+$/g, '');
    if (!cleanWord) return;

    setIsLoading(true);
    setDictPos({ x: e.clientX, y: e.clientY });
    const result = await fetchDefinition(cleanWord);
    setDictResult(result);
    setIsLoading(false);
  };

  const renderSentenceText = (text: string, globalIndex: number) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, pIdx) => {
      const isBold = part.startsWith('**') && part.endsWith('**');
      const cleanPart = isBold ? part.slice(2, -2) : part;
      return cleanPart.split(' ').map((word, wIdx) => {
          if (!word) return null; 
          return (
            <span 
              key={`${globalIndex}-${pIdx}-${wIdx}`}
              className={`inline-block mr-1.5 cursor-pointer hover:text-brand-600 hover:underline decoration-brand-300 ${isBold ? 'font-bold' : ''}`}
              onClick={(e) => handleWordClick(e, word)}
            >
              {word}
            </span>
          );
      });
    });
  };

  return (
    <div className="relative flex flex-col h-full">
      {/* --- Immersive Toolbar --- */}
      <div className={`sticky top-0 z-20 mb-6 p-4 rounded-xl shadow-sm border transition-all ${settings.isHighContrast ? 'bg-slate-900 border-yellow-400' : 'bg-white border-gray-200'}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setIsPlaying(!isPlaying)}
              className={`flex items-center justify-center w-12 h-12 rounded-full transition-all active:scale-95 shadow-md ${
                isPlaying 
                  ? 'bg-yellow-400 text-black hover:bg-yellow-500' 
                  : (settings.isHighContrast ? 'bg-yellow-400 text-black' : 'bg-brand-600 text-white hover:bg-brand-700')
              }`}
              title={isPlaying ? "Pause" : "Read Aloud"}
            >
              {isPlaying ? <Pause fill="currentColor" size={20} /> : <Play fill="currentColor" className="ml-1" size={20} />}
            </button>
            <button onClick={handleStop} className="p-2.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-red-500 transition-colors" title="Stop Reading">
              <StopCircle size={24} />
            </button>
            <button onClick={handleRestart} className="p-2.5 rounded-lg text-slate-500 hover:bg-slate-100 hover:text-brand-600 transition-colors" title="Restart">
              <RotateCcw size={20} />
            </button>
          </div>

          <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>

          <button
            onClick={toggleSimplify}
            disabled={isSimplifying}
            className={`
              flex items-center px-5 py-2.5 rounded-full font-bold text-sm transition-all border-2 shadow-sm
              ${viewMode === 'simple' 
                 ? (settings.isHighContrast ? 'bg-yellow-400 text-black border-yellow-400 shadow-[0_0_10px_rgba(250,204,21,0.5)]' : 'bg-purple-600 text-white border-purple-600 hover:bg-purple-700 shadow-purple-200')
                 : 'bg-white text-purple-600 border-purple-100 hover:border-purple-300 hover:bg-purple-50'
              }
              ${isSimplifying ? 'opacity-70 cursor-wait' : ''}
            `}
          >
            {isSimplifying ? (
              <Loader2 className="animate-spin mr-2 h-4 w-4" />
            ) : (
              <Wand2 className={`mr-2 h-4 w-4 ${viewMode === 'simple' ? 'fill-current' : ''}`} />
            )}
            {isSimplifying ? 'Simplifying...' : (viewMode === 'simple' ? 'Simple Mode ON' : 'Simplify Text')}
          </button>

          <div className="w-px h-8 bg-gray-200 hidden sm:block"></div>

          <div className="flex items-center space-x-2">
            <div className="hidden sm:flex items-center space-x-3 bg-gray-50 px-3 py-2 rounded-lg border border-gray-100 mr-2">
              <Gauge size={18} className="text-slate-400" />
              <input 
                type="range" min="0.5" max="1.5" step="0.1" 
                value={playbackRate}
                onChange={(e) => setPlaybackRate(parseFloat(e.target.value))}
                className="w-16 accent-brand-600 cursor-pointer"
                title="Reading Speed"
              />
            </div>
             <button onClick={toggleFont} className={`p-2 rounded-lg flex items-center space-x-1 transition-colors ${settings.isDyslexicFont ? 'bg-brand-100 text-brand-700' : 'text-slate-500 hover:bg-gray-100'}`} title="Toggle Dyslexic Font">
               <span className="font-bold text-lg leading-none">Aa</span>
             </button>
             <button onClick={toggleSize} className="p-2 rounded-lg text-slate-500 hover:bg-gray-100 transition-colors" title="Change Text Size">
               <Maximize size={20} />
             </button>
          </div>
        </div>
        
        {errorMsg && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center animate-fade-in-up">
            <AlertCircle size={16} className="mr-2 shrink-0" />
            {errorMsg}
            <button onClick={() => setErrorMsg(null)} className="ml-auto text-red-400 hover:text-red-600"><X size={14} /></button>
          </div>
        )}

        {!isPlaying && currentGlobalIndex === -1 && !errorMsg && (
           <div className="mt-3 text-xs text-slate-400 flex items-center">
             <Volume2 size={12} className="mr-1.5" />
             <span>Tip: Click "Read Aloud" to start. Click any word to define it.</span>
           </div>
        )}
      </div>

      <div 
        className={`
          prose max-w-none transition-all duration-300
          ${settings.textSize === 'large' ? 'prose-lg' : settings.textSize === 'xl' ? 'prose-xl' : ''}
          ${viewMode === 'simple' ? 'bg-purple-50/50 p-6 rounded-xl border-2 border-purple-100 shadow-inner' : ''}
        `}
      >
        {viewMode === 'simple' && (
          <div className="mb-4 flex items-center text-purple-700 font-bold text-sm uppercase tracking-widest animate-fade-in-up">
            <Sparkles size={16} className="mr-2" /> AI Simplified Version
          </div>
        )}
        
        {blocks.map((block, bIdx) => (
          <p key={bIdx} className="mb-3 leading-loose">
            {block.sentences.map((sentence) => (
              <span 
                key={sentence.globalIndex} 
                id={`sentence-${sentence.globalIndex}`}
                onClick={() => {
                  setCurrentGlobalIndex(sentence.globalIndex);
                  setIsPlaying(true);
                  playSentence(sentence.globalIndex);
                }}
                className={`
                  inline py-1 px-1 rounded-lg transition-colors duration-300 cursor-pointer border border-transparent mr-1 box-decoration-clone
                  ${currentGlobalIndex === sentence.globalIndex
                    ? (settings.isHighContrast 
                        ? 'bg-blue-900 text-yellow-300 border-yellow-400 shadow-md' 
                        : 'bg-yellow-200/70 text-slate-900 border-yellow-300 shadow-sm') 
                    : 'hover:bg-slate-100'}
                `}
              >
                {renderSentenceText(sentence.text, sentence.globalIndex)}
              </span>
            ))}
          </p>
        ))}
      </div>

      <DictionaryPopup 
        result={dictResult} 
        position={dictPos} 
        onClose={() => setDictPos(null)} 
        isLoading={isLoading}
      />
    </div>
  );
};
