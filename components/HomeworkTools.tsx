
import React, { useState, useContext, useRef } from 'react';
import { AccessibilityContext, InteractiveText } from './Shared';
import { analyzeHomeworkImage } from '../services/ai';
import { HomeworkResponse } from '../types';
import { 
  Camera, 
  Upload, 
  Image as ImageIcon, 
  Loader2, 
  CheckCircle2, 
  ArrowRight, 
  RefreshCw, 
  BookOpen, 
  Lightbulb, 
  Calculator,
  Sparkles
} from 'lucide-react';

// Custom SVG to recreate the "Bears & Bees" worksheet visually
const EXAMPLE_SVG = `
<svg width="600" height="800" viewBox="0 0 600 800" xmlns="http://www.w3.org/2000/svg">
  <!-- Yellow Border Background -->
  <rect width="600" height="800" fill="#FACC15"/>
  <!-- White Dots Pattern -->
  <pattern id="dots" x="0" y="0" width="30" height="30" patternUnits="userSpaceOnUse">
    <circle cx="15" cy="15" r="3" fill="white" opacity="0.6"/>
  </pattern>
  <rect width="600" height="800" fill="url(#dots)"/>
  
  <!-- White Paper Area -->
  <rect x="30" y="30" width="540" height="740" rx="10" fill="white"/>
  
  <!-- Header Text -->
  <text x="300" y="90" font-family="Comic Sans MS, sans-serif" font-size="42" text-anchor="middle" font-weight="900" fill="#1F2937">Math Worksheet</text>
  
  <!-- Green Ribbon Title -->
  <path d="M180,110 L420,110 L440,140 L420,170 L180,170 L160,140 Z" fill="#86EFAC"/>
  <text x="300" y="152" font-family="sans-serif" font-size="28" text-anchor="middle" fill="#166534" font-weight="bold">Addition</text>

  <!-- Bees decoration -->
  <g transform="translate(100, 100)">
     <ellipse cx="0" cy="0" rx="20" ry="15" fill="#FCD34D" stroke="black" stroke-width="2"/>
     <line x1="-5" y1="-15" x2="-10" y2="-25" stroke="black" stroke-width="2"/>
     <line x1="5" y1="-15" x2="10" y2="-25" stroke="black" stroke-width="2"/>
     <path d="M-20,0 Q-35,-15 -20,-30 Q0,-15 -20,0" fill="#BFDBFE" opacity="0.8"/>
  </g>
  <g transform="translate(500, 100)">
     <ellipse cx="0" cy="0" rx="20" ry="15" fill="#FCD34D" stroke="black" stroke-width="2"/>
     <path d="M20,0 Q35,-15 20,-30 Q0,-15 20,0" fill="#BFDBFE" opacity="0.8"/>
  </g>

  <!-- Problems Column 1 -->
  <g font-family="monospace" font-size="36" fill="#000" font-weight="bold">
    <text x="70" y="260">2 + 2 = [ ]</text>
    <text x="70" y="330">4 + 3 = [ ]</text>
    <text x="70" y="400">1 + 1 = [ ]</text>
    <text x="70" y="470">9 + 1 = [ ]</text>
    <text x="70" y="540">6 + 3 = [ ]</text>
    <text x="70" y="610">2 + 4 = [ ]</text>
  </g>

  <!-- Problems Column 2 -->
  <g font-family="monospace" font-size="36" fill="#000" font-weight="bold">
    <text x="320" y="260">1 + 8 = [ ]</text>
    <text x="320" y="330">7 + 2 = [ ]</text>
    <text x="320" y="400">2 + 5 = [ ]</text>
    <text x="320" y="470">3 + 0 = [ ]</text>
    <text x="320" y="540">5 + 5 = [ ]</text>
    <text x="320" y="610">0 + 2 = [ ]</text>
  </g>

  <!-- Bear Graphic (Bottom) -->
  <path d="M220,770 Q220,650 300,650 Q380,650 380,770 Z" fill="#92400E"/>
  <circle cx="280" cy="690" r="5" fill="black"/>
  <circle cx="320" cy="690" r="5" fill="black"/>
  <ellipse cx="300" cy="710" rx="15" ry="10" fill="#FEF3C7"/>
  <path d="M295,710 Q300,715 305,710" stroke="black" stroke-width="2" fill="none"/>
  <circle cx="230" cy="660" r="15" fill="#92400E"/>
  <circle cx="370" cy="660" r="15" fill="#92400E"/>
</svg>
`;

