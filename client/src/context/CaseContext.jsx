import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { apiService } from '../api/client';

const CaseContext = createContext(null);

const STORAGE_KEY = 'amr:activeCaseId';

export const CaseProvider = ({ children }) => {
  const [currentCase, setCurrentCase] = useState(null);
  const [activeCaseId, setActiveCaseId] = useState(() => localStorage.getItem(STORAGE_KEY) || null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Sync activeCaseId to localStorage
  useEffect(() => {
    if (activeCaseId) {
      localStorage.setItem(STORAGE_KEY, activeCaseId);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [activeCaseId]);

  // Load active case from server if we have an ID
  const fetchCase = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await apiService.getCase(id);
      setCurrentCase(res.data);
      if (res.data.status === 'completed') {
        // Clear active ID if completed so home page doesn't show resume
        setActiveCaseId(null);
      } else {
        setActiveCaseId(res.data.id);
      }
      return res.data;
    } catch (err) {
      setError(err);
      if (err.code === 'CASE_NOT_FOUND') {
        setActiveCaseId(null);
      }
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Clue discovery action
  const discoverClue = useCallback(async (clueId) => {
    if (!currentCase) return;
    try {
      const res = await apiService.discoverClue(currentCase.id, clueId);
      const updatedClue = res.data.clue;
      
      setCurrentCase((prev) => {
        if (!prev) return prev;
        const newClues = prev.clues.map((c) => (c.id === clueId ? updatedClue : c));
        return {
          ...prev,
          clues: newClues,
          progress: res.data.progress,
          scorePreview: res.data.scorePreview
        };
      });
      return res.data;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [currentCase]);

  // Request hint action
  const requestHint = useCallback(async () => {
    if (!currentCase) return;
    try {
      const res = await apiService.requestHint(currentCase.id);
      const newHint = res.data.hint;
      
      setCurrentCase((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          hints: {
            ...prev.hints,
            used: res.data.hints.used,
            revealed: [...(prev.hints.revealed || []), newHint]
          },
          scorePreview: res.data.scorePreview
        };
      });
      return res.data;
    } catch (err) {
      setError(err);
      throw err;
    }
  }, [currentCase]);

  // Clear case state
  const clearCase = useCallback(() => {
    setCurrentCase(null);
    setActiveCaseId(null);
    setError(null);
  }, []);

  return (
    <CaseContext.Provider
      value={{
        currentCase,
        setCurrentCase,
        activeCaseId,
        setActiveCaseId,
        loading,
        setLoading,
        error,
        setError,
        fetchCase,
        discoverClue,
        requestHint,
        clearCase
      }}
    >
      {children}
    </CaseContext.Provider>
  );
};

export const useCase = () => {
  const context = useContext(CaseContext);
  if (!context) {
    throw new Error('useCase must be used within a CaseProvider');
  }
  return context;
};
