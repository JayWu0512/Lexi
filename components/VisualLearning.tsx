
import React, { useState, useContext, useEffect, useRef } from 'react';
import { AccessibilityContext } from './Shared';
import { getVisualBreakdown, VisualStructure, MindMapNode } from '../services/ai';
import { 
  Network, 
  ListOrdered, 
  Sparkles, 
  Loader2, 
  Brain, 
  Layout, 
  ChevronDown,
  ChevronRight,
  Image as ImageIcon,
  Youtube,
  Search,
  X,
  ExternalLink,
  Lightbulb,
  MousePointerClick
} from 'lucide-react';

// --- Types ---
interface NodeModalProps {
  node: { label: string; short_explanation: string; search_term: string };
  isOpen: boolean;
  onClose: () => void;
  colorClass: string;
}

// --- Interactive Modal Component ---
const NodeDetailModal: React.FC<NodeModalProps> = ({ node, isOpen, onClose, colorClass }) => {
  if (!isOpen) return null;

  const safeSearchUrl = `https://www.google.com/search?tbm=isch&q=${encodeURIComponent(node.search_term + ' for kids educational')}&safe=active`;
  const videoSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(node.search_term + ' educational video for students')}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fade-in-up">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-md relative z-10 overflow-hidden transform transition-all scale-100">
        
        {/* Header */}
        <div className={`${colorClass} p-6 text-white relative`}>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
          <div className="flex items-center space-x-2 mb-2 opacity-90">
            <Lightbulb size={18} />
            <span className="text-xs font-bold uppercase tracking-widest">Quick Look</span>
          </div>
          <h3 className="text-2xl font-bold leading-tight">{node.label}</h3>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-lg text-gray-700 leading-relaxed mb-8">
            {node.short_explanation || "Click the buttons below to see examples!"}
          </p>

          <div className="grid grid-cols-2 gap-4">
            <a 
              href={safeSearchUrl} 
              target="_blank" 
              rel="noreferrer"
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 border-2 border-transparent hover:border-blue-200 transition-all group"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform text-blue-500">
                <ImageIcon size={24} />
              </div>
              <span className="font-bold text-sm">See Pictures</span>
            </a>

            <a 
              href={videoSearchUrl} 
              target="_blank" 
              rel="noreferrer"
              className="flex flex-col items-center justify-center p-4 rounded-xl bg-red-50 text-red-700 hover:bg-red-100 border-2 border-transparent hover:border-red-200 transition-all group"
            >
              <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm mb-3 group-hover:scale-110 transition-transform text-red-500">
                <Youtube size={24} />
              </div>
              <span className="font-bold text-sm">Watch Video</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

