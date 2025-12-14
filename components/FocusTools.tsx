import React, { useState, useContext } from 'react';
import { AccessibilityContext, FocusContext } from './Shared';
import { getTaskBreakdown, TaskStep } from '../services/ai';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  ListTodo, 
  Wand2, 
  CheckCircle2, 
  Circle, 
  Trash2,
  Target,
  Coffee,
  Loader2,
  Timer as TimerIcon,
  ChevronDown,
  Sparkles,
  ArrowRight
} from 'lucide-react';

export const FocusTools: React.FC = () => {
  const { settings } = useContext(AccessibilityContext);
  const { 
    timeLeft, 
    isActive, 
    mode, 
    toggleTimer, 
    resetTimer, 
    switchMode, 
    formatTime, 
    totalTime 
  } = useContext(FocusContext);
  
  // --- Task State (Local) ---
  const [bigTask, setBigTask] = useState('');
  const [subTasks, setSubTasks] = useState<TaskStep[]>([]);
  const [loading, setLoading] = useState(false);

  // Helper to scroll
  const scrollDown = () => {
     const el = document.getElementById('focus-workspace');
     if(el) el.scrollIntoView({ behavior: 'smooth' });
  };

  const getProgress = () => {
    return ((totalTime - timeLeft) / totalTime) * 100;
  };

  // Task Chunking Logic
  const executeChunking = async (taskText: string) => {
    if (!taskText.trim()) return;
    setLoading(true);
    try {
      const steps = await getTaskBreakdown(taskText);
      setSubTasks(steps);
    } catch (e) {
      alert("Could not break down task. Try a shorter description.");
    } finally {
      setLoading(false);
    }
  };

  const handleChunking = () => executeChunking(bigTask);

  const handleTryExample = () => {
    const example = "Clean my messy bedroom";
    setBigTask(example);
    executeChunking(example);
  };

  const toggleTask = (id: string) => {
    setSubTasks(prev => prev.filter(t => t.id !== id));
  };

  const addTaskManually = () => {
    if (!bigTask.trim()) return;
    const newTask: TaskStep = {
      id: Date.now().toString(),
      text: bigTask,
      durationMin: 15
    };
    setSubTasks([...subTasks, newTask]);
    setBigTask('');
  };

  // Styles based on mode
  const getThemeColor = () => {
     if (mode === 'break') return 'text-green-500';
     if (mode === 'dash') return 'text-orange-500';
     return 'text-blue-500';
  };

  const getBgGradient = () => {
    if (settings.isHighContrast) return 'bg-black border-b border-yellow-400';
    return 'bg-slate-900';
  };

  return (
    <div className={`min-h-screen flex flex-col ${settings.isHighContrast ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'}`}>
       
       {/* --- Parallax Hero Header --- */}
       <div className={`relative min-h-[70vh] flex items-center justify-center overflow-hidden parallax-section ${getBgGradient()}`}>
         {!settings.isHighContrast && (
           <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1499750310159-5b600aaf0327?q=80&w=2069&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
             <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-indigo-900/30"></div>
             {/* Dynamic Ambient Light based on timer mode */}
             <div className={`absolute top-1/4 right-1/4 w-96 h-96 rounded-full blur-[120px] animate-pulse transition-colors duration-1000 ${mode === 'break' ? 'bg-green-500/20' : mode === 'dash' ? 'bg-orange-500/20' : 'bg-blue-500/20'}`}></div>
           </div>
         )}
         
         <div className="relative z-10 max-w-4xl mx-auto px-6 w-full text-center pt-20 pb-20">
            <div className={`inline-flex items-center space-x-2 backdrop-blur-md border rounded-full px-5 py-2.5 mb-8 shadow-lg transition-colors duration-500 ${mode === 'break' ? 'bg-green-500/10 border-green-400/20 text-green-200' : mode === 'dash' ? 'bg-orange-500/10 border-orange-400/20 text-orange-200' : 'bg-blue-500/10 border-blue-400/20 text-blue-200'}`}>
               <TimerIcon size={18} className="currentColor" />
               <span className="text-sm font-bold uppercase tracking-widest">Focus Zone</span>
            </div>
            
            <h1 className="text-5xl md:text-8xl font-bold mb-6 leading-tight text-white tracking-tight">
               Master Your <br/>
               <span className={`text-transparent bg-clip-text bg-gradient-to-r transition-all duration-1000 ${mode === 'break' ? 'from-green-400 to-emerald-200' : mode === 'dash' ? 'from-orange-400 to-amber-200' : 'from-blue-400 to-cyan-200'}`}>Attention Span.</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-12">
               Stop fighting your brain. Use our smart timer and AI task splitter to enter the flow state instantly.
            </p>
            
            <button onClick={scrollDown} className="animate-bounce p-3 bg-white/10 rounded-full text-white hover:bg-white/20 transition-colors border border-white/10">
              <ChevronDown size={32} />
            </button>
         </div>
       </div>

      {/* --- Main Workspace --- */}
      <div id="focus-workspace" className={`relative z-20 -mt-10 rounded-t-[3rem] pt-16 pb-24 ${settings.isHighContrast ? 'bg-black border-t-2 border-yellow-400' : 'bg-slate-50'}`}>
        <div className="max-w-6xl mx-auto px-6 grid lg:grid-cols-2 gap-8 items-start">
          
          {/* --- Left Column: The Timer --- */}
          <div className={`rounded-3xl p-8 shadow-xl relative overflow-hidden transition-all duration-500 ${settings.isHighContrast ? 'bg-slate-900 border-2 border-yellow-400' : 'bg-white border border-slate-100'}`}>
            <div className="relative z-10 flex flex-col items-center">
                {/* Mode Switcher */}
                <div className="flex flex-wrap justify-center gap-2 mb-12 bg-slate-100/50 p-1.5 rounded-2xl w-full">
                  <button 
                    onClick={() => switchMode('focus')}
                    className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all ${mode === 'focus' ? 'bg-white shadow-md text-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Focus (25m)
                  </button>
                  <button 
                    onClick={() => switchMode('break')}
                    className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all ${mode === 'break' ? 'bg-white shadow-md text-green-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    Break (5m)
                  </button>
                  <button 
                    onClick={() => switchMode('dash')}
                    className={`flex-1 px-4 py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center ${mode === 'dash' ? 'bg-white shadow-md text-orange-600' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <Zap size={16} className="mr-1" /> Dash
                  </button>
                </div>

                {/* Timer Display */}
                <div className="relative mb-12 transform scale-100 md:scale-110">
                  {/* Progress Ring SVG */}
                  <svg className="w-72 h-72 md:w-80 md:h-80 transform -rotate-90">
                      <circle
                        cx="50%" cy="50%" r="45%"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        className="text-slate-100"
                      />
                      <circle
                        cx="50%" cy="50%" r="45%"
                        stroke="currentColor"
                        strokeWidth="8"
                        fill="transparent"
                        strokeDasharray="283%" // Approximate circumference for 45% radius
                        strokeDashoffset={`${283 * (1 - getProgress() / 100)}%`} // Simple approximation, styled via CSS usually better for exact calc
                        pathLength={100}
                        strokeLinecap="round"
                        className={`transition-all duration-1000 ${mode === 'focus' ? 'text-blue-500' : mode === 'break' ? 'text-green-500' : 'text-orange-500'}`}
                        style={{ strokeDasharray: 100, strokeDashoffset: 100 - getProgress() }}
                      />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className={`text-7xl md:text-8xl font-bold font-mono tracking-tighter ${settings.isHighContrast ? 'text-yellow-400' : 'text-slate-800'}`}>
                        {formatTime(timeLeft)}
                      </span>
                      <span className="text-slate-400 font-medium uppercase tracking-widest mt-2">
                        {isActive ? 'Running' : 'Paused'}
                      </span>
                  </div>
                </div>

                {/* Controls */}
                <div className="flex gap-6 w-full max-w-sm">
                  <button 
                    onClick={toggleTimer}
                    className={`flex-1 py-4 rounded-2xl font-bold text-xl flex items-center justify-center transition-all shadow-lg active:scale-95 ${
                      isActive 
                        ? 'bg-slate-100 text-slate-800 hover:bg-slate-200' 
                        : (mode === 'focus' ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-blue-500/30' : mode === 'break' ? 'bg-green-600 text-white hover:bg-green-700 shadow-green-500/30' : 'bg-orange-500 text-white hover:bg-orange-600 shadow-orange-500/30')
                    }`}
                  >
                    {isActive ? <><Pause className="mr-2" /> Pause</> : <><Play className="mr-2" /> Start</>}
                  </button>
                  <button 
                    onClick={resetTimer}
                    className="px-6 rounded-2xl bg-slate-50 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors"
                  >
                    <RotateCcw size={24} />
                  </button>
                </div>
            </div>
          </div>

          {/* --- Right Column: Task Chunking --- */}
          <div className="space-y-6">
            <div className={`rounded-3xl p-8 shadow-xl border relative overflow-hidden ${settings.isHighContrast ? 'bg-slate-900 border-yellow-400' : 'bg-white border-slate-100'}`}>
                {/* Decoration */}
                {!settings.isHighContrast && (
                  <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
                )}
                
                <div className="relative z-10">
                  <div className="flex items-center space-x-4 mb-6">
                    <div className={`p-4 rounded-2xl shadow-sm ${settings.isHighContrast ? 'bg-yellow-400 text-black' : 'bg-gradient-to-br from-purple-100 to-fuchsia-50 text-purple-600'}`}>
                        <ListTodo size={28} />
                    </div>
                    <div>
                        <h2 className={`text-2xl font-bold ${settings.isHighContrast ? 'text-yellow-400' : 'text-slate-900'}`}>Magic To-Do</h2>
                        <p className="text-sm opacity-60">Overwhelmed? Let AI break it down.</p>
                    </div>
                  </div>

                  <div className="mb-2">
                    <div className={`flex gap-3 p-1.5 rounded-2xl border transition-all ${settings.isHighContrast ? 'border-yellow-400 bg-black' : 'border-gray-200 bg-white focus-within:ring-4 focus-within:ring-purple-100 focus-within:border-purple-300'}`}>
                      <input 
                        type="text" 
                        placeholder="e.g. Write a 5-page history paper"
                        className={`flex-grow p-3 rounded-xl bg-transparent focus:outline-none text-lg ${settings.isHighContrast ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400'}`}
                        value={bigTask}
                        onChange={(e) => setBigTask(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && addTaskManually()}
                      />
                      <button 
                        onClick={handleChunking}
                        disabled={loading || !bigTask}
                        className={`px-6 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center ${settings.isHighContrast ? 'bg-yellow-400 text-black' : 'bg-purple-600 text-white hover:bg-purple-700 shadow-md shadow-purple-500/20'}`}
                        title="Use AI to break this down"
                      >
                        {loading ? <Loader2 className="animate-spin" /> : <Wand2 size={20} />}
                      </button>
                    </div>
                  </div>

                  {/* --- CLICKABLE EXAMPLE --- */}
                  <div className="mb-8 flex justify-end">
                    <button 
                      onClick={handleTryExample}
                      disabled={loading}
                      className="text-xs font-bold text-purple-500 hover:text-purple-700 hover:underline flex items-center transition-colors"
                    >
                      <Sparkles size={12} className="mr-1" /> Try Example: "Clean my messy bedroom"
                    </button>
                  </div>

                  {subTasks.length === 0 ? (
                    <div className={`text-center py-16 border-2 border-dashed rounded-2xl transition-colors ${settings.isHighContrast ? 'border-slate-700 bg-slate-900' : 'border-slate-100 bg-slate-50/50'}`}>
                      <Target className={`mx-auto mb-4 ${settings.isHighContrast ? 'text-slate-600' : 'text-slate-300'}`} size={48} />
                      <p className={`font-medium ${settings.isHighContrast ? 'text-slate-500' : 'text-slate-400'}`}>Add a big, scary task above.<br/>We'll make it simple.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {subTasks.map((step, idx) => (
                          <div key={step.id} className={`group flex items-start p-4 rounded-2xl border transition-all animate-fade-in-up cursor-pointer hover:scale-[1.02] ${settings.isHighContrast ? 'bg-slate-800 border-slate-700 hover:border-yellow-400' : 'bg-white border-slate-100 hover:border-purple-200 hover:shadow-lg hover:shadow-purple-500/5'}`} style={{ animationDelay: `${idx * 0.1}s` }} onClick={() => toggleTask(step.id)}>
                            <button 
                              className={`mt-1 flex-shrink-0 mr-4 transition-colors transform group-hover:scale-110 ${settings.isHighContrast ? 'text-slate-400 group-hover:text-yellow-400' : 'text-slate-300 group-hover:text-green-500'}`}
                            >
                              <Circle size={24} />
                            </button>
                            <div className="flex-grow">
                                <p className={`font-medium text-lg leading-snug ${settings.isHighContrast ? 'text-white' : 'text-slate-800 group-hover:text-purple-700 transition-colors'}`}>{step.text}</p>
                                <div className="flex items-center mt-2 text-xs font-bold uppercase tracking-wider opacity-60">
                                  <div className={`flex items-center px-2 py-0.5 rounded-full ${settings.isHighContrast ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                    <TimerIcon size={12} className="mr-1" /> {step.durationMin} min
                                  </div>
                                </div>
                            </div>
                            <button 
                              className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-400 transition-opacity"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                      ))}
                      
                      <div className="pt-4 flex justify-between items-center text-sm font-medium text-slate-400 border-t border-slate-100 mt-6">
                          <span>{subTasks.length} steps remaining</span>
                          <button onClick={() => setSubTasks([])} className="hover:text-red-500 transition-colors flex items-center"><Trash2 size={14} className="mr-1"/> Clear all</button>
                      </div>
                    </div>
                  )}
                </div>
            </div>
            
            {/* Zen Mode Tip */}
            <div className={`rounded-3xl p-6 flex items-center space-x-4 opacity-90 shadow-sm ${settings.isHighContrast ? 'bg-slate-800 text-yellow-400 border border-yellow-400' : 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-900 border border-blue-100'}`}>
                <div className={`p-3 rounded-full ${settings.isHighContrast ? 'bg-black' : 'bg-white/60 text-blue-600'}`}><Coffee size={24} /></div>
                <p className="text-sm font-medium leading-relaxed"><strong>Pro Tip:</strong> Can't get started? Try the <span className="text-orange-500 font-bold">5-Minute Dash</span> on the timer. You can do anything for just 5 minutes!</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};