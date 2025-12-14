
import React, { useState, useRef, useEffect, useContext } from 'react';
import { AccessibilityContext, DictionaryPopup } from './Shared';
import { askMathCoach, ChatMessage } from '../services/ai';
import { fetchDefinition } from '../services/utils';
import { MathCanvasAction, DictionaryResult } from '../types';
import { 
  Mic, 
  Send, 
  Bot, 
  Loader2, 
  Trash2, 
  Eraser, 
  Calculator,
  PenTool,
  StopCircle,
  Volume2, 
  ChevronDown,
  Sparkles,
  MousePointer2,
  Undo2
} from 'lucide-react';

// Massive canvas for high visibility
const CANVAS_WIDTH = 1600;
const CANVAS_HEIGHT = 900;

interface Point {
  x: number;
  y: number;
}

interface Stroke {
  points: Point[];
  color: string;
  width: number;
}

export const MathPlayground: React.FC = () => {
  const { settings } = useContext(AccessibilityContext);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  
  // Dictionary State
  const [dictResult, setDictResult] = useState<DictionaryResult | null>(null);
  const [dictPos, setDictPos] = useState<{x: number, y: number} | null>(null);
  const [isLoadingDict, setIsLoadingDict] = useState(false);
  
  // AI Drawing State
  const [aiActions, setAiActions] = useState<MathCanvasAction[]>([]);
  
  // User Drawing State
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentTool, setCurrentTool] = useState<'pen' | 'pointer'>('pen');
  const [userStrokes, setUserStrokes] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  
  // Voice Input
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Refs
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize Greeting
  useEffect(() => {
    setMessages([{ role: 'model', text: "Hi! I'm your visual math coach. Draw on the board or ask me a question!" }]);
  }, []);

  // Scroll chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isThinking]);

  // --- Voice Input Logic ---
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };

      recognitionRef.current.onend = () => setIsListening(false);
    }
  }, []);

  const toggleVoice = () => {
    if (!recognitionRef.current) return alert("Browser does not support voice input.");
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setInput('');
      recognitionRef.current.start();
      setIsListening(true);
    }
  };

  // --- Dictionary Logic ---
  const handleWordClick = async (e: React.MouseEvent, word: string) => {
    e.stopPropagation();
    const cleanWord = word.replace(/^[^\w]+|[^\w]+$/g, '');
    if (!cleanWord) return;

    setIsLoadingDict(true);
    // Adjust position to avoid going off-screen
    const x = Math.min(e.clientX, window.innerWidth - 320); 
    setDictPos({ x, y: e.clientY });
    
    const result = await fetchDefinition(cleanWord);
    setDictResult(result);
    setIsLoadingDict(false);
  };

  const renderInteractiveText = (text: string, isUser: boolean) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, pIdx) => {
      const isBold = part.startsWith('**') && part.endsWith('**');
      const cleanPart = isBold ? part.slice(2, -2) : part;
      return cleanPart.split(/(\s+)/).map((token, wIdx) => {
        if (/^\s+$/.test(token)) return <span key={`${pIdx}-${wIdx}`}>{token}</span>;
        if (!token) return null;
        return (
          <span 
            key={`${pIdx}-${wIdx}`}
            onClick={(e) => handleWordClick(e, token)}
            className={`
              cursor-pointer transition-colors duration-200
              ${isBold ? 'font-bold' : ''}
              ${isUser 
                 ? (settings.isHighContrast ? 'hover:text-yellow-200 hover:underline' : 'hover:text-blue-100 hover:underline') 
                 : (settings.isHighContrast ? 'hover:text-blue-400 hover:underline' : 'hover:text-blue-600 hover:bg-blue-50 rounded px-0.5')
              }
            `}
          >
            {token}
          </span>
        );
      });
    });
  };

  // --- Canvas Logic ---

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // 1. Clear & Background
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    ctx.fillStyle = settings.isHighContrast ? '#000000' : '#ffffff';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // 2. Grid Lines (Subtle but larger grid)
    if (!settings.isHighContrast) {
        ctx.strokeStyle = '#f1f5f9';
        ctx.lineWidth = 2;
        // Larger grid cells (100px)
        for (let x = 0; x <= CANVAS_WIDTH; x += 100) { ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, CANVAS_HEIGHT); ctx.stroke(); }
        for (let y = 0; y <= CANVAS_HEIGHT; y += 100) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(CANVAS_WIDTH, y); ctx.stroke(); }
    }

    // 3. Draw AI Actions
    aiActions.forEach(action => {
      ctx.beginPath();
      const color = settings.isHighContrast ? (action.color === '#000000' || action.color === '#1f2937' ? '#ffffff' : action.color || '#FFFF00') : (action.color || '#3b82f6');
      
      switch (action.type) {
        case 'rect':
          ctx.fillStyle = color;
          ctx.fillRect(action.x || 0, action.y || 0, action.w || 100, action.h || 100);
          if (action.label) drawLabel(ctx, action.label, (action.x || 0) + (action.w || 100)/2, (action.y || 0) + (action.h || 100)/2);
          break;
        case 'circle':
          ctx.fillStyle = color;
          ctx.arc(action.x || 0, action.y || 0, action.r || 50, 0, Math.PI * 2);
          ctx.fill();
          if (action.label) drawLabel(ctx, action.label, action.x || 0, action.y || 0);
          break;
        case 'line':
          ctx.strokeStyle = color;
          // Make lines much thicker by default
          ctx.lineWidth = action.size || 8; 
          ctx.moveTo(action.x1 || 0, action.y1 || 0);
          ctx.lineTo(action.x2 || 0, action.y2 || 0);
          ctx.stroke();
          break;
        case 'text':
          ctx.fillStyle = color;
          // Much larger font
          ctx.font = `bold ${action.size || 48}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(action.text || '', action.x || 0, action.y || 0);
          break;
      }
    });

    // 4. Draw User Strokes
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    [...userStrokes, currentStroke].forEach(stroke => {
      if (!stroke || stroke.points.length < 2) return;
      
      ctx.beginPath();
      ctx.strokeStyle = settings.isHighContrast ? '#FFFF00' : stroke.color;
      ctx.lineWidth = stroke.width;
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y);
      
      for (let i = 1; i < stroke.points.length; i++) {
        ctx.lineTo(stroke.points[i].x, stroke.points[i].y);
      }
      ctx.stroke();
    });

  }, [aiActions, userStrokes, currentStroke, settings.isHighContrast]);

  const drawLabel = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number) => {
     ctx.fillStyle = settings.isHighContrast ? 'black' : 'white';
     ctx.font = "bold 24px sans-serif"; // Larger label font
     ctx.textAlign = 'center';
     ctx.textBaseline = 'middle';
     ctx.fillText(text, x, y);
  };

  // Drawing Handlers
  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    if (currentTool !== 'pen') return;
    const pos = getPos(e);
    if (!pos) return;

    setIsDrawing(true);
    setCurrentStroke({
      points: [pos],
      color: settings.isHighContrast ? '#FFFF00' : '#0f172a',
      width: 8 // Thicker default pen
    });
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing || !currentStroke || currentTool !== 'pen') return;
    const pos = getPos(e);
    if (!pos) return;

    setCurrentStroke({
      ...currentStroke,
      points: [...currentStroke.points, pos]
    });
  };

  const stopDrawing = () => {
    if (!isDrawing || !currentStroke) return;
    setIsDrawing(false);
    setUserStrokes([...userStrokes, currentStroke]);
    setCurrentStroke(null);
  };

  const getPos = (e: React.MouseEvent | React.TouchEvent): Point | null => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = (e as React.MouseEvent).clientX;
      clientY = (e as React.MouseEvent).clientY;
    }

    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  };

  const getCanvasImage = (): string | undefined => {
    if (!canvasRef.current) return undefined;
    return canvasRef.current.toDataURL('image/png');
  };

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;
    
    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }

    const userText = input;
    setMessages(prev => [...prev, { role: 'user', text: userText }]);
    setInput('');
    setIsThinking(true);

    // Capture Canvas State
    const snapshot = getCanvasImage();

    try {
      // Send text + image to Gemini
      const result = await askMathCoach(userText, snapshot);
      
      setMessages(prev => [...prev, { role: 'model', text: result.explanation }]);
      
      // Merge new AI actions with existing ones (or replace? Let's append for conversation history)
      if (result.actions && result.actions.length > 0) {
        setAiActions(prev => [...prev, ...result.actions]);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'model', text: "Something went wrong connecting to the math brain. Try again!" }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleClear = () => {
    setAiActions([]);
    setUserStrokes([]);
    setMessages(prev => [...prev, { role: 'model', text: "Board cleared! Ready for a fresh start." }]);
  };

  const handleUndo = () => {
    setUserStrokes(prev => prev.slice(0, -1));
  };

  const speakMessage = (text: string) => {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.speak(u);
  };

  const scrollDown = () => {
     const el = document.getElementById('playground-workspace');
     if(el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className={`flex flex-col w-full ${settings.isHighContrast ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* --- Parallax Hero Header --- */}
      <div className={`relative min-h-[60vh] flex items-center justify-center overflow-hidden parallax-section ${settings.isHighContrast ? 'bg-black border-b border-yellow-400' : 'bg-blue-900'}`}>
         {!settings.isHighContrast && (
           <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1635070041078-e363dbe005cb?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
             <div className="absolute inset-0 bg-gradient-to-t from-blue-900 via-blue-900/80 to-indigo-900/30"></div>
             <div className="absolute top-20 right-20 w-72 h-72 bg-cyan-500/20 rounded-full blur-[80px] animate-pulse"></div>
           </div>
         )}
         <div className="relative z-10 max-w-7xl mx-auto px-6 w-full text-white pt-20 pb-20 text-center">
             <div className="inline-flex items-center space-x-2 bg-blue-500/10 backdrop-blur-md border border-blue-400/20 text-blue-200 rounded-full px-5 py-2.5 mb-8 shadow-lg shadow-blue-500/10 cursor-default">
               <Sparkles size={16} className="text-blue-400" />
               <span className="text-sm font-bold uppercase tracking-widest">Interactive Math Studio</span>
             </div>
             <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight tracking-tight">
               Draw. Ask. <br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 to-blue-200">Understand.</span>
             </h1>
             <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-12">
               Use the smart whiteboard to visualize problems. Draw a shape, circle a number, or just doodle—our AI Coach sees what you see.
             </p>
             <div className="flex justify-center">
                <button onClick={scrollDown} className="animate-bounce p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors border border-white/10">
                  <ChevronDown size={32} />
                </button>
             </div>
         </div>
      </div>

      {/* --- Main Workspace --- */}
      <div id="playground-workspace" className="flex-grow max-w-7xl mx-auto w-full p-4 md:p-6 grid lg:grid-cols-12 gap-6 h-[calc(100vh-100px)] -mt-10 relative z-20">
        
        {/* Left: Math Coach Chat */}
        <div className="lg:col-span-4 flex flex-col h-full rounded-3xl overflow-hidden border shadow-2xl relative bg-white border-slate-200 order-2 lg:order-1">
           {settings.isHighContrast && <div className="absolute inset-0 bg-black border-2 border-yellow-400 z-0"></div>}
           
           <div className="relative z-10 bg-slate-100 p-4 border-b border-slate-200 flex items-center justify-between">
              <span className="font-bold text-slate-700 flex items-center"><Bot size={18} className="mr-2" /> AI Coach</span>
              <span className="text-xs bg-white px-2 py-1 rounded text-slate-500 border border-slate-200">Vision Enabled</span>
           </div>

           <div className="relative z-10 flex-grow overflow-y-auto p-4 space-y-4 bg-slate-50/50">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                   <div className={`
                     max-w-[90%] p-3 rounded-2xl text-sm font-medium
                     ${msg.role === 'user' 
                       ? 'bg-blue-600 text-white rounded-br-none' 
                       : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none shadow-sm'}
                   `}>
                     {renderInteractiveText(msg.text, msg.role === 'user')}
                   </div>
                   {msg.role === 'model' && (
                     <button onClick={() => speakMessage(msg.text)} className="mt-1 ml-1 text-slate-400 hover:text-blue-500"><Volume2 size={14} /></button>
                   )}
                </div>
              ))}
              {isThinking && (
                 <div className="flex items-center space-x-2 text-slate-400 text-sm p-2">
                    <Loader2 size={16} className="animate-spin" /> <span>Analyzing board...</span>
                 </div>
              )}
              <div ref={messagesEndRef} />
           </div>

           <div className="relative z-10 p-4 border-t border-slate-200 bg-white">
              <div className="flex items-center gap-2">
                 <button 
                   onClick={toggleVoice}
                   className={`p-3 rounded-full transition-all ${isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-500 hover:bg-slate-200'}`}
                 >
                    {isListening ? <StopCircle size={20} /> : <Mic size={20} />}
                 </button>
                 <input 
                   className="flex-grow p-3 bg-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-slate-800"
                   placeholder="Draw & ask (e.g. 'What shape is this?')"
                   value={input}
                   onChange={(e) => setInput(e.target.value)}
                   onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                 />
                 <button 
                   onClick={handleSend}
                   disabled={!input.trim() || isThinking}
                   className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50"
                 >
                   <Send size={20} />
                 </button>
              </div>
           </div>
        </div>

        {/* Right: Interactive Canvas */}
        <div className={`lg:col-span-8 h-full rounded-3xl overflow-hidden shadow-2xl relative border-4 flex flex-col items-center justify-center order-1 lg:order-2 ${settings.isHighContrast ? 'border-yellow-400 bg-black' : 'border-slate-300 bg-slate-100'}`}>
           
           <div className="w-full h-full flex items-center justify-center bg-slate-200/50 overflow-hidden relative">
               <canvas 
                 ref={canvasRef}
                 width={CANVAS_WIDTH}
                 height={CANVAS_HEIGHT}
                 className={`max-w-full max-h-full aspect-video shadow-lg bg-white touch-none cursor-${currentTool === 'pen' ? 'crosshair' : 'default'}`}
                 onMouseDown={startDrawing}
                 onMouseMove={draw}
                 onMouseUp={stopDrawing}
                 onMouseLeave={stopDrawing}
                 onTouchStart={startDrawing}
                 onTouchMove={draw}
                 onTouchEnd={stopDrawing}
               />
               
               {userStrokes.length === 0 && aiActions.length === 0 && !isDrawing && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-40">
                    <div className="text-center">
                       <PenTool size={64} className="mx-auto mb-4 text-slate-400" />
                       <p className="text-2xl font-bold text-slate-500">Interactive Whiteboard</p>
                       <p className="text-slate-400">Draw with your mouse, then ask the AI to explain.</p>
                    </div>
                 </div>
               )}
           </div>

           {/* Canvas Toolbar - Moved to Bottom Right */}
           <div className={`absolute bottom-6 right-6 z-20 flex gap-2 p-2 rounded-xl shadow-lg border ${settings.isHighContrast ? 'bg-slate-900 border-yellow-400' : 'bg-white border-slate-200'}`}>
              <button 
                onClick={() => setCurrentTool('pen')}
                className={`p-3 rounded-lg transition-colors ${currentTool === 'pen' ? (settings.isHighContrast ? 'bg-yellow-400 text-black' : 'bg-blue-100 text-blue-600') : 'text-slate-400 hover:text-slate-600'}`}
                title="Draw"
              >
                <PenTool size={24} />
              </button>
              <button 
                onClick={() => setCurrentTool('pointer')}
                className={`p-3 rounded-lg transition-colors ${currentTool === 'pointer' ? (settings.isHighContrast ? 'bg-yellow-400 text-black' : 'bg-blue-100 text-blue-600') : 'text-slate-400 hover:text-slate-600'}`}
                title="Pointer / Scroll"
              >
                <MousePointer2 size={24} />
              </button>
              <div className="w-px bg-slate-200 mx-1"></div>
              <button onClick={handleUndo} className="p-3 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg" title="Undo">
                <Undo2 size={24} />
              </button>
              <button onClick={handleClear} className="p-3 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg" title="Clear All">
                <Eraser size={24} />
              </button>
           </div>
        </div>
      </div>

      <DictionaryPopup 
        result={dictResult} 
        position={dictPos} 
        onClose={() => setDictPos(null)} 
        isLoading={isLoadingDict}
      />
    </div>
  );
};