// --- Recursive Mind Map Node ---
const MindMapNodeComponent: React.FC<{ 
  data: MindMapNode; 
  depth: number;
  onNodeClick: (node: MindMapNode) => void;
}> = ({ data, depth, onNodeClick }) => {
  const { settings } = useContext(AccessibilityContext);
  const [isExpanded, setIsExpanded] = useState(true);

  // Styles based on depth
  const getStyles = (d: number) => {
    if (settings.isHighContrast) {
        return { 
          card: 'bg-black border-2 border-yellow-400 text-yellow-400 hover:bg-yellow-900', 
          line: 'bg-yellow-400' 
        };
    }
    const levels = [
      { card: 'bg-blue-600 text-white border-blue-600 shadow-blue-200', line: 'bg-blue-300' }, // Root
      { card: 'bg-white text-slate-800 border-blue-200 hover:border-blue-400 shadow-sm', line: 'bg-blue-200' }, // Level 1
      { card: 'bg-white text-slate-600 border-slate-200 hover:border-purple-300 shadow-sm', line: 'bg-slate-200' }, // Level 2
      { card: 'bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-400', line: 'bg-slate-200' } // Level 3
    ];
    return levels[Math.min(d, levels.length - 1)];
  };

  const style = getStyles(depth);
  const hasChildren = data.children && data.children.length > 0;

  return (
    <div className="flex flex-col items-center flex-shrink-0 mx-2 relative">
      {/* Node Card */}
      <div 
        className={`
          relative z-10 px-6 py-3 rounded-full border shadow-md transition-all duration-300 cursor-pointer hover:scale-105 active:scale-95 group
          ${style.card}
          ${depth === 0 ? 'text-xl font-bold px-8 py-4 uppercase tracking-widest' : 'text-sm font-medium'}
        `}
        onClick={(e) => {
          e.stopPropagation();
          onNodeClick(data);
        }}
      >
        <div className="flex items-center space-x-2">
          <span>{data.label}</span>
          <MousePointerClick size={14} className={`opacity-0 group-hover:opacity-100 transition-opacity ${depth === 0 ? 'text-white' : 'text-blue-400'}`} />
        </div>

        {/* Expand/Collapse Toggle for visual clarity if needed */}
        {hasChildren && (
          <button 
            onClick={(e) => { e.stopPropagation(); setIsExpanded(!isExpanded); }}
            className="absolute -bottom-3 left-1/2 transform -translate-x-1/2 w-6 h-6 rounded-full bg-white border border-gray-200 text-gray-500 flex items-center justify-center hover:bg-gray-100 shadow-sm z-20"
          >
            {isExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
          </button>
        )}
      </div>

      {/* Recursive Children Rendering */}
      {isExpanded && hasChildren && (
        <div className="flex flex-col items-center mt-8">
           {/* Vertical Line from Parent */}
           <div className={`w-0.5 h-8 -mt-8 mb-0 ${style.line}`}></div>
           
           {/* Horizontal Bar connecting children */}
           {/* Only render horizontal bar if > 1 child */}
           {data.children!.length > 1 && (
             <div className={`h-0.5 w-[calc(100%-2rem)] mb-4 ${style.line}`}></div>
           )}
           {/* Single child connector adjustment */}
           {data.children!.length === 1 && (
             <div className={`w-0.5 h-4 mb-0 ${style.line}`}></div>
           )}

           <div className="flex justify-center items-start gap-4 md:gap-8">
             {data.children!.map((child, idx) => (
               <div key={idx} className="flex flex-col items-center relative">
                 {/* Top Connector for child (if multiple siblings) */}
                 {data.children!.length > 1 && (
                    <div className={`absolute -top-4 w-0.5 h-4 ${style.line}`}></div>
                 )}
                 <MindMapNodeComponent data={child} depth={depth + 1} onNodeClick={onNodeClick} />
               </div>
             ))}
           </div>
        </div>
      )}
    </div>
  );
};

// --- Step Flow Component ---
const StepCard: React.FC<{ 
  step: { title: string; description: string; search_term: string }; 
  index: number;
  onStepClick: () => void;
}> = ({ step, index, onStepClick }) => {
  const { settings } = useContext(AccessibilityContext);

  return (
    <div 
      onClick={onStepClick}
      className="flex md:flex-row flex-col items-start gap-6 mb-8 relative animate-fade-in-up group cursor-pointer" 
      style={{ animationDelay: `${index * 0.1}s` }}
    >
       {/* Number Circle */}
       <div className={`
         flex-shrink-0 w-14 h-14 rounded-2xl flex items-center justify-center text-xl font-bold shadow-lg z-10 transition-transform group-hover:scale-110 group-hover:rotate-3
         ${settings.isHighContrast ? 'bg-yellow-400 text-black border-2 border-white' : 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white'}
       `}>
         {index + 1}
       </div>

       {/* Connector Line (Desktop) */}
       <div className={`absolute top-14 left-7 w-0.5 h-[calc(100%+2rem)] -ml-[1px] -z-0 hidden md:block last:hidden ${settings.isHighContrast ? 'bg-yellow-400/50' : 'bg-blue-100'}`}></div>

       {/* Content Card */}
       <div className={`
         flex-grow p-6 rounded-2xl border transition-all duration-300
         ${settings.isHighContrast 
            ? 'bg-black border-white text-yellow-300 hover:bg-yellow-900' 
            : 'bg-white border-slate-100 text-slate-700 hover:border-blue-300 hover:shadow-lg hover:shadow-blue-500/10'}
       `}>
         <div className="flex justify-between items-start">
            <h4 className={`text-xl font-bold mb-2 ${settings.isHighContrast ? 'text-white' : 'text-slate-900 group-hover:text-blue-600'}`}>{step.title}</h4>
            <ExternalLink size={16} className="text-slate-300 group-hover:text-blue-400" />
         </div>
         <p className="leading-relaxed opacity-90">{step.description}</p>
         <div className="mt-4 flex items-center text-xs font-bold uppercase tracking-wider text-blue-500 opacity-0 group-hover:opacity-100 transition-opacity">
            Click to explore <ChevronRight size={14} className="ml-1" />
         </div>
       </div>

       {/* Mobile Connector */}
       <div className="md:hidden mx-auto w-0.5 h-8 bg-slate-200"></div>
    </div>
  );
};

export const VisualLearning: React.FC = () => {
  const { settings } = useContext(AccessibilityContext);
  const [inputText, setInputText] = useState('');
  const [viewMode, setViewMode] = useState<'mindmap' | 'flow'>('mindmap');
  const [loading, setLoading] = useState(false);
  const [visualData, setVisualData] = useState<VisualStructure | null>(null);
  
  // Modal State
  const [activeNode, setActiveNode] = useState<{ label: string; short_explanation: string; search_term: string } | null>(null);

  const heroRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to results
  useEffect(() => {
    if (visualData && heroRef.current) {
      window.scrollTo({ top: heroRef.current.clientHeight - 100, behavior: 'smooth' });
    }
  }, [visualData]);

  // Default Preset
  const loadPreset = () => {
    setInputText(`The Life Cycle of a Frog.
    
    1. Egg: Frogs lay many eggs in the water. This cluster is called "frogspawn". The eggs are soft and jelly-like.
    2. Tadpole: A tiny tadpole hatches from the egg. It lives in water, breathes with gills, and has a long tail for swimming. It eats plants.
    3. Froglet: As it grows, the tadpole grows back legs, then front legs. Its tail starts to shrink. It starts developing lungs to breathe air.
    4. Adult Frog: The tail disappears completely. The frog leaves the water and lives on land. It eats insects and uses its strong legs to jump.`);
  };

  const handleVisualize = async () => {
    if (!inputText.trim()) return;
    setLoading(true);
    try {
      const data = await getVisualBreakdown(inputText);
      setVisualData(data);
    } catch (error) {
      console.error(error);
      alert("Oops! We couldn't visualize that text. Try making it shorter or clearer.");
    } finally {
      setLoading(false);
    }
  };

  const getThemeColor = () => settings.isHighContrast ? 'bg-yellow-600' : 'bg-gradient-to-br from-blue-600 to-indigo-600';

  return (
    <div className={`min-h-screen flex flex-col ${settings.isHighContrast ? 'bg-black text-white' : 'bg-slate-50 text-slate-900'}`}>
       
       {/* Parallax Hero Header */}
       <div ref={heroRef} className={`relative min-h-[70vh] flex items-center justify-center overflow-hidden parallax-section ${settings.isHighContrast ? 'bg-black border-b border-yellow-400' : 'bg-slate-900'}`}>
         {!settings.isHighContrast && (
           <div className="absolute inset-0 z-0">
             <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
             <div className="absolute inset-0 bg-gradient-to-b from-slate-900/50 via-slate-900/80 to-slate-900"></div>
             <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-[100px] animate-pulse"></div>
           </div>
         )}
         
         <div className="relative z-10 max-w-4xl mx-auto px-6 w-full text-center pt-20 pb-32">
            <div className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md border border-white/20 text-blue-200 rounded-full px-5 py-2.5 mb-8 shadow-lg">
               <Layout size={18} className="text-blue-400" />
               <span className="text-sm font-bold uppercase tracking-widest">Visual Learning Lab</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight text-white tracking-tight">
               Don't just read it.<br/>
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">See it.</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed mb-12">
               Turn confusing text into clear mind maps and step-by-step guides instantly.
            </p>

            {/* Floating Control Panel */}
            <div className={`rounded-3xl p-3 shadow-2xl backdrop-blur-xl border transform transition-all hover:scale-[1.01] ${settings.isHighContrast ? 'bg-black border-yellow-400' : 'bg-white/10 border-white/20'}`}>
               <div className={`rounded-2xl p-6 ${settings.isHighContrast ? 'bg-slate-900' : 'bg-white'}`}>
                  <textarea 
                    className={`w-full h-32 p-4 rounded-xl bg-transparent resize-none focus:outline-none text-lg leading-relaxed ${settings.isHighContrast ? 'text-white placeholder-slate-500' : 'text-slate-800 placeholder-slate-400 bg-slate-50 border border-slate-100 focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition-all'}`}
                    placeholder="Paste a story, a process, or a difficult concept here..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                  />
                  <div className="flex flex-col md:flex-row justify-between items-center mt-4 gap-4">
                    <button onClick={loadPreset} className="text-sm font-bold text-blue-500 hover:text-blue-700 hover:underline px-2">
                      Try Example: Frog Life Cycle
                    </button>
                    <button 
                      onClick={handleVisualize}
                      disabled={loading || !inputText}
                      className={`
                        w-full md:w-auto flex items-center justify-center px-10 py-4 rounded-xl font-bold text-lg transition-all shadow-lg active:scale-95
                        ${loading ? 'opacity-70 cursor-wait' : ''}
                        ${settings.isHighContrast 
                          ? 'bg-yellow-400 text-black hover:bg-yellow-300' 
                          : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white hover:shadow-blue-500/30 hover:brightness-110'}
                      `}
                    >
                      {loading ? <><Loader2 className="animate-spin mr-2" /> Building...</> : <><Sparkles className="mr-2" /> Visualize Now</>}
                    </button>
                  </div>
               </div>
            </div>
         </div>
       </div>

       {/* Visualization Canvas */}
       {visualData && (
         <div className={`flex-grow relative z-20 -mt-10 rounded-t-[3rem] ${settings.isHighContrast ? 'bg-black' : 'bg-slate-50'}`}>
            <div className="max-w-7xl mx-auto px-6 py-16">
              
              <div className="flex flex-col items-center mb-12">
                 <h2 className={`text-3xl font-bold mb-8 ${settings.isHighContrast ? 'text-yellow-400' : 'text-slate-900'}`}>
                    Topic: <span className="text-blue-600">{visualData.topic}</span>
                 </h2>

                 {/* View Switcher Pills */}
                 <div className={`p-1.5 rounded-2xl flex space-x-2 shadow-sm ${settings.isHighContrast ? 'bg-slate-800 border border-yellow-400' : 'bg-white border border-slate-200'}`}>
                    <button 
                      onClick={() => setViewMode('mindmap')}
                      className={`flex items-center px-8 py-3 rounded-xl font-bold transition-all duration-300 ${viewMode === 'mindmap' ? (settings.isHighContrast ? 'bg-yellow-400 text-black shadow-lg' : 'bg-slate-900 text-white shadow-lg') : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
                    >
                      <Network size={20} className="mr-2" /> Mind Map
                    </button>
                    <button 
                      onClick={() => setViewMode('flow')}
                      className={`flex items-center px-8 py-3 rounded-xl font-bold transition-all duration-300 ${viewMode === 'flow' ? (settings.isHighContrast ? 'bg-yellow-400 text-black shadow-lg' : 'bg-slate-900 text-white shadow-lg') : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'}`}
                    >
                      <ListOrdered size={20} className="mr-2" /> Step Flow
                    </button>
                 </div>
              </div>

              {/* Mind Map View */}
              {viewMode === 'mindmap' && (
                <div className="animate-fade-in-up">
                   <div className={`w-full overflow-x-auto pb-12 pt-4 px-4 rounded-3xl border border-dashed min-h-[600px] ${settings.isHighContrast ? 'bg-slate-900 border-yellow-400/30' : 'bg-blue-50/50 border-blue-200'}`}>
                      <div className="min-w-full w-fit mx-auto flex justify-center items-center min-h-[550px]">
                          <div className="p-10">
                             <MindMapNodeComponent 
                               data={visualData.mindMap} 
                               depth={0} 
                               onNodeClick={(node) => setActiveNode(node)} 
                             />
                          </div>
                      </div>
                   </div>
                   <p className="text-center mt-4 text-slate-400 text-sm flex items-center justify-center">
                      <MousePointerClick size={14} className="mr-1" /> Click any bubble to see pictures and videos!
                   </p>
                </div>
              )}

              {/* Step Flow View */}
              {viewMode === 'flow' && (
                <div className="max-w-3xl mx-auto animate-fade-in-up pb-20">
                   {visualData.steps.map((step, idx) => (
                     <StepCard 
                       key={idx} 
                       step={step} 
                       index={idx} 
                       onStepClick={() => setActiveNode({ 
                         label: step.title, 
                         short_explanation: step.description, 
                         search_term: step.search_term || step.title 
                       })}
                     />
                   ))}
                   {visualData.steps.length === 0 && (
                     <div className="text-center text-gray-500 py-10 bg-white rounded-xl border border-dashed">No sequential steps found in this text. Try the Mind Map view!</div>
                   )}
                </div>
              )}
            </div>
         </div>
       )}
       
       {!visualData && !loading && (
         <div className="bg-slate-50 flex-grow -mt-10 rounded-t-[3rem] relative z-20"></div>
       )}

       <NodeDetailModal 
         isOpen={!!activeNode} 
         node={activeNode!} 
         onClose={() => setActiveNode(null)} 
         colorClass={getThemeColor()}
       />
    </div>
  );
};
