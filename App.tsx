

import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AccessibilityContext, Navbar, FocusProvider, PageContextProvider } from './components/Shared';
import { AIChatSidebar } from './components/AIChat';
import { HomePage, StudentPortal, ParentPortal, TeacherPortal, AdultPortal, ResourceLibrary } from './components/Views';
import { VisualLearning } from './components/VisualLearning';
import { FocusTools } from './components/FocusTools';
import { MathPlayground } from './components/MathPlayground';
import { AccessibilityState } from './types';

// --- Scroll To Top Utility ---
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

const App: React.FC = () => {
  // Default Accessibility State
  const [settings, setSettings] = useState<AccessibilityState>({
    isDyslexicFont: false,
    isHighContrast: false,
    isFocusMode: false,
    textSize: 'normal',
  });

  // Calculate dynamic classes based on accessibility settings
  const getBodyClasses = () => {
    let classes = "min-h-screen flex flex-col transition-all duration-300 ";
    
    // Font Family
    if (settings.isDyslexicFont) {
      classes += "font-dyslexic ";
    } else {
      classes += "font-sans ";
    }

    // Colors
    if (settings.isHighContrast) {
      classes += "bg-black text-yellow-300 ";
    } else {
      classes += "bg-slate-50 text-slate-900 ";
    }

    // Text Size
    if (settings.textSize === 'large') classes += "text-lg ";
    if (settings.textSize === 'xl') classes += "text-xl ";

    // Focus Mode (Line height & width constraint handled in layout, mostly affects spacing here)
    if (settings.isFocusMode) {
      classes += "tracking-wide leading-loose ";
    }

    return classes;
  };

  return (
    <AccessibilityContext.Provider value={{ settings, setSettings }}>
      <PageContextProvider>
        <FocusProvider>
          <Router>
            <ScrollToTop />
            <div className={getBodyClasses()}>
              <Navbar />
              
              <main className={`flex-grow ${settings.isFocusMode ? 'max-w-4xl mx-auto w-full' : 'w-full'}`}>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/student" element={<StudentPortal />} />
                  <Route path="/parent" element={<ParentPortal />} />
                  <Route path="/teacher" element={<TeacherPortal />} />
                  <Route path="/adult" element={<AdultPortal />} />
                  <Route path="/resources" element={<ResourceLibrary />} />
                  <Route path="/visual" element={<VisualLearning />} />
                  <Route path="/focus" element={<FocusTools />} />
                  <Route path="/math-playground" element={<MathPlayground />} />
                </Routes>
              </main>

              <AIChatSidebar />

              <footer className={`py-8 mt-12 text-center text-sm ${settings.isHighContrast ? 'bg-slate-900 border-t border-yellow-400' : 'bg-white border-t border-gray-200 text-gray-500'}`}>
                <p>
                  &copy; {new Date().getFullYear()} LD Support Hub. 
                  Built with accessibility in mind.
                </p>
                <p className="mt-2 text-xs opacity-70">
                  Disclaimer: This site is for educational purposes only and does not provide medical advice.
                </p>
              </footer>
            </div>
          </Router>
        </FocusProvider>
      </PageContextProvider>
    </AccessibilityContext.Provider>
  );
};

export default App;
