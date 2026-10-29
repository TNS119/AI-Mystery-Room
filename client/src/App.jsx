import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import ErrorBoundary from './components/ErrorBoundary';
import { CaseProvider } from './context/CaseContext';
import Home from './pages/Home';
import CreateMystery from './pages/CreateMystery';
import InvestigationRoom from './pages/InvestigationRoom';
import Accusation from './pages/Accusation';
import Results from './pages/Results';
import NotFound from './pages/NotFound';

function App() {
  return (
    <ErrorBoundary>
      <CaseProvider>
        <div className="w-full min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950 overflow-x-hidden">
          <Navbar />
          <main className="flex-1 w-full flex flex-col p-0 m-0">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/create" element={<CreateMystery />} />
              <Route path="/case/:id" element={<InvestigationRoom />} />
              <Route path="/case/:id/accuse" element={<Accusation />} />
              <Route path="/case/:id/result" element={<Results />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-600">
            AI Mystery Room — Powered by Google Gemini & Strict Procedural Verification
          </footer>
        </div>
      </CaseProvider>
    </ErrorBoundary>
  );
}

export default App;
