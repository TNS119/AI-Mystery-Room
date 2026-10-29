import { describe, it, expect } from 'vitest';
import {
  calculateScorePreview,
  calculateFinalScore,
  DIFFICULTY_CONFIG
} from '../src/services/scoring.service.js';

describe('Scoring Service (§11)', () => {
  describe('calculateScorePreview', () => {
    it('returns 0 when no clues and no hints used', () => {
      expect(calculateScorePreview(0, 0)).toBe(0);
    });

    it('awards 5 points per discovered clue', () => {
      expect(calculateScorePreview(3, 0)).toBe(15);
      expect(calculateScorePreview(5, 0)).toBe(25);
    });

    it('deducts 10 points per hint', () => {
      expect(calculateScorePreview(4, 1)).toBe(10); // 20 - 10 = 10
    });

    it('floors score preview at 0 (never negative)', () => {
      expect(calculateScorePreview(1, 2)).toBe(0); // 5 - 20 = -15 -> 0
      expect(calculateScorePreview(0, 3)).toBe(0); // 0 - 30 = -30 -> 0
    });
  });

  describe('calculateFinalScore - Correct Accusations', () => {
    it('calculates perfect score for Easy difficulty (max 125)', () => {
      const score = calculateFinalScore({
        difficulty: 'easy',
        isCorrect: true,
        cluesDiscoveredCount: 5,
        cluesTotal: 5,
        hintsUsedCount: 0
      });

      expect(score).toEqual({
        base: 100,
        cluesBonus: 25,
        hintsPenalty: 0,
        total: 125,
        max: 125
      });
    });

    it('calculates perfect score for Medium difficulty (max 185)', () => {
      const score = calculateFinalScore({
        difficulty: 'medium',
        isCorrect: true,
        cluesDiscoveredCount: 7,
        cluesTotal: 7,
        hintsUsedCount: 0
      });

      expect(score).toEqual({
        base: 150,
        cluesBonus: 35,
        hintsPenalty: 0,
        total: 185,
        max: 185
      });
    });

    it('calculates perfect score for Hard difficulty (max 245)', () => {
      const score = calculateFinalScore({
        difficulty: 'hard',
        isCorrect: true,
        cluesDiscoveredCount: 9,
        cluesTotal: 9,
        hintsUsedCount: 0
      });

      expect(score).toEqual({
        base: 200,
        cluesBonus: 45,
        hintsPenalty: 0,
        total: 245,
        max: 245
      });
    });

    it('correctly applies hint penalties on a correct verdict', () => {
      const score = calculateFinalScore({
        difficulty: 'medium',
        isCorrect: true,
        cluesDiscoveredCount: 4,
        cluesTotal: 7,
        hintsUsedCount: 2
      });

      // 150 base + (4*5 = 20) clues - (2*10 = 20) hints = 150
      expect(score.base).toBe(150);
      expect(score.cluesBonus).toBe(20);
      expect(score.hintsPenalty).toBe(20);
      expect(score.total).toBe(150);
      expect(score.max).toBe(185);
    });
  });

  describe('calculateFinalScore - Incorrect Accusations', () => {
    it('awards 0 base points for an incorrect accusation', () => {
      const score = calculateFinalScore({
        difficulty: 'easy',
        isCorrect: false,
        cluesDiscoveredCount: 3,
        cluesTotal: 5,
        hintsUsedCount: 0
      });

      expect(score.base).toBe(0);
      expect(score.cluesBonus).toBe(15);
      expect(score.hintsPenalty).toBe(0);
      expect(score.total).toBe(15);
    });

    it('floors incorrect accusation score at 0 when penalties exceed clues bonus', () => {
      const score = calculateFinalScore({
        difficulty: 'hard',
        isCorrect: false,
        cluesDiscoveredCount: 1,
        cluesTotal: 9,
        hintsUsedCount: 3
      });

      // 0 base + 5 clues - 30 hints = -25 -> floored at 0
      expect(score.base).toBe(0);
      expect(score.cluesBonus).toBe(5);
      expect(score.hintsPenalty).toBe(30);
      expect(score.total).toBe(0);
    });
  });
});
