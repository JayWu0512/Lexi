
import React, { useContext, useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AccessibilityContext, InteractiveText } from './Shared';
import { calculateReadingLevel } from '../services/utils';
import { resources } from '../data/content';
import { UserRole, Resource, ContentType } from '../types';
import { HomeworkTools } from './HomeworkTools';
import { 
  ArrowRight, 
  Book, 
  Users, 
  GraduationCap, 
  Briefcase, 
  FileText, 
  Home, 
  Search,
  Sparkles,
  Zap,
  Layout,
  Accessibility,
  Headphones,
  MousePointerClick,
  Eye,
  ChevronDown,
  Mic,
  StopCircle,
  Copy,
  RotateCcw,
  Volume2,
  Play,
  Pause,
  Trash2,
  Wand2,
  Keyboard,
  Star,
  Quote,
  Lightbulb,
  CheckCircle2,
  Timer,
  ExternalLink,
  X,
  Network,
  Activity,
  Cpu,
  Bookmark,
  FileCheck,
  HelpCircle,
  MessageCircle,
  ShieldCheck,
  HeartHandshake,
  Brain,
  Filter,
  CheckSquare,
  Building2,
  Wallet,
  Clock,
  ListTodo
} from 'lucide-react';

// --- Shared Portal Layout (Helper) ---
const PortalLayout: React.FC<{
  title: string;
  description: string;
  role: UserRole;
  icon: React.ElementType;
  colorClass: string;
}> = ({ title, description, role, icon: Icon, colorClass }) => {
  const roleResources = resources.filter(r => r.roles.includes(role));
  const { settings } = useContext(AccessibilityContext);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12 animate-fade-in-up">
      {/* Header */}
      <div className={`${colorClass} rounded-3xl p-8 md:p-12 mb-12 text-white shadow-xl relative overflow-hidden`}>
        {/* Decorative circle */}
        <div className="absolute -top-24 -right-24 w-64 h-64 rounded-full bg-white opacity-10 blur-2xl pointer-events-none"></div>
        
        <div className="relative z-10">
          <div className="flex items-center space-x-4 mb-6">
            <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/20">
              <Icon size={32} />
            </div>
            <h1 className="text-3xl md:text-5xl font-bold tracking-tight">{title}</h1>
          </div>
          <p className="text-lg md:text-xl opacity-90 max-w-2xl leading-relaxed font-medium">{description}</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-12 gap-8">
        {/* Main Feed */}
        <div className="lg:col-span-8 space-y-6">
          <div className="flex items-center justify-between border-b border-gray-200 pb-4 mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Recommended for You</h2>
          </div>
          
          {roleResources.map(resource => (
            <div 
              key={resource.id} 
              className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transition-all hover:shadow-lg hover:border-brand-200 group ${settings.isHighContrast ? 'border-2 border-yellow-500' : ''}`}
            >
              <div className="p-6 md:p-8">
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 uppercase tracking-wide">
                    {resource.type}
                  </span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-brand-600 transition-colors">{resource.title}</h3>
                <p className="text-gray-600 mb-6 leading-relaxed">{resource.description}</p>
                
                {resource.content ? (
                  <div className="mt-6 bg-slate-50 rounded-xl p-6 border border-slate-100">
                    <InteractiveText content={resource.content} />
                  </div>
                ) : (
                  <a href={resource.url} target="_blank" rel="noreferrer" className="inline-flex items-center px-4 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-brand-600 transition-colors">
                    Visit Resource <ArrowRight size={16} className="ml-2" />
                  </a>
                )}
              </div>
            </div>
          ))}

          {roleResources.length === 0 && (
            <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-300">
              <p className="text-gray-500">No resources found for this category yet.</p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gradient-to-br from-brand-50 to-white rounded-2xl p-6 border border-brand-100 shadow-sm sticky top-24">
            <h3 className="font-bold text-lg mb-4 text-brand-900 flex items-center">
              <Zap size={20} className="mr-2 text-brand-500" />
              Quick Tips
            </h3>
            <ul className="space-y-4">
              <li className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-xs">1</div>
                <span className="text-sm text-gray-700 leading-relaxed">Use the <strong>"Read with Me"</strong> button on articles to hear them aloud.</span>
              </li>
              <li className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-xs">2</div>
                <span className="text-sm text-gray-700 leading-relaxed">Click any word you don't know to see a simple definition.</span>
              </li>
              <li className="flex gap-3">
                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-brand-100 flex items-center justify-center text-brand-600 font-bold text-xs">3</div>
                <span className="text-sm text-gray-700 leading-relaxed">Check Accessibility settings in the menu to change fonts or contrast.</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Custom Interactive Tools for Students ---
const VoiceTyper: React.FC = () => {
  const [isListening, setIsListening] = useState(false);
  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            setText(prev => prev + event.results[i][0].transcript + ' ');
          }
        }
      };

      recognitionRef.current.onerror = (event: any) => {
        setIsListening(false);
        setError('Could not access microphone.');
      };
      
      recognitionRef.current.onend = () => {
        if (isListening) setIsListening(false);
      }
    } else {
      setError('Browser not supported.');
    }
  }, []); // eslint-disable-line

  const toggleListening = () => {
    if (!recognitionRef.current) return;
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setError(null);
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  const copyToClipboard = () => navigator.clipboard.writeText(text);

  return (
    <div className="relative group overflow-hidden rounded-3xl bg-slate-800/80 backdrop-blur-md border border-slate-700 shadow-2xl transition-all duration-300 hover:shadow-brand-900/50 hover:border-brand-500/50 flex flex-col h-full min-h-[400px]">
      <div className="absolute top-0 right-0 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
      <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full bg-slate-600 border border-slate-400 group-hover:bg-brand-400 group-hover:shadow-[0_0_10px_rgba(56,189,248,0.8)] transition-all z-20 hidden md:block"></div>

      <div className="p-6 md:p-8 flex flex-col h-full relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl transition-all ${isListening ? 'bg-red-500/20 text-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]' : 'bg-slate-700 text-brand-400'}`}>
              <Mic size={24} className={isListening ? "animate-pulse" : ""} />
            </div>
            <div>
               <h3 className="font-bold text-white text-xl">Voice Writer</h3>
               <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Dictation Tool</span>
            </div>
          </div>
          {isListening && <span className="flex h-3 w-3 rounded-full bg-red-500 animate-ping"></span>}
        </div>
        
        <div className="flex-grow bg-slate-900/50 rounded-2xl border border-slate-700/50 relative backdrop-blur-sm mb-6 flex flex-col">
          <textarea 
            className="w-full h-full p-6 bg-transparent text-slate-200 placeholder-slate-600 focus:outline-none resize-none font-medium leading-relaxed"
            placeholder="Tap the microphone and just speak. Your words will appear here..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          {text && (
             <div className="absolute bottom-4 right-4 text-xs text-slate-500 bg-slate-800 px-2 py-1 rounded">
               {text.split(' ').length} words
             </div>
          )}
        </div>

        {error && <p className="text-sm text-red-400 mb-4 bg-red-900/20 px-4 py-2 rounded-lg border border-red-900/30">{error}</p>}

        <div className="grid grid-cols-12 gap-3">
          <button 
            onClick={toggleListening}
            className={`col-span-8 md:col-span-9 flex items-center justify-center px-6 py-4 rounded-xl font-bold text-lg transition-all active:scale-95 ${
              isListening 
                ? 'bg-red-500 text-white hover:bg-red-600 shadow-lg shadow-red-500/20' 
                : 'bg-brand-500 text-white hover:bg-brand-400 shadow-lg shadow-brand-500/20'
            }`}
          >
            {isListening ? <><StopCircle size={20} className="mr-3" /> Stop</> : <><Mic size={20} className="mr-3" /> Start</>}
          </button>
          
          <button 
            onClick={copyToClipboard}
            className="col-span-2 md:col-span-1.5 flex items-center justify-center p-4 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 hover:text-white transition-colors border border-slate-600"
            title="Copy text"
          >
            <Copy size={20} />
          </button>
          
          <button 
            onClick={() => setText('')}
            className="col-span-2 md:col-span-1.5 flex items-center justify-center p-4 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 hover:text-white transition-colors border border-slate-600"
            title="Clear text"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const TextReader: React.FC = () => {
  const [text, setText] = useState('');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  const toggleSpeech = () => {
    const synth = window.speechSynthesis;
    if (!text.trim()) return;

    if (isSpeaking && !isPaused) {
      synth.pause();
      setIsPaused(true);
      return;
    }

    if (isPaused) {
      synth.resume();
      setIsPaused(false);
      return;
    }

    synth.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.rate = 0.9;
    u.onend = () => {
      setIsSpeaking(false);
      setIsPaused(false);
    };
    synth.speak(u);
    setIsSpeaking(true);
  };

  return (
    <div className="relative group overflow-hidden rounded-3xl bg-slate-800/80 backdrop-blur-md border border-slate-700 shadow-2xl transition-all duration-300 hover:shadow-emerald-900/50 hover:border-emerald-500/50 flex flex-col h-full min-h-[400px]">
      <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
      <div className="absolute -top-1.5 left-1/2 transform -translate-x-1/2 w-3 h-3 rounded-full bg-slate-600 border border-slate-400 group-hover:bg-emerald-400 group-hover:shadow-[0_0_10px_rgba(52,211,153,0.8)] transition-all z-20 hidden md:block"></div>

      <div className="p-6 md:p-8 flex flex-col h-full relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-xl transition-all bg-slate-700 text-emerald-400`}>
              <Headphones size={24} />
            </div>
            <div>
               <h3 className="font-bold text-white text-xl">Magic Reader</h3>
               <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Text to Speech</span>
            </div>
          </div>
          {isSpeaking && !isPaused && (
             <div className="flex items-center space-x-1">
                <div className="w-1 h-3 bg-emerald-400 rounded-full animate-[bounce_1s_infinite]"></div>
                <div className="w-1 h-5 bg-emerald-400 rounded-full animate-[bounce_1.2s_infinite]"></div>
                <div className="w-1 h-3 bg-emerald-400 rounded-full animate-[bounce_0.8s_infinite]"></div>
             </div>
          )}
        </div>

        <div className="flex-grow bg-slate-900/50 rounded-2xl border border-slate-700/50 relative backdrop-blur-sm mb-6">
           <textarea 
            className="w-full h-full p-6 bg-transparent text-slate-200 placeholder-slate-600 focus:outline-none resize-none font-medium leading-relaxed"
            placeholder="Paste your homework or article here to listen to it..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-12 gap-3">
           <button 
            onClick={toggleSpeech}
            disabled={!text.trim()}
            className={`col-span-9 flex items-center justify-center px-6 py-4 rounded-xl font-bold text-lg transition-all active:scale-95 ${
              !text.trim() ? 'bg-slate-700 text-slate-500 cursor-not-allowed' :
              isSpeaking && !isPaused
                ? 'bg-yellow-400 text-black hover:bg-yellow-300' 
                : 'bg-emerald-500 text-white hover:bg-emerald-400 shadow-lg shadow-emerald-500/20'
            }`}
          >
            {isSpeaking && !isPaused ? <><Pause size={20} className="mr-3" /> Pause</> : <><Play size={20} className="mr-3" /> Read</>}
          </button>
          
          <button 
            onClick={() => { window.speechSynthesis.cancel(); setIsSpeaking(false); setIsPaused(false); }}
            className="col-span-3 flex items-center justify-center p-4 bg-slate-700 text-slate-300 rounded-xl hover:bg-slate-600 hover:text-white transition-colors border border-slate-600"
            title="Reset"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

const FocusTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  
  useEffect(() => {
    let interval: any = null;
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(25 * 60);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="relative group overflow-hidden rounded-3xl bg-slate-800/80 backdrop-blur-md border border-slate-700 shadow-2xl transition-all duration-300 hover:shadow-orange-900/50 hover:border-orange-500/50 flex flex-col items-center justify-center h-full min-h-[300px]">
       <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
       <div className="absolute -bottom-1.5 left-[25%] w-3 h-3 rounded-full bg-slate-600 border border-slate-400 group-hover:bg-orange-400 group-hover:shadow-[0_0_10px_rgba(251,146,60,0.8)] transition-all z-20 hidden md:block"></div>
       <div className="absolute -bottom-1.5 right-[25%] w-3 h-3 rounded-full bg-slate-600 border border-slate-400 group-hover:bg-orange-400 group-hover:shadow-[0_0_10px_rgba(251,146,60,0.8)] transition-all z-20 hidden md:block"></div>

       <div className="p-6 md:p-8 flex flex-col items-center w-full relative z-10">
         <div className="flex items-center space-x-3 mb-8">
             <div className={`p-3 rounded-xl transition-all bg-slate-700 text-orange-400`}>
               <Activity size={24} />
             </div>
             <div>
                <h3 className="font-bold text-white text-xl">Focus Core</h3>
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Session Manager</span>
             </div>
         </div>

         <div className="flex-grow flex items-center justify-center mb-8">
            <div className={`text-7xl lg:text-8xl font-bold font-mono tracking-tighter tabular-nums transition-colors ${isActive ? 'text-orange-400 drop-shadow-[0_0_15px_rgba(251,146,60,0.5)]' : 'text-slate-200'}`}>
              {formatTime(timeLeft)}
            </div>
         </div>

         <div className="flex gap-4 w-full max-w-xs">
            <button 
              onClick={toggleTimer}
              className={`flex-1 flex items-center justify-center px-6 py-4 rounded-xl font-bold text-lg transition-all active:scale-95 ${
                isActive
                  ? 'bg-red-500 text-white hover:bg-red-400' 
                  : 'bg-orange-500 text-white hover:bg-orange-400'
              }`}
            >
              {isActive ? 'Pause' : 'Start'}
            </button>
            <button 
              onClick={resetTimer}
              className="flex-1 flex items-center justify-center px-6 py-4 rounded-xl font-bold text-lg bg-slate-700 text-slate-300 hover:bg-slate-600 hover:text-white transition-colors"
            >
              Reset
            </button>
         </div>
       </div>
    </div>
  );
};

// --- Student Portal ---
export const StudentPortal: React.FC = () => {
  const { settings } = useContext(AccessibilityContext);
  const studentResources = resources.filter(r => r.roles.includes(UserRole.STUDENT));
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if(el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="flex flex-col w-full animate-fade-in-up">
      <div className={`relative min-h-[90vh] flex items-center justify-center overflow-hidden parallax-section ${settings.isHighContrast ? 'bg-black border-b border-yellow-400' : 'bg-slate-900'}`}>
        {!settings.isHighContrast && (
          <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1517048676732-d65bc937f952?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-blue-900/30"></div>
             <div className="absolute top-20 right-20 w-72 h-72 bg-blue-500/20 rounded-full blur-[80px] animate-pulse"></div>
             <div className="absolute bottom-10 left-10 w-96 h-96 bg-purple-500/20 rounded-full blur-[80px] animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
        )}
        <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-white pt-20 pb-32">
           <div className="flex flex-col items-center text-center">
             <div className="inline-flex items-center space-x-2 bg-blue-500/10 backdrop-blur-md border border-blue-400/20 text-blue-200 rounded-full px-5 py-2.5 mb-8 shadow-lg shadow-blue-500/10 cursor-default">
               <Sparkles size={16} className="text-blue-400" />
               <span className="text-sm font-bold uppercase tracking-widest">Student Command Center</span>
             </div>
             <h1 className="text-5xl md:text-8xl font-bold mb-8 leading-tight tracking-tight">
               Your Learning <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-blue-100 to-white">Superpowers.</span>
             </h1>
             <p className="text-xl text-slate-300 max-w-2xl leading-relaxed mb-12">
               Don't let text hold you back. Use professional-grade tools to listen, speak, and create without limits. This is your studio.
             </p>
             <div className="flex flex-wrap justify-center gap-6 relative z-20">
               <button onClick={() => scrollToSection('student-studio')} className="group relative px-8 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-lg transition-all shadow-lg shadow-blue-600/30 overflow-hidden">
                 <span className="relative z-10 flex items-center">Open Studio <Wand2 size={20} className="ml-2" /></span>
               </button>
               <button onClick={() => scrollToSection('student-fame')} className="group px-8 py-5 bg-white/10 hover:bg-white/20 text-white border border-white/20 rounded-full font-bold text-lg transition-all backdrop-blur-sm flex items-center">
                 Get Inspired <Star size={20} className="ml-2" />
               </button>
             </div>
           </div>
           <div className="absolute bottom-10 left-0 right-0 flex justify-center animate-bounce z-10 pointer-events-none">
              <ChevronDown className="text-white/50" size={32} />
           </div>
        </div>
      </div>

      {/* The Studio */}
      <div id="student-studio" className={`py-24 relative overflow-hidden ${settings.isHighContrast ? 'bg-black border-y border-yellow-400' : 'bg-slate-900'}`}>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col items-center mb-16">
            <div className="inline-flex items-center space-x-2 text-blue-400 bg-blue-900/30 px-4 py-1.5 rounded-full mb-4 border border-blue-500/30">
               <Network size={16} />
               <span className="text-xs font-bold uppercase tracking-widest">Neural Interface</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4 text-center">The Studio</h2>
            <p className="text-slate-400 text-lg max-w-xl text-center">
              Connect your ideas. Start with focus, then create or consume. This is your mental workspace.
            </p>
          </div>
          <div className="relative">
             <svg className="absolute inset-0 w-full h-full pointer-events-none hidden lg:block z-0" style={{ overflow: 'visible' }}>
               <defs>
                 <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                   <stop offset="0%" stopColor="#f97316" stopOpacity="0.5" />
                   <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.5" />
                   <stop offset="100%" stopColor="#10b981" stopOpacity="0.5" />
                 </linearGradient>
               </defs>
               <path d="M50% 120 Q 20% 120, 20% 380" fill="none" stroke="url(#lineGradient)" strokeWidth="3" strokeDasharray="8 4" className="animate-[pulse_3s_infinite]" />
               <path d="M50% 120 Q 80% 120, 80% 380" fill="none" stroke="url(#lineGradient)" strokeWidth="3" strokeDasharray="8 4" className="animate-[pulse_3s_infinite]" style={{ animationDelay: '1.5s' }} />
             </svg>
             <div className="grid lg:grid-cols-2 gap-8 lg:gap-x-20 lg:gap-y-12 relative z-10">
                <div className="lg:col-span-2 flex justify-center">
                   <div className="w-full max-w-2xl transform transition-transform hover:scale-105 duration-300">
                     <FocusTimer />
                   </div>
                </div>
                <div className="lg:col-span-1 transform transition-transform hover:scale-105 duration-300 hover:-rotate-1">
                   <VoiceTyper />
                </div>
                <div className="lg:col-span-1 transform transition-transform hover:scale-105 duration-300 hover:rotate-1">
                   <TextReader />
                </div>
             </div>
          </div>
        </div>
      </div>

      {/* Insert Homework Transformer here */}
      <HomeworkTools />

      {/* Hall of Fame */}
      <div id="student-fame" className="py-24 bg-gradient-to-b from-indigo-900 to-slate-900 relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-50"></div>
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Great Minds Think Different</h2>
            <p className="text-indigo-200 text-xl max-w-2xl mx-auto">
              Having a learning difference puts you in amazing company. Click a card to learn more about their story.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            <a href="https://en.wikipedia.org/wiki/Steven_Spielberg" target="_blank" rel="noreferrer" className="block group bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-indigo-400/50 transition-all hover:-translate-y-1 cursor-pointer">
              <div className="flex justify-between items-start mb-6">
                 <div className="text-yellow-400"><Star size={32} fill="currentColor" /></div>
                 <ExternalLink size={20} className="text-white/30 group-hover:text-white" />
              </div>
              <blockquote className="text-white text-lg font-medium mb-6 italic">"It was actually a blessing because I had to learn how to solve problems differently."</blockquote>
              <div><h4 className="text-white font-bold text-xl group-hover:text-indigo-300 transition-colors">Steven Spielberg</h4><p className="text-indigo-300">Filmmaker • Dyslexic</p></div>
            </a>
            <a href="https://en.wikipedia.org/wiki/Richard_Branson" target="_blank" rel="noreferrer" className="block group bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-indigo-400/50 transition-all hover:-translate-y-1 cursor-pointer">
              <div className="flex justify-between items-start mb-6">
                 <div className="text-yellow-400"><Lightbulb size={32} fill="currentColor" /></div>
                 <ExternalLink size={20} className="text-white/30 group-hover:text-white" />
              </div>
              <blockquote className="text-white text-lg font-medium mb-6 italic">"I realized that I processed information differently than everyone else, and that was my superpower."</blockquote>
              <div><h4 className="text-white font-bold text-xl group-hover:text-indigo-300 transition-colors">Richard Branson</h4><p className="text-indigo-300">Entrepreneur • Dyslexic</p></div>
            </a>
             <a href="https://en.wikipedia.org/wiki/Dav_Pilkey" target="_blank" rel="noreferrer" className="block group bg-white/5 backdrop-blur-lg border border-white/10 rounded-3xl p-8 hover:bg-white/10 hover:border-indigo-400/50 transition-all hover:-translate-y-1 cursor-pointer">
              <div className="flex justify-between items-start mb-6">
                 <div className="text-yellow-400"><Quote size={32} fill="currentColor" /></div>
                 <ExternalLink size={20} className="text-white/30 group-hover:text-white" />
              </div>
              <blockquote className="text-white text-lg font-medium mb-6 italic">"Writing is the hardest thing I do... but I don't let it stop me from telling my stories."</blockquote>
              <div><h4 className="text-white font-bold text-xl group-hover:text-indigo-300 transition-colors">Dav Pilkey</h4><p className="text-indigo-300">Author • ADHD/Dyslexia</p></div>
            </a>
          </div>
        </div>
      </div>

      {/* Resources Feed - UPDATED WITH IMAGE CARDS */}
      <div id="student-resources" className="bg-slate-50 py-24 min-h-[60vh]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center mb-12">
            <div className="p-4 bg-brand-600 text-white rounded-2xl mr-6 shadow-lg shadow-brand-500/30">
              <Book size={32} />
            </div>
            <div>
              <h2 className="text-4xl font-bold text-gray-900">Resource Library</h2>
              <p className="text-gray-500 text-lg mt-2">Curated articles to help you master school and life.</p>
            </div>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {studentResources.map(resource => (
               <div 
                 key={resource.id} 
                 onClick={() => setSelectedResource(resource)}
                 className={`
                   group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 cursor-pointer
                   ${settings.isHighContrast 
                     ? 'bg-black border-2 border-yellow-400 hover:shadow-[0_0_15px_rgba(250,204,21,0.5)]' 
                     : 'bg-white shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 hover:border-brand-200'}
                 `}
               >
                 {/* Image Cover */}
                 <div className="relative h-48 w-full overflow-hidden">
                    <img 
                      src={resource.imageUrl || 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=2070&auto=format&fit=crop'} 
                      alt="" 
                      className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${settings.isHighContrast ? 'opacity-50 grayscale' : ''}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    
                    {/* Type Badge */}
                    <div className="absolute top-4 right-4">
                       <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm bg-slate-800/80 text-white">
                         {resource.type === ContentType.TOOL && <Wand2 size={12} className="mr-1" />}
                         {resource.type === ContentType.EXTERNAL_LINK && <ExternalLink size={12} className="mr-1" />}
                         {resource.type === ContentType.ARTICLE && <FileText size={12} className="mr-1" />}
                         {resource.type.replace('_', ' ')}
                       </span>
                    </div>
                 </div>

                 <div className="flex-1 p-6 flex flex-col">
                   <div className="flex flex-wrap gap-2 mb-3">
                      {resource.tags.slice(0, 2).map(tag => (
                        <span key={tag} className={`text-[10px] px-2 py-1 rounded border ${settings.isHighContrast ? 'border-yellow-400 text-yellow-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>#{tag}</span>
                      ))}
                   </div>
                   <h3 className={`text-xl font-bold mb-3 leading-snug group-hover:text-brand-600 transition-colors ${settings.isHighContrast ? 'text-yellow-400' : 'text-slate-900'}`}>{resource.title}</h3>
                   <p className={`text-sm mb-6 line-clamp-3 flex-grow ${settings.isHighContrast ? 'text-slate-200' : 'text-slate-600'}`}>{resource.description}</p>
                   
                   <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100/10">
                      <span className={`text-sm font-bold flex items-center ${settings.isHighContrast ? 'text-yellow-400' : 'text-brand-600'}`}>
                        Read Now <ArrowRight size={16} className="ml-1 transform group-hover:translate-x-1 transition-transform" />
                      </span>
                   </div>
                 </div>
               </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal - UPDATED TO MATCH RESOURCE LIBRARY */}
      {selectedResource && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-fade-in-up">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setSelectedResource(null)}></div>
          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative z-10 flex flex-col">
             {/* Modal Image Header */}
             <div className="relative h-48 md:h-64 w-full flex-shrink-0">
               <img 
                 src={selectedResource.imageUrl || 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=2070&auto=format&fit=crop'} 
                 className="w-full h-full object-cover" 
                 alt=""
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
               <button 
                 onClick={() => setSelectedResource(null)}
                 className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors backdrop-blur-md"
               >
                 <X size={24} />
               </button>
               <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-md border border-white/20">
                      {selectedResource.type.replace('_', ' ')}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight shadow-sm">{selectedResource.title}</h2>
               </div>
             </div>

             <div className="p-6 md:p-8">
               <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-6">
                 <h4 className="flex items-center text-sm font-bold text-slate-500 uppercase tracking-widest mb-4"><Bookmark size={16} className="mr-2" />Key Takeaways</h4>
                 {selectedResource.content && (<InteractiveText content={selectedResource.content} />)}
               </div>
               <p className="text-sm text-gray-500 italic text-center">This is a summary. Click below to read the full original article.</p>
             </div>
             <div className="p-6 md:p-8 bg-gray-50 border-t border-gray-100 rounded-b-3xl flex flex-col md:flex-row gap-4">
               {selectedResource.url && (
                 <a href={selectedResource.url} target="_blank" rel="noreferrer" className="flex-1 flex items-center justify-center px-6 py-4 bg-brand-600 text-white rounded-xl font-bold text-lg hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20 active:scale-95">Visit Full Article <ExternalLink size={20} className="ml-2" /></a>
               )}
               <button onClick={() => setSelectedResource(null)} className="md:w-auto px-8 py-4 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-colors">Close</button>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Parent Portal Components ---
const JargonBuster: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const terms = [
    { term: 'IEP', full: 'Individualized Education Program', def: 'A legal document that outlines the special education instruction, supports, and services a student with a disability will receive.', link: 'https://www.parentcenterhub.org/iep-overview/' },
    { term: '504 Plan', full: 'Section 504 of the Rehabilitation Act', def: 'A blueprint for how a school will provide supports and remove barriers for a student with a disability.', link: 'https://www.understood.org/en/articles/what-is-a-504-plan' },
    { term: 'FAPE', full: 'Free Appropriate Public Education', def: 'The legal right of students with disabilities to receive an education that is tailored to their needs at no cost.', link: 'https://www.understood.org/en/articles/what-is-fape' },
    { term: 'LRE', full: 'Least Restrictive Environment', def: 'The requirement that students with disabilities be educated with non-disabled peers to the maximum extent appropriate.', link: 'https://www.understood.org/en/articles/least-restrictive-environment-lre-what-you-need-to-know' },
    { term: 'Accommodations', full: '', def: 'Changes to HOW a student learns (e.g., extra time, audiobooks). The curriculum stays the same.', link: 'https://www.understood.org/en/articles/accommodations-and-modifications-how-theyre-different' },
    { term: 'Modifications', full: '', def: 'Changes to WHAT a student learns (e.g., shorter reading assignments). The curriculum is altered.', link: 'https://www.understood.org/en/articles/accommodations-and-modifications-how-theyre-different' },
  ];
  const filteredTerms = terms.filter(t => t.term.toLowerCase().includes(searchTerm.toLowerCase()) || t.full.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="h-full bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden flex flex-col">
       <div className="bg-emerald-50 p-6 border-b border-emerald-100">
          <div className="flex items-center space-x-3 mb-4"><div className="p-2 bg-emerald-100 text-emerald-600 rounded-lg"><MessageCircle size={24} /></div><h3 className="text-xl font-bold text-gray-900">Jargon Buster</h3></div>
          <div className="relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} /><input type="text" placeholder="Search terms (e.g., FAPE)" className="w-full pl-9 pr-4 py-2 border border-emerald-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div>
       </div>
       <div className="flex-grow overflow-y-auto p-4 space-y-3 max-h-[300px]">
          {filteredTerms.map((t, idx) => (
            <div key={idx} className="p-3 rounded-lg hover:bg-slate-50 border border-transparent hover:border-slate-200 transition-all">
               <div className="flex justify-between items-baseline mb-1"><span className="font-bold text-emerald-700">{t.term}</span><div className="flex items-center space-x-2">{t.full && <span className="text-xs text-gray-400 hidden sm:inline">{t.full}</span>}<a href={t.link} target="_blank" rel="noreferrer" className="text-emerald-500 hover:text-emerald-700 p-1" title="Learn more"><ExternalLink size={14} /></a></div></div>
               <p className="text-sm text-gray-600 leading-relaxed">{t.def}</p>
            </div>
          ))}
          {filteredTerms.length === 0 && <p className="text-center text-gray-400 text-sm py-4">No terms found.</p>}
       </div>
    </div>
  );
};

const MeetingPrep: React.FC = () => {
  const [items, setItems] = useState([{ id: 1, text: 'Review current IEP/504 goals', checked: false }, { id: 2, text: 'Gather recent report cards & work samples', checked: false }, { id: 3, text: 'List 3 strengths & 3 challenges', checked: false }, { id: 4, text: 'Write down specific questions for the teacher', checked: false }, { id: 5, text: 'Bring a notepad or recording device', checked: false }]);
  const toggleItem = (id: number) => setItems(items.map(i => i.id === id ? { ...i, checked: !i.checked } : i));
  const progress = Math.round((items.filter(i => i.checked).length / items.length) * 100);

  return (
    <div className="h-full bg-white rounded-2xl shadow-lg border border-emerald-100 overflow-hidden flex flex-col">
      <div className="bg-emerald-600 p-6 text-white">
        <div className="flex items-center justify-between mb-4"><div className="flex items-center space-x-3"><div className="p-2 bg-white/20 rounded-lg"><FileCheck size={24} /></div><h3 className="text-xl font-bold">Meeting Prep</h3></div><span className="text-sm font-medium bg-emerald-700 px-2 py-1 rounded">{progress}% Ready</span></div>
        <div className="w-full bg-emerald-800/50 rounded-full h-1.5"><div className="bg-white h-1.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div></div>
      </div>
      <div className="flex-grow p-4 overflow-y-auto"><div className="space-y-2">{items.map(item => (<button key={item.id} onClick={() => toggleItem(item.id)} className={`w-full flex items-center p-3 rounded-xl border transition-all text-left ${item.checked ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-100 hover:border-emerald-200'}`}><div className={`w-5 h-5 rounded border flex items-center justify-center mr-3 transition-colors ${item.checked ? 'bg-emerald-500 border-emerald-500 text-white' : 'border-gray-300'}`}>{item.checked && <CheckCircle2 size={14} />}</div><span className={`text-sm ${item.checked ? 'text-emerald-800 line-through decoration-emerald-300' : 'text-gray-700'}`}>{item.text}</span></button>))}</div></div>
    </div>
  );
};

export const ParentPortal: React.FC = () => {
  const { settings } = useContext(AccessibilityContext);
  const parentResources = resources.filter(r => r.roles.includes(UserRole.PARENT));
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const scrollToSection = (id: string) => { const el = document.getElementById(id); if(el) el.scrollIntoView({ behavior: 'smooth' }); };

  return (
    <div className="flex flex-col w-full animate-fade-in-up">
       <div className={`relative min-h-[70vh] flex items-center justify-center overflow-hidden parallax-section ${settings.isHighContrast ? 'bg-black border-b border-yellow-400' : 'bg-emerald-900'}`}>
          {!settings.isHighContrast && (<div className="absolute inset-0 z-0"><div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1594910078107-16447c210468?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div><div className="absolute inset-0 bg-gradient-to-t from-emerald-900 via-emerald-900/80 to-teal-900/30"></div></div>)}
          <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-white pt-20 pb-20">
             <div className="flex flex-col items-center text-center">
                <div className="inline-flex items-center space-x-2 bg-emerald-500/10 backdrop-blur-md border border-emerald-400/20 text-emerald-100 rounded-full px-5 py-2.5 mb-8"><HeartHandshake size={16} className="text-emerald-300" /><span className="text-sm font-bold uppercase tracking-widest">You are their champion</span></div>
                <h1 className="text-4xl md:text-7xl font-bold mb-8 leading-tight">Empower Your <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-200 to-teal-100">Advocacy Journey.</span></h1>
                <p className="text-lg md:text-xl text-emerald-100/80 max-w-2xl leading-relaxed mb-12">Navigating the education system is tough, but you don't have to do it alone. Find the right words, the right plan, and the right support.</p>
                <div className="flex flex-wrap justify-center gap-4"><button onClick={() => scrollToSection('parent-tools')} className="px-8 py-4 bg-white text-emerald-900 rounded-full font-bold text-lg hover:bg-emerald-50 transition-colors shadow-lg">Use Tools</button><button onClick={() => scrollToSection('parent-resources')} className="px-8 py-4 bg-emerald-800/50 text-white border border-emerald-400/30 rounded-full font-bold text-lg hover:bg-emerald-800/70 transition-colors backdrop-blur-md">Read Guides</button></div>
             </div>
          </div>
       </div>
       <div id="parent-tools" className="py-20 bg-slate-50"><div className="max-w-7xl mx-auto px-6"><div className="text-center mb-16"><h2 className="text-3xl font-bold text-gray-900 mb-4">Practical Toolkit</h2><p className="text-gray-600 max-w-2xl mx-auto">Simple tools to help you prepare for meetings and understand the complex language of special education.</p></div><div className="grid md:grid-cols-2 gap-8 lg:gap-12"><div className="h-[450px]"><JargonBuster /></div><div className="h-[450px]"><MeetingPrep /></div></div></div></div>
       
       {/* Resources Feed - UPDATED */}
       <div id="parent-resources" className="py-20 bg-white">
         <div className="max-w-7xl mx-auto px-6">
           <div className="flex items-center mb-12">
             <div className="p-3 bg-emerald-100 text-emerald-700 rounded-xl mr-4"><ShieldCheck size={28} /></div>
             <h2 className="text-3xl font-bold text-gray-900">Expert Guidance</h2>
           </div>
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
             {parentResources.map(resource => (
               <div 
                 key={resource.id} 
                 onClick={() => setSelectedResource(resource)}
                 className={`
                   group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 cursor-pointer
                   ${settings.isHighContrast 
                     ? 'bg-black border-2 border-yellow-400 hover:shadow-[0_0_15px_rgba(250,204,21,0.5)]' 
                     : 'bg-white shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 hover:border-emerald-200'}
                 `}
               >
                 <div className="relative h-48 w-full overflow-hidden">
                    <img 
                      src={resource.imageUrl || 'https://images.unsplash.com/photo-1594910078107-16447c210468?q=80&w=2070&auto=format&fit=crop'} 
                      alt="" 
                      className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${settings.isHighContrast ? 'opacity-50 grayscale' : ''}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute top-4 right-4">
                       <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm bg-slate-800/80 text-white">
                         {resource.type.replace('_', ' ')}
                       </span>
                    </div>
                 </div>
                 <div className="flex-1 p-6 flex flex-col">
                   <div className="flex flex-wrap gap-2 mb-3">
                      {resource.tags.slice(0, 2).map(tag => (
                        <span key={tag} className={`text-[10px] px-2 py-1 rounded border ${settings.isHighContrast ? 'border-yellow-400 text-yellow-400' : 'bg-emerald-50 border-emerald-100 text-emerald-600'}`}>#{tag}</span>
                      ))}
                   </div>
                   <h3 className={`text-xl font-bold mb-3 leading-snug group-hover:text-emerald-700 transition-colors ${settings.isHighContrast ? 'text-yellow-400' : 'text-slate-900'}`}>{resource.title}</h3>
                   <p className={`text-sm mb-6 line-clamp-3 flex-grow ${settings.isHighContrast ? 'text-slate-200' : 'text-slate-600'}`}>{resource.description}</p>
                   <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100/10">
                      <span className={`text-sm font-bold flex items-center ${settings.isHighContrast ? 'text-yellow-400' : 'text-emerald-600'}`}>
                        Read Now <ArrowRight size={16} className="ml-1 transform group-hover:translate-x-1 transition-transform" />
                      </span>
                   </div>
                 </div>
               </div>
             ))}
           </div>
         </div>
       </div>

       {/* Modal - UPDATED */}
       {selectedResource && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-fade-in-up">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedResource(null)}></div>
          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative z-10 flex flex-col">
             <div className="relative h-48 md:h-64 w-full flex-shrink-0">
               <img 
                 src={selectedResource.imageUrl || 'https://images.unsplash.com/photo-1594910078107-16447c210468?q=80&w=2070&auto=format&fit=crop'} 
                 className="w-full h-full object-cover" 
                 alt=""
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
               <button onClick={() => setSelectedResource(null)} className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors backdrop-blur-md"><X size={24} /></button>
               <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-md border border-white/20">{selectedResource.type.replace('_', ' ')}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight shadow-sm">{selectedResource.title}</h2>
               </div>
             </div>
             <div className="p-6 md:p-8">
               <div className="bg-emerald-50/50 rounded-xl p-6 border border-emerald-100 mb-6">
                 <h4 className="flex items-center text-sm font-bold text-emerald-800 uppercase tracking-widest mb-4"><Book size={16} className="mr-2" />Quick Summary</h4>
                 {selectedResource.content && (<InteractiveText content={selectedResource.content} />)}
               </div>
               <div className="flex justify-center mt-8">
                  {selectedResource.url && (
                    <a href={selectedResource.url} target="_blank" rel="noreferrer" className="flex items-center px-6 py-3 bg-emerald-600 text-white rounded-lg font-bold hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-500/20">Read Original Article <ExternalLink size={18} className="ml-2" /></a>
                  )}
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Teacher Portal Components ---
const StrategyBank: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('Reading Decoding');
  const strategies: Record<string, string[]> = {
    'Reading Decoding': ['Provide audiobooks or text-to-speech software.', 'Pre-teach vocabulary words.', 'Use sans-serif fonts (like Arial or Open Dyslexic).', 'Never force a student to read aloud without prep.', 'Use a "reading window" or guide.'],
    'Attention/Focus': ['Preferential seating near the teacher.', 'Allow movement breaks or fidget tools.', 'Use visual cues/timers for transitions.', 'Break long instructions into checklists.', 'Create a secret signal to redirect focus.'],
    'Writing/Spelling': ['Allow speech-to-text for drafting.', 'Provide graphic organizers.', 'Grade on content, not spelling accuracy.', 'Do not penalize for poor handwriting.', 'Provide sentence starters.'],
    'Test Taking': ['Extended time on assessments.', 'Testing in a separate, quiet location.', 'Oral testing: Read questions aloud.', 'Chunking: Break long exams into sections.', 'Allow calculator use.']
  };

  return (
    <div className="h-full bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden flex flex-col">
       <div className="bg-purple-50 p-6 border-b border-purple-100"><div className="flex items-center space-x-3 mb-4"><div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Brain size={24} /></div><h3 className="text-xl font-bold text-gray-900">Strategy Bank</h3></div><div className="relative"><Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} /><select className="w-full pl-9 pr-4 py-3 border border-purple-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 bg-white appearance-none cursor-pointer text-gray-700 font-medium" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>{Object.keys(strategies).map(cat => (<option key={cat} value={cat}>{cat}</option>))}</select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} /></div></div>
       <div className="flex-grow overflow-y-auto p-4 space-y-2">{strategies[selectedCategory].map((strategy, idx) => (<div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-purple-200 transition-colors flex items-start"><div className="mt-1 mr-3 min-w-[20px] h-5 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center text-xs font-bold">{idx + 1}</div><p className="text-sm text-gray-700 leading-relaxed">{strategy}</p></div>))}</div>
    </div>
  );
};

const LessonAudit: React.FC = () => {
  const [openSection, setOpenSection] = useState<string | null>('representation');
  const sections = [
    { id: 'representation', title: 'Representation', subtitle: 'How am I presenting information?', items: ['Did I provide alternatives to text?', 'Is key vocabulary pre-taught?', 'Are background knowledge connections explicit?'] },
    { id: 'expression', title: 'Action & Expression', subtitle: 'How can students show what they know?', items: ['Can students choose between writing/speaking?', 'Are sentence starters provided?', 'Is assistive tech allowed?'] },
    { id: 'engagement', title: 'Engagement', subtitle: 'How do I motivate them?', items: ['Is content relevant?', 'Are there opportunities for collaboration?', 'Is feedback frequent?'] }
  ];

  return (
    <div className="h-full bg-white rounded-2xl shadow-lg border border-purple-100 overflow-hidden flex flex-col">
      <div className="bg-purple-600 p-6 text-white"><div className="flex items-center space-x-3 mb-1"><div className="p-2 bg-white/20 rounded-lg"><CheckSquare size={24} /></div><h3 className="text-xl font-bold">UDL Lesson Audit</h3></div><p className="text-purple-100 text-sm ml-1">Universal Design for Learning Checklist</p></div>
      <div className="flex-grow p-4 overflow-y-auto space-y-3">{sections.map(section => (<div key={section.id} className="border border-purple-100 rounded-xl overflow-hidden"><button onClick={() => setOpenSection(openSection === section.id ? null : section.id)} className={`w-full flex items-center justify-between p-4 transition-colors ${openSection === section.id ? 'bg-purple-50 text-purple-800' : 'bg-white hover:bg-gray-50'}`}><div className="text-left"><span className="font-bold block">{section.title}</span><span className="text-xs text-gray-500 font-normal">{section.subtitle}</span></div><ChevronDown size={20} className={`transform transition-transform ${openSection === section.id ? 'rotate-180 text-purple-600' : 'text-gray-400'}`} /></button>{openSection === section.id && (<div className="p-4 bg-white border-t border-purple-50 space-y-3">{section.items.map((item, idx) => (<label key={idx} className="flex items-start space-x-3 cursor-pointer group"><div className="mt-0.5 w-5 h-5 rounded border border-gray-300 flex items-center justify-center text-white group-hover:border-purple-400 bg-white transition-colors peer-checked:bg-purple-600 peer-checked:border-purple-600"><input type="checkbox" className="hidden peer" /><CheckCircle2 size={14} className="opacity-0 peer-checked:opacity-100 text-purple-600" /></div><span className="text-sm text-gray-600">{item}</span></label>))}</div>)}</div>))}</div>
    </div>
  );
};

export const TeacherPortal: React.FC = () => {
  const { settings } = useContext(AccessibilityContext);
  const teacherResources = resources.filter(r => r.roles.includes(UserRole.TEACHER));
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const scrollToSection = (id: string) => { const el = document.getElementById(id); if(el) el.scrollIntoView({ behavior: 'smooth' }); };

  return (
    <div className="flex flex-col w-full animate-fade-in-up">
       <div className={`relative min-h-[70vh] flex items-center justify-center overflow-hidden parallax-section ${settings.isHighContrast ? 'bg-black border-b border-yellow-400' : 'bg-indigo-900'}`}>
          {!settings.isHighContrast && (<div className="absolute inset-0 z-0"><div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div><div className="absolute inset-0 bg-gradient-to-t from-indigo-900 via-purple-900/80 to-blue-900/30"></div></div>)}
          <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-white pt-20 pb-20">
             <div className="flex flex-col items-center text-center">
                <div className="inline-flex items-center space-x-2 bg-purple-500/10 backdrop-blur-md border border-purple-400/20 text-purple-100 rounded-full px-5 py-2.5 mb-8"><GraduationCap size={16} className="text-purple-300" /><span className="text-sm font-bold uppercase tracking-widest">Inclusive Classroom HQ</span></div>
                <h1 className="text-4xl md:text-7xl font-bold mb-8 leading-tight">Teach Every <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-200 to-indigo-100">Brain in the Room.</span></h1>
                <p className="text-lg md:text-xl text-indigo-100/80 max-w-2xl leading-relaxed mb-12">Neurodiversity is a strength, not a deficit. Equip yourself with evidence-based strategies to unlock potential in every student.</p>
                <div className="flex flex-wrap justify-center gap-4"><button onClick={() => scrollToSection('teacher-tools')} className="px-8 py-4 bg-white text-indigo-900 rounded-full font-bold text-lg hover:bg-indigo-50 transition-colors shadow-lg">Strategies</button><button onClick={() => scrollToSection('teacher-resources')} className="px-8 py-4 bg-indigo-800/50 text-white border border-indigo-400/30 rounded-full font-bold text-lg hover:bg-indigo-800/70 transition-colors backdrop-blur-md">Resources</button></div>
             </div>
          </div>
       </div>
       <div id="teacher-tools" className="py-20 bg-slate-50"><div className="max-w-7xl mx-auto px-6"><div className="text-center mb-16"><h2 className="text-3xl font-bold text-gray-900 mb-4">Classroom Toolkit</h2><p className="text-gray-600 max-w-2xl mx-auto">Instant access to accommodations and planning tools designed for diverse learners.</p></div><div className="grid md:grid-cols-2 gap-8 lg:gap-12"><div className="h-[450px]"><StrategyBank /></div><div className="h-[450px]"><LessonAudit /></div></div></div></div>
       
       {/* Resources Feed - UPDATED */}
       <div id="teacher-resources" className="py-20 bg-white">
         <div className="max-w-7xl mx-auto px-6">
           <div className="flex items-center mb-12">
             <div className="p-3 bg-purple-100 text-purple-700 rounded-xl mr-4"><Book size={28} /></div>
             <h2 className="text-3xl font-bold text-gray-900">Pedagogy & Research</h2>
           </div>
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
             {teacherResources.map(resource => (
               <div 
                 key={resource.id} 
                 onClick={() => setSelectedResource(resource)}
                 className={`
                   group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 cursor-pointer
                   ${settings.isHighContrast 
                     ? 'bg-black border-2 border-yellow-400 hover:shadow-[0_0_15px_rgba(250,204,21,0.5)]' 
                     : 'bg-white shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 hover:border-purple-200'}
                 `}
               >
                 <div className="relative h-48 w-full overflow-hidden">
                    <img 
                      src={resource.imageUrl || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2070&auto=format&fit=crop'} 
                      alt="" 
                      className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${settings.isHighContrast ? 'opacity-50 grayscale' : ''}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute top-4 right-4">
                       <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm bg-slate-800/80 text-white">
                         {resource.type.replace('_', ' ')}
                       </span>
                    </div>
                 </div>
                 <div className="flex-1 p-6 flex flex-col">
                   <div className="flex flex-wrap gap-2 mb-3">
                      {resource.tags.slice(0, 2).map(tag => (
                        <span key={tag} className={`text-[10px] px-2 py-1 rounded border ${settings.isHighContrast ? 'border-yellow-400 text-yellow-400' : 'bg-purple-50 border-purple-100 text-purple-600'}`}>#{tag}</span>
                      ))}
                   </div>
                   <h3 className={`text-xl font-bold mb-3 leading-snug group-hover:text-purple-700 transition-colors ${settings.isHighContrast ? 'text-yellow-400' : 'text-slate-900'}`}>{resource.title}</h3>
                   <p className={`text-sm mb-6 line-clamp-3 flex-grow ${settings.isHighContrast ? 'text-slate-200' : 'text-slate-600'}`}>{resource.description}</p>
                   <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100/10">
                      <span className={`text-sm font-bold flex items-center ${settings.isHighContrast ? 'text-yellow-400' : 'text-purple-600'}`}>
                        Read Now <ArrowRight size={16} className="ml-1 transform group-hover:translate-x-1 transition-transform" />
                      </span>
                   </div>
                 </div>
               </div>
             ))}
           </div>
         </div>
       </div>

       {/* Modal - UPDATED */}
       {selectedResource && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-fade-in-up">
          <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={() => setSelectedResource(null)}></div>
          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative z-10 flex flex-col">
             <div className="relative h-48 md:h-64 w-full flex-shrink-0">
               <img 
                 src={selectedResource.imageUrl || 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2070&auto=format&fit=crop'} 
                 className="w-full h-full object-cover" 
                 alt=""
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
               <button onClick={() => setSelectedResource(null)} className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors backdrop-blur-md"><X size={24} /></button>
               <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-md border border-white/20">{selectedResource.type.replace('_', ' ')}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight shadow-sm">{selectedResource.title}</h2>
               </div>
             </div>
             <div className="p-6 md:p-8">
               <div className="bg-purple-50/50 rounded-xl p-6 border border-purple-100 mb-6">
                 <h4 className="flex items-center text-sm font-bold text-purple-800 uppercase tracking-widest mb-4"><Book size={16} className="mr-2" />Quick Summary</h4>
                 {selectedResource.content && (<InteractiveText content={selectedResource.content} />)}
               </div>
               <div className="flex justify-center mt-8">
                  {selectedResource.url && (
                    <a href={selectedResource.url} target="_blank" rel="noreferrer" className="flex items-center px-6 py-3 bg-purple-600 text-white rounded-lg font-bold hover:bg-purple-700 transition-all shadow-lg shadow-purple-500/20">Read Original Article <ExternalLink size={18} className="ml-2" /></a>
                  )}
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Adult Portal Specific Components (NEW) ---
const WorkplaceHacks: React.FC = () => {
  const [selectedChallenge, setSelectedChallenge] = useState('Email Overload');
  const hacks: Record<string, string[]> = {
    'Email Overload': ['Use the "OHIO" method: Only Handle It Once.', 'Set specific times (e.g., 9am, 1pm) to check email.', 'Use text-to-speech features to listen to long emails.', 'Create templates for common responses.', 'Turn off desktop notifications.'],
    'Open Office Distractions': ['Wear noise-canceling headphones as a "Do Not Disturb" sign.', 'Book a conference room for 1 hour of "Deep Work".', 'Position your desk away from high-traffic areas.', 'Use a visual signal (like a red flag) when busy.'],
    'Time Blindness': ['Use analog clocks instead of digital ones.', 'Set "transition alarms" 5 minutes before a meeting starts.', 'Break large projects into micro-tasks with deadlines.', 'Use the "Pomodoro Technique" (25 min work, 5 min break).'],
    'Forgetfulness': ['Carry a "Capture Notebook" everywhere.', 'Record voice memos immediately after meetings.', 'Use a password manager.', 'Place essential items in the same spot every day.']
  };

  return (
    <div className="h-full bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col">
       <div className="bg-slate-100 p-6 border-b border-slate-200"><div className="flex items-center space-x-3 mb-4"><div className="p-2 bg-slate-200 text-slate-700 rounded-lg"><Briefcase size={24} /></div><h3 className="text-xl font-bold text-gray-900">Workplace Hacks</h3></div><div className="relative"><Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} /><select className="w-full pl-9 pr-4 py-3 border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-500 bg-white appearance-none cursor-pointer text-gray-700 font-medium" value={selectedChallenge} onChange={(e) => setSelectedChallenge(e.target.value)}>{Object.keys(hacks).map(cat => (<option key={cat} value={cat}>{cat}</option>))}</select><ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={16} /></div></div>
       <div className="flex-grow overflow-y-auto p-4 space-y-2">{hacks[selectedChallenge].map((hack, idx) => (<div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-300 transition-colors flex items-start"><div className="mt-1 mr-3 min-w-[20px] h-5 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold">{idx + 1}</div><p className="text-sm text-gray-700 leading-relaxed">{hack}</p></div>))}</div>
    </div>
  );
};

const DisclosureWizard: React.FC = () => {
  const [openSection, setOpenSection] = useState<string | null>('pros_cons');
  const sections = [
    { id: 'pros_cons', title: 'Pros & Cons Analysis', subtitle: 'Should I tell my employer?', content: (<ul className="space-y-2 text-sm text-gray-600"><li className="flex gap-2"><CheckCircle2 size={16} className="text-green-500 shrink-0" /> <strong>Pro:</strong> Legal protection under ADA.</li><li className="flex gap-2"><CheckCircle2 size={16} className="text-green-500 shrink-0" /> <strong>Pro:</strong> Access to reasonable accommodations.</li><li className="flex gap-2"><X size={16} className="text-red-500 shrink-0" /> <strong>Con:</strong> Potential for unconscious bias.</li></ul>) },
    { id: 'conversation', title: 'The Script', subtitle: 'How to start the conversation', content: (<div className="bg-slate-50 p-3 rounded-lg border-l-4 border-slate-400 italic text-sm text-gray-700">"I want to ensure I am performing at my best. Because of a medical condition, I have some difficulty with [task]. I work most effectively when I use [accommodation]. Can we discuss implementing this?"</div>) },
    { id: 'rights', title: 'Your Legal Rights', subtitle: 'What the law says (USA)', content: (<ul className="space-y-2 text-sm text-gray-600"><li>• Employers <strong>cannot</strong> ask if you have a disability during an interview.</li><li>• You are <strong>not</strong> required to disclose unless you need an accommodation.</li></ul>) }
  ];

  return (
    <div className="h-full bg-white rounded-2xl shadow-lg border border-slate-200 overflow-hidden flex flex-col">
      <div className="bg-slate-700 p-6 text-white"><div className="flex items-center space-x-3 mb-1"><div className="p-2 bg-white/20 rounded-lg"><MessageCircle size={24} /></div><h3 className="text-xl font-bold">Disclosure Wizard</h3></div><p className="text-slate-200 text-sm ml-1">To tell or not to tell?</p></div>
      <div className="flex-grow p-4 overflow-y-auto space-y-3">{sections.map(section => (<div key={section.id} className="border border-slate-200 rounded-xl overflow-hidden"><button onClick={() => setOpenSection(openSection === section.id ? null : section.id)} className={`w-full flex items-center justify-between p-4 transition-colors ${openSection === section.id ? 'bg-slate-50 text-slate-800' : 'bg-white hover:bg-gray-50'}`}><div className="text-left"><span className="font-bold block text-slate-800">{section.title}</span><span className="text-xs text-slate-500 font-normal">{section.subtitle}</span></div><ChevronDown size={20} className={`transform transition-transform ${openSection === section.id ? 'rotate-180 text-slate-600' : 'text-gray-400'}`} /></button>{openSection === section.id && (<div className="p-4 bg-white border-t border-slate-100">{section.content}</div>)}</div>))}</div>
    </div>
  );
};

export const AdultPortal: React.FC = () => {
  const { settings } = useContext(AccessibilityContext);
  const adultResources = resources.filter(r => r.roles.includes(UserRole.ADULT));
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const scrollToSection = (id: string) => { const el = document.getElementById(id); if(el) el.scrollIntoView({ behavior: 'smooth' }); };

  return (
    <div className="flex flex-col w-full animate-fade-in-up">
       <div className={`relative min-h-[70vh] flex items-center justify-center overflow-hidden parallax-section ${settings.isHighContrast ? 'bg-black border-b border-yellow-400' : 'bg-slate-800'}`}>
          {!settings.isHighContrast && (<div className="absolute inset-0 z-0"><div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div><div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-800/90 to-gray-900/40"></div></div>)}
          <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-white pt-20 pb-20">
             <div className="flex flex-col items-center text-center">
                <div className="inline-flex items-center space-x-2 bg-slate-600/30 backdrop-blur-md border border-slate-400/20 text-slate-200 rounded-full px-5 py-2.5 mb-8"><Briefcase size={16} className="text-slate-300" /><span className="text-sm font-bold uppercase tracking-widest">Career & Life Strategy</span></div>
                <h1 className="text-4xl md:text-7xl font-bold mb-8 leading-tight text-slate-100">Professional <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-slate-200 to-gray-400">Mastery.</span></h1>
                <p className="text-lg md:text-xl text-slate-300 max-w-2xl leading-relaxed mb-12">Your brain is an asset. Navigate the workplace, manage your life, and advocate for your needs with confidence.</p>
                <div className="flex flex-wrap justify-center gap-4"><button onClick={() => scrollToSection('adult-tools')} className="px-8 py-4 bg-white text-slate-900 rounded-full font-bold text-lg hover:bg-slate-100 transition-colors shadow-lg">Workplace Hacks</button><button onClick={() => scrollToSection('adult-resources')} className="px-8 py-4 bg-slate-700/50 text-white border border-slate-500/30 rounded-full font-bold text-lg hover:bg-slate-700/70 transition-colors backdrop-blur-md">Guides</button></div>
             </div>
          </div>
       </div>
       <div id="adult-tools" className="py-20 bg-gray-50"><div className="max-w-7xl mx-auto px-6"><div className="text-center mb-16"><h2 className="text-3xl font-bold text-gray-900 mb-4">Executive Function Toolkit</h2><p className="text-gray-600 max-w-2xl mx-auto">Strategies to handle the hidden curriculum of the workplace and adult life.</p></div><div className="grid md:grid-cols-2 gap-8 lg:gap-12"><div className="h-[500px]"><WorkplaceHacks /></div><div className="h-[500px]"><DisclosureWizard /></div></div></div></div>
       
       {/* Resources Feed - UPDATED */}
       <div id="adult-resources" className="py-20 bg-white">
         <div className="max-w-7xl mx-auto px-6">
           <div className="flex items-center mb-12">
             <div className="p-3 bg-slate-100 text-slate-700 rounded-xl mr-4"><Building2 size={28} /></div>
             <h2 className="text-3xl font-bold text-gray-900">Career & Life Guides</h2>
           </div>
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
             {adultResources.map(resource => (
               <div 
                 key={resource.id} 
                 onClick={() => setSelectedResource(resource)}
                 className={`
                   group relative flex flex-col overflow-hidden rounded-2xl transition-all duration-300 cursor-pointer
                   ${settings.isHighContrast 
                     ? 'bg-black border-2 border-yellow-400 hover:shadow-[0_0_15px_rgba(250,204,21,0.5)]' 
                     : 'bg-white shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 hover:border-slate-300'}
                 `}
               >
                 <div className="relative h-48 w-full overflow-hidden">
                    <img 
                      src={resource.imageUrl || 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop'} 
                      alt="" 
                      className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${settings.isHighContrast ? 'opacity-50 grayscale' : ''}`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute top-4 right-4">
                       <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm bg-slate-800/80 text-white">
                         {resource.type.replace('_', ' ')}
                       </span>
                    </div>
                 </div>
                 <div className="flex-1 p-6 flex flex-col">
                   <div className="flex flex-wrap gap-2 mb-3">
                      {resource.tags.slice(0, 2).map(tag => (
                        <span key={tag} className={`text-[10px] px-2 py-1 rounded border ${settings.isHighContrast ? 'border-yellow-400 text-yellow-400' : 'bg-slate-100 border-slate-200 text-slate-500'}`}>#{tag}</span>
                      ))}
                   </div>
                   <h3 className={`text-xl font-bold mb-3 leading-snug group-hover:text-slate-700 transition-colors ${settings.isHighContrast ? 'text-yellow-400' : 'text-slate-900'}`}>{resource.title}</h3>
                   <p className={`text-sm mb-6 line-clamp-3 flex-grow ${settings.isHighContrast ? 'text-slate-200' : 'text-slate-600'}`}>{resource.description}</p>
                   <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100/10">
                      <span className={`text-sm font-bold flex items-center ${settings.isHighContrast ? 'text-yellow-400' : 'text-slate-800'}`}>
                        Read Now <ArrowRight size={16} className="ml-1 transform group-hover:translate-x-1 transition-transform" />
                      </span>
                   </div>
                 </div>
               </div>
             ))}
           </div>
         </div>
       </div>

       {/* Modal - UPDATED */}
       {selectedResource && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-fade-in-up">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setSelectedResource(null)}></div>
          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative z-10 flex flex-col">
             <div className="relative h-48 md:h-64 w-full flex-shrink-0">
               <img 
                 src={selectedResource.imageUrl || 'https://images.unsplash.com/photo-1497366216548-37526070297c?q=80&w=2069&auto=format&fit=crop'} 
                 className="w-full h-full object-cover" 
                 alt=""
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
               <button onClick={() => setSelectedResource(null)} className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors backdrop-blur-md"><X size={24} /></button>
               <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-md border border-white/20">{selectedResource.type.replace('_', ' ')}</span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight shadow-sm">{selectedResource.title}</h2>
               </div>
             </div>
             <div className="p-6 md:p-8">
               <div className="bg-slate-100/50 rounded-xl p-6 border border-slate-200 mb-6">
                 <h4 className="flex items-center text-sm font-bold text-slate-700 uppercase tracking-widest mb-4"><Book size={16} className="mr-2" />Quick Summary</h4>
                 {selectedResource.content && (<InteractiveText content={selectedResource.content} />)}
               </div>
               <div className="flex justify-center mt-8">
                  {selectedResource.url && (
                    <a href={selectedResource.url} target="_blank" rel="noreferrer" className="flex items-center px-6 py-3 bg-slate-800 text-white rounded-lg font-bold hover:bg-slate-900 transition-all shadow-lg shadow-slate-500/20">Read Original Article <ExternalLink size={18} className="ml-2" /></a>
                  )}
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const ResourceLibrary: React.FC = () => {
  const { settings } = useContext(AccessibilityContext);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);

  const filtered = resources.filter(r => {
    const matchSearch = r.title.toLowerCase().includes(search.toLowerCase()) || 
                        r.description.toLowerCase().includes(search.toLowerCase()) ||
                        r.tags.some(t => t.toLowerCase().includes(search.toLowerCase()));
    const matchRole = roleFilter === 'all' || r.roles.includes(roleFilter as UserRole);
    const matchType = typeFilter === 'all' || r.type === typeFilter;
    return matchSearch && matchRole && matchType;
  });

  return (
    <div className="animate-fade-in-up w-full">
       <div className={`py-12 border-b ${settings.isHighContrast ? 'bg-black border-yellow-400' : 'bg-slate-50 border-gray-200'}`}>
         <div className="max-w-7xl mx-auto px-6">
           <div className="flex items-center mb-8">
             <div className={`p-3 rounded-2xl mr-4 ${settings.isHighContrast ? 'bg-yellow-400 text-black' : 'bg-brand-600 text-white'}`}>
               <Search size={28} />
             </div>
             <div>
               <h1 className={`text-4xl font-bold ${settings.isHighContrast ? 'text-yellow-400' : 'text-gray-900'}`}>Resource Library</h1>
               <p className={`mt-2 text-lg ${settings.isHighContrast ? 'text-white' : 'text-gray-600'}`}>Explore our collection of tools, guides, and articles.</p>
             </div>
           </div>
           
           {/* Filters */}
           <div className="flex flex-col md:flex-row gap-4">
             <div className="flex-1 relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
               <input 
                 type="text" 
                 placeholder="Search by keyword or tag..." 
                 className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-brand-500 text-gray-900"
                 value={search}
                 onChange={(e) => setSearch(e.target.value)}
               />
             </div>
             <select 
               className="p-3 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
               value={roleFilter}
               onChange={(e) => setRoleFilter(e.target.value)}
             >
               <option value="all">All Roles</option>
               <option value={UserRole.STUDENT}>Students</option>
               <option value={UserRole.PARENT}>Parents</option>
               <option value={UserRole.TEACHER}>Teachers</option>
               <option value={UserRole.ADULT}>Adults</option>
             </select>
             <select 
               className="p-3 rounded-xl border border-gray-200 bg-white text-gray-700 focus:outline-none focus:ring-2 focus:ring-brand-500"
               value={typeFilter}
               onChange={(e) => setTypeFilter(e.target.value)}
             >
               <option value="all">All Types</option>
               <option value={ContentType.ARTICLE}>Articles</option>
               <option value={ContentType.TOOL}>Tools</option>
               <option value={ContentType.DOWNLOADABLE}>Downloadables</option>
               <option value={ContentType.EXTERNAL_LINK}>Links</option>
             </select>
           </div>
         </div>
       </div>

       <div className={`min-h-screen ${settings.isHighContrast ? 'bg-black' : 'bg-white'}`}>
       <div className="max-w-7xl mx-auto px-6 py-12">
         {filtered.length === 0 ? (
           <div className="text-center py-20">
             <div className="inline-block p-4 rounded-full bg-gray-100 text-gray-400 mb-4">
               <Search size={48} />
             </div>
             <p className="text-xl text-gray-500">No resources found matching your criteria.</p>
             <button onClick={() => {setSearch(''); setRoleFilter('all'); setTypeFilter('all');}} className="mt-4 text-brand-600 font-medium hover:underline">Clear all filters</button>
           </div>
         ) : (
           <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
             {filtered.map(resource => (
               <div 
                 key={resource.id} 
                 onClick={() => setSelectedResource(resource)}
                 className={`
                   group cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 flex flex-col h-full
                   ${settings.isHighContrast 
                     ? 'bg-black border-2 border-yellow-400 hover:shadow-[0_0_15px_rgba(250,204,21,0.5)]' 
                     : 'bg-white shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 hover:border-brand-200'}
                 `}
               >
                 <div className="h-48 overflow-hidden relative shrink-0">
                   <img 
                     src={resource.imageUrl || 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=2070&auto=format&fit=crop'} 
                     alt="" 
                     className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${settings.isHighContrast ? 'opacity-50 grayscale' : ''}`}
                   />
                   <div className="absolute top-4 right-4">
                      <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider backdrop-blur-md shadow-sm bg-slate-800/80 text-white">
                        {resource.type.replace('_', ' ')}
                      </span>
                   </div>
                 </div>
                 <div className="p-6 flex flex-col flex-grow">
                   <div className="flex flex-wrap gap-2 mb-3">
                     {resource.tags.slice(0, 3).map(tag => (
                       <span key={tag} className={`text-[10px] px-2 py-1 rounded border ${settings.isHighContrast ? 'border-yellow-400 text-yellow-400' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>#{tag}</span>
                     ))}
                   </div>
                   <h3 className={`text-xl font-bold mb-3 ${settings.isHighContrast ? 'text-yellow-400' : 'text-gray-900'}`}>{resource.title}</h3>
                   <p className={`text-sm line-clamp-3 mb-4 flex-grow ${settings.isHighContrast ? 'text-slate-200' : 'text-gray-600'}`}>{resource.description}</p>
                   
                   <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100/10">
                      <span className={`text-sm font-bold flex items-center ${settings.isHighContrast ? 'text-yellow-400' : 'text-brand-600'}`}>
                        View Details <ArrowRight size={16} className="ml-1 transform group-hover:translate-x-1 transition-transform" />
                      </span>
                   </div>
                 </div>
               </div>
             ))}
           </div>
         )}
       </div>
       </div>

       {selectedResource && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 animate-fade-in-up">
          <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-md" onClick={() => setSelectedResource(null)}></div>
          <div className="bg-white w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl relative z-10 flex flex-col">
             <div className="relative h-48 md:h-64 w-full flex-shrink-0">
               <img 
                 src={selectedResource.imageUrl || 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=2070&auto=format&fit=crop'} 
                 className="w-full h-full object-cover" 
                 alt=""
               />
               <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
               <button 
                 onClick={() => setSelectedResource(null)}
                 className="absolute top-4 right-4 p-2 bg-black/40 hover:bg-black/60 text-white rounded-full transition-colors backdrop-blur-md"
               >
                 <X size={24} />
               </button>
               <div className="absolute bottom-0 left-0 p-6 md:p-8 w-full">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-md border border-white/20">
                      {selectedResource.type.replace('_', ' ')}
                    </span>
                  </div>
                  <h2 className="text-2xl md:text-3xl font-bold text-white leading-tight shadow-sm">{selectedResource.title}</h2>
               </div>
             </div>

             <div className="p-6 md:p-8">
               <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 mb-6">
                 <h4 className="flex items-center text-sm font-bold text-slate-500 uppercase tracking-widest mb-4"><Bookmark size={16} className="mr-2" />Key Takeaways</h4>
                 {selectedResource.content && (<InteractiveText content={selectedResource.content} />)}
               </div>
               <div className="flex justify-center gap-4">
                 {selectedResource.url && (
                   <a href={selectedResource.url} target="_blank" rel="noreferrer" className="flex items-center px-6 py-3 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-all shadow-lg shadow-brand-500/20">Visit Resource <ExternalLink size={18} className="ml-2" /></a>
                 )}
                 <button onClick={() => setSelectedResource(null)} className="px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all">Close</button>
               </div>
             </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Home Page Components Helpers (RESTORED) ---
const RoleParallaxSection: React.FC<{
  id: string;
  image: string;
  title: string;
  description: string;
  linkTo: string;
  linkText: string;
  align?: 'left' | 'right';
  icon: React.ElementType;
}> = ({ id, image, title, description, linkTo, linkText, align = 'left', icon: Icon }) => {
  const { settings } = useContext(AccessibilityContext);
  const bgStyle = settings.isHighContrast 
    ? { backgroundColor: '#000' }
    : { backgroundImage: `url('${image}')` };

  return (
    <div id={id} className="relative w-full h-[85vh] md:h-[80vh] flex items-center parallax-section overflow-hidden" style={bgStyle}>
      <div className={`absolute inset-0 ${settings.isHighContrast ? 'bg-black' : 'bg-slate-900/60'}`}></div>
      <div className="relative z-10 max-w-7xl mx-auto px-6 w-full">
        <div className={`flex flex-col ${align === 'right' ? 'md:items-end md:text-right' : 'md:items-start md:text-left'} text-center`}>
          <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-full px-4 py-2 mb-6"><Icon size={18} className="text-brand-300" /><span className="text-sm font-semibold uppercase tracking-widest">{linkText}</span></div>
          <h2 className={`text-4xl md:text-6xl font-bold text-white mb-6 leading-tight max-w-2xl ${settings.isHighContrast ? 'text-yellow-400' : ''}`}>{title}</h2>
          <p className="text-lg md:text-2xl text-slate-200 mb-10 max-w-xl leading-relaxed">{description}</p>
          <Link to={linkTo} className={`inline-flex items-center px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 ${settings.isHighContrast ? 'bg-yellow-400 text-black hover:bg-yellow-300 border-2 border-white' : 'bg-white text-brand-900 hover:bg-brand-50 shadow-lg shadow-black/20'}`}>Enter Portal <ArrowRight size={20} className="ml-2" /></Link>
        </div>
      </div>
    </div>
  );
};

const Feature: React.FC<{ title: string, desc: string, icon: React.ElementType }> = ({ title, desc, icon: Icon }) => (
  <div className="flex flex-col items-center">
    <div className="w-20 h-20 rounded-2xl bg-white shadow-lg flex items-center justify-center text-brand-600 mb-6 transform transition-transform hover:rotate-6"><Icon size={40} /></div>
    <h3 className="font-bold text-xl mb-3 text-gray-900">{title}</h3>
    <p className="text-gray-600 leading-relaxed max-w-sm mx-auto">{desc}</p>
  </div>
);

// --- Home Page (RESTORED PARALLAX VERSION) ---
export const HomePage: React.FC = () => {
  const { settings } = useContext(AccessibilityContext);
  const scrollDown = () => { const el = document.getElementById('student-section'); if (el) el.scrollIntoView({ behavior: 'smooth' }); };

  return (
    <div className="flex flex-col w-full">
      <div className={`relative min-h-[90vh] flex items-center justify-center overflow-hidden ${settings.isHighContrast ? 'bg-black' : 'bg-slate-900'}`}>
        {!settings.isHighContrast && (<div className="absolute inset-0 z-0"><div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-slate-800 via-slate-900 to-black"></div><div className="absolute top-[20%] left-[20%] w-96 h-96 bg-brand-600/20 rounded-full blur-[100px] animate-pulse"></div><div className="absolute bottom-[20%] right-[20%] w-96 h-96 bg-purple-600/20 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: '2s'}}></div></div>)}
        <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
          <div className="animate-fade-in-up">
            <span className={`inline-block px-4 py-1.5 rounded-full text-sm font-semibold tracking-wider mb-6 ${settings.isHighContrast ? 'bg-yellow-400 text-black' : 'bg-brand-900/50 text-brand-200 border border-brand-700/50'}`}>FOR LEARNING DISABILITIES</span>
            <h1 className="text-5xl md:text-8xl font-bold tracking-tight text-white mb-8 leading-tight">
              Lexi <br />
              <span className="block text-2xl md:text-4xl font-medium tracking-normal mt-2">
                The Neurodiverse Learning Coach
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-slate-300 max-w-2xl mx-auto mb-12 font-light leading-relaxed">We believe every brain works beautifully. We provide the tools, strategies, and confidence to help you learn your way.</p>
            <div className="flex justify-center"><button onClick={scrollDown} className="animate-bounce p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors border border-white/10"><ChevronDown size={32} /></button></div>
          </div>
        </div>
      </div>

      <RoleParallaxSection id="student-section" image="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?q=80&w=2070&auto=format&fit=crop" title="I am a Student" description="Reading doesn't have to be a struggle. Discover tools that read to you, help you spell, and let your creativity shine." linkTo="/student" linkText="Student Zone" align="left" icon={Users} />
      <RoleParallaxSection id="parent-section" image="https://images.unsplash.com/photo-1544725176-7c40e5a71c5e?q=80&w=2070&auto=format&fit=crop" title="I am a Parent" description="You are their biggest champion. Find plain-language guides, legal advice, and homework strategies to support your child's journey." linkTo="/parent" linkText="Parent Support" align="right" icon={Home} />
      <RoleParallaxSection id="teacher-section" image="https://images.unsplash.com/photo-1509062522246-3755977927d7?q=80&w=2070&auto=format&fit=crop" title="I am a Teacher" description="Create an inclusive classroom where every student thrives. Download accommodations templates and UDL strategies." linkTo="/teacher" linkText="Teacher Resources" align="left" icon={GraduationCap} />
      <RoleParallaxSection id="adult-section" image="https://images.unsplash.com/photo-1497215728101-856f4ea42174?q=80&w=2070&auto=format&fit=crop" title="I am an Adult" description="It's never too late. Master assistive technology for the workplace and embrace your unique way of thinking." linkTo="/adult" linkText="Adult Learners" align="right" icon={Briefcase} />

      <div className="bg-slate-50 py-24">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-16">Smart Tools Built-In</h2>
          <div className="grid md:grid-cols-3 gap-12">
            <Feature icon={Headphones} title="Text-to-Speech" desc="Our 'Read with Me' engine highlights text as it speaks, boosting comprehension and focus." />
            <Feature icon={Eye} title="Visual Controls" desc="Personalize your view with high contrast, dyslexia-friendly fonts, and focus modes." />
            <Feature icon={MousePointerClick} title="Smart Dictionary" desc="Instant definitions at a click. No more switching tabs to understand a new word." />
          </div>
        </div>
      </div>

      <div className={`py-24 text-center ${settings.isHighContrast ? 'bg-black text-yellow-400 border-t border-yellow-400' : 'bg-brand-900 text-white'}`}>
        <div className="max-w-4xl mx-auto px-6">
          <h2 className="text-4xl font-bold mb-6">Ready to start?</h2>
          <p className="text-xl opacity-80 mb-10">Access our complete library of free articles, tools, and guides.</p>
          <Link to="/resources" className={`inline-block px-10 py-5 rounded-full font-bold text-lg transition-transform hover:scale-105 ${settings.isHighContrast ? 'bg-yellow-400 text-black' : 'bg-white text-brand-900'}`}>Browse Resource Library</Link>
        </div>
      </div>
    </div>
  );
};