const EXAMPLE_IMAGE_URL = `data:image/svg+xml;base64,${btoa(EXAMPLE_SVG)}`;

export const HomeworkTools: React.FC = () => {
  const { settings } = useContext(AccessibilityContext);
  const [activeTab, setActiveTab] = useState<'upload' | 'results'>('upload');
  const [resultTab, setResultTab] = useState<'simple' | 'steps' | 'practice'>('simple');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [data, setData] = useState<HomeworkResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
        processImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleExample = () => {
    setImagePreview(EXAMPLE_IMAGE_URL);
    processImage(EXAMPLE_IMAGE_URL);
  };

  const processImage = async (input: string) => {
    setIsLoading(true);
    setActiveTab('results');
    setData(null);

    // If it's the example URL, use mock data matching the "Bears & Bees" worksheet exactly
    if (input === EXAMPLE_IMAGE_URL) {
      setTimeout(() => {
         setData({
            subject: "Math Worksheet: Addition",
            original_text: "2 + 2 = ?, 1 + 8 = ?, 4 + 3 = ?, 7 + 2 = ?, 6 + 3 = ?, 5 + 5 = ? ...",
            simplified_version: "This worksheet is all about **Addition** (Bears & Bees Theme).\n\nWe need to add the numbers together.\n\n**Example:** Look at the first problem **2 + 2**. Imagine 2 bees, and then 2 more come along. How many bees total?",
            key_concepts: ["Addition", "Sum", "Counting Up"],
            steps: [
                { title: "Row 1: 2 + 2", explanation: "Start with 2. Add 2 more: 3, 4. The answer is 4." },
                { title: "Row 1: 1 + 8", explanation: "Start with the big number (8). Add 1 more. The answer is 9." },
                { title: "Row 2: 4 + 3", explanation: "Start with 4. Count up 3 times: 5, 6, 7. The answer is 7." },
                { title: "Row 5: 6 + 3", explanation: "Start with 6. Count up 3 times: 7, 8, 9. The answer is 9." }
            ],
            practice_problem: {
                question: "Let's try the one with the bear: 5 + 5 = ?",
                hint: "Count all the fingers on both hands!"
            }
         });
         setIsLoading(false);
      }, 1500);
      return;
    }

    // Real API Call for uploaded images
    try {
      const result = await analyzeHomeworkImage(input);
      setData(result);
    } catch (e) {
      console.error(e);
      alert("Failed to analyze image. Please try again.");
    } finally {
      if (input !== EXAMPLE_IMAGE_URL) setIsLoading(false);
    }
  };

  const reset = () => {
    setActiveTab('upload');
    setData(null);
    setImagePreview(null);
  };

  return (
    <div id="homework-converter" className={`py-24 rounded-t-[3rem] -mt-10 relative z-20 ${settings.isHighContrast ? 'bg-black border-t-2 border-yellow-400' : 'bg-white'}`}>
       <div className="max-w-6xl mx-auto px-6">
          
          <div className="text-center mb-16">
             <div className="inline-flex items-center space-x-2 bg-purple-100 text-purple-700 px-4 py-1.5 rounded-full mb-4">
               <Sparkles size={16} />
               <span className="text-xs font-bold uppercase tracking-widest">Gemini Vision Power</span>
             </div>
             <h2 className={`text-3xl md:text-5xl font-bold mb-6 ${settings.isHighContrast ? 'text-yellow-400' : 'text-slate-900'}`}>Homework Transformer</h2>
             <p className={`text-xl max-w-2xl mx-auto ${settings.isHighContrast ? 'text-white' : 'text-slate-500'}`}>
               Snap a photo of your worksheet or textbook. We'll turn it into a clear, step-by-step guide just for you.
             </p>
          </div>

          {activeTab === 'upload' && (
             <div className="max-w-xl mx-auto animate-fade-in-up">
                <div 
                  className={`
                    border-4 border-dashed rounded-3xl p-10 text-center transition-all cursor-pointer group
                    ${settings.isHighContrast 
                       ? 'border-yellow-400 hover:bg-yellow-900/20' 
                       : 'border-slate-200 hover:border-purple-400 hover:bg-purple-50/50'}
                  `}
                  onClick={() => fileInputRef.current?.click()}
                >
                   <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*" 
                      onChange={handleFileUpload} 
                   />
                   <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 transition-transform group-hover:scale-110 ${settings.isHighContrast ? 'bg-yellow-400 text-black' : 'bg-purple-100 text-purple-600'}`}>
                      <Camera size={40} />
                   </div>
                   <h3 className={`text-2xl font-bold mb-2 ${settings.isHighContrast ? 'text-white' : 'text-slate-900'}`}>Upload Homework</h3>
                   <p className="text-slate-500">Click to upload or drag image here</p>
                </div>

                <div className="mt-8 text-center">
                   <p className="text-slate-400 text-sm mb-4 uppercase tracking-widest font-bold">Or try it out</p>
                   <button 
                     onClick={handleExample}
                     className={`
                       px-8 py-3 rounded-xl font-bold transition-all hover:scale-105 flex items-center mx-auto
                       ${settings.isHighContrast 
                         ? 'bg-slate-800 text-yellow-400 border border-yellow-400' 
                         : 'bg-white text-slate-700 border border-slate-200 hover:border-purple-300 shadow-sm'}
                     `}
                   >
                     <ImageIcon size={18} className="mr-2" /> Try Example (Bears & Bees Math)
                   </button>
                </div>
             </div>
          )}

          {activeTab === 'results' && (
             <div className="grid lg:grid-cols-2 gap-12 animate-fade-in-up">
                {/* Left: Input Image */}
                <div className="flex flex-col">
                   <div className="relative rounded-2xl overflow-hidden shadow-lg border border-slate-200 bg-slate-100 aspect-[3/4] md:aspect-auto md:h-[600px]">
                      {imagePreview && (
                        <img src={imagePreview} alt="Homework Preview" className="w-full h-full object-cover" />
                      )}
                      {isLoading && (
                        <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                           <Loader2 size={48} className="animate-spin mb-4 text-purple-400" />
                           <p className="font-bold text-lg animate-pulse">Scanning text & logic...</p>
                        </div>
                      )}
                   </div>
                   <button onClick={reset} className="mt-4 flex items-center justify-center text-slate-500 hover:text-purple-600 font-bold transition-colors">
                      <RefreshCw size={16} className="mr-2" /> Upload Another
                   </button>
                </div>

                {/* Right: Analysis */}
                <div className="flex flex-col h-full">
                   {!isLoading && data && (
                      <div className={`flex-grow rounded-3xl overflow-hidden flex flex-col shadow-xl ${settings.isHighContrast ? 'bg-slate-900 border border-yellow-400' : 'bg-white border border-slate-100'}`}>
                         
                         {/* Header */}
                         <div className={`p-6 border-b flex items-center justify-between ${settings.isHighContrast ? 'bg-yellow-400 text-black' : 'bg-slate-50 border-slate-100'}`}>
                            <div className="flex items-center space-x-3">
                               <div className={`p-2 rounded-lg ${settings.isHighContrast ? 'bg-black text-yellow-400' : 'bg-white text-purple-600 shadow-sm'}`}>
                                  {data.subject.includes('Math') ? <Calculator size={20} /> : <BookOpen size={20} />}
                               </div>
                               <div>
                                  <h3 className="font-bold text-lg leading-none">{data.subject} Helper</h3>
                                  <span className="text-xs opacity-70 font-mono uppercase">AI Enhanced</span>
                               </div>
                            </div>
                         </div>

                         {/* Tabs */}
                         <div className={`flex border-b ${settings.isHighContrast ? 'border-yellow-400/30' : 'border-slate-100'}`}>
                            {[
                               { id: 'simple', label: 'Simple View', icon: BookOpen },
                               { id: 'steps', label: 'Steps', icon: CheckCircle2 },
                               { id: 'practice', label: 'Practice', icon: Lightbulb }
                            ].map(tab => (
                               <button 
                                 key={tab.id}
                                 onClick={() => setResultTab(tab.id as any)}
                                 className={`flex-1 py-4 text-sm font-bold flex items-center justify-center transition-colors border-b-2 ${resultTab === tab.id ? (settings.isHighContrast ? 'border-yellow-400 text-yellow-400 bg-yellow-400/10' : 'border-purple-600 text-purple-700 bg-purple-50') : 'border-transparent text-slate-400 hover:text-slate-600'}`}
                               >
                                  <tab.icon size={16} className="mr-2" />
                                  <span className="hidden sm:inline">{tab.label}</span>
                               </button>
                            ))}
                         </div>

                         {/* Content */}
                         <div className="p-8 flex-grow overflow-y-auto max-h-[500px]">
                            {resultTab === 'simple' && (
                               <div className="space-y-6">
                                  <div>
                                     <h4 className={`text-xs font-bold uppercase tracking-widest mb-3 ${settings.isHighContrast ? 'text-slate-400' : 'text-slate-400'}`}>Simplified Problem</h4>
                                     <div className={`text-lg leading-loose ${settings.isHighContrast ? 'text-white' : 'text-slate-800'}`}>
                                        <InteractiveText content={data.simplified_version} />
                                     </div>
                                  </div>
                                  <div className={`p-4 rounded-xl ${settings.isHighContrast ? 'bg-slate-800' : 'bg-slate-50'}`}>
                                     <h4 className="text-xs font-bold uppercase tracking-widest mb-2 text-slate-400">Key Concepts</h4>
                                     <div className="flex flex-wrap gap-2">
                                        {data.key_concepts.map(k => (
                                           <span key={k} className={`px-3 py-1 rounded-full text-sm font-medium ${settings.isHighContrast ? 'bg-yellow-400 text-black' : 'bg-white border border-slate-200 text-purple-700 shadow-sm'}`}>
                                              {k}
                                           </span>
                                        ))}
                                     </div>
                                  </div>
                               </div>
                            )}

                            {resultTab === 'steps' && data.steps && (
                               <div className="space-y-6">
                                  {data.steps.map((step, idx) => (
                                     <div key={idx} className="flex gap-4">
                                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${settings.isHighContrast ? 'bg-yellow-400 text-black' : 'bg-purple-100 text-purple-600'}`}>
                                           {idx + 1}
                                        </div>
                                        <div>
                                           <h4 className={`font-bold text-lg mb-1 ${settings.isHighContrast ? 'text-white' : 'text-slate-900'}`}>{step.title}</h4>
                                           <p className={`${settings.isHighContrast ? 'text-slate-300' : 'text-slate-600'}`}>{step.explanation}</p>
                                        </div>
                                     </div>
                                  ))}
                               </div>
                            )}

                            {resultTab === 'practice' && data.practice_problem && (
                               <div className="text-center py-4">
                                  <div className={`inline-block p-4 rounded-full mb-4 ${settings.isHighContrast ? 'bg-slate-800 text-yellow-400' : 'bg-purple-50 text-purple-600'}`}>
                                     <Lightbulb size={32} />
                                  </div>
                                  <h3 className={`text-xl font-bold mb-4 ${settings.isHighContrast ? 'text-white' : 'text-slate-900'}`}>Your Turn!</h3>
                                  <div className={`p-6 rounded-2xl text-left mb-6 ${settings.isHighContrast ? 'bg-slate-800' : 'bg-slate-50 border border-slate-100'}`}>
                                     <p className={`text-lg font-medium mb-4 ${settings.isHighContrast ? 'text-white' : 'text-slate-800'}`}>
                                        {data.practice_problem.question}
                                     </p>
                                     <div className={`text-sm p-3 rounded-lg flex items-center ${settings.isHighContrast ? 'bg-black text-yellow-200' : 'bg-yellow-50 text-yellow-800'}`}>
                                        <Sparkles size={14} className="mr-2 flex-shrink-0" />
                                        <span><strong>Hint:</strong> {data.practice_problem.hint}</span>
                                     </div>
                                  </div>
                                  <button className={`px-8 py-3 rounded-full font-bold transition-all hover:scale-105 ${settings.isHighContrast ? 'bg-white text-black' : 'bg-slate-900 text-white shadow-lg'}`}>
                                     I Solved It!
                                  </button>
                                </div>
                            )}
                         </div>
                      </div>
                   )}
                </div>
             </div>
          )}
       </div>
    </div>
  );
};
