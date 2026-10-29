import { describe, it, expect } from 'vitest';
import { toPublicCase } from '../src/services/case.service.js';

// Helper to recursively collect all object keys in a nested structure
function getAllKeys(obj) {
  let keys = [];
  if (!obj || typeof obj !== 'object') return keys;

  if (Array.isArray(obj)) {
    for (const item of obj) {
      keys = keys.concat(getAllKeys(item));
    }
  } else {
    for (const [key, value] of Object.entries(obj)) {
      keys.push(key);
      keys = keys.concat(getAllKeys(value));
    }
  }
  return keys;
}

const mockCompleteCaseDoc = {
  publicId: 'case_test_123456',
  premise: 'A jewel theft in a Venetian palazzo during carnival.',
  difficulty: 'medium',
  status: 'active',
  title: 'Death at the Masquerade',
  story: 'A priceless sapphire vanished from the locked ballroom...',
  suspects: [
    { id: 's1', name: 'Count Orsini', role: 'Host', description: 'Noble host', alibi: 'At the salon' },
    { id: 's2', name: 'Elena Vance', role: 'Appraiser', description: 'Expert', alibi: 'In the garden' },
    { id: 's3', name: 'Marco Bellini', role: 'Rival', description: 'Competitor', alibi: 'Docked late' },
    { id: 's4', name: 'Lucia Fiore', role: 'Maid', description: 'Attendant', alibi: 'In the pantry' }
  ],
  clues: [
    {
      id: 'c1',
      title: 'Glass Shard',
      location: 'Balcony',
      text: 'A sharp shard stained with red wine.',
      pointsTo: ['s2'],
      isKey: true,
      significance: 'Matches Elena dress'
    },
    {
      id: 'c2',
      title: 'Velvet Ribbon',
      location: 'Hallway',
      text: 'A torn black velvet ribbon.',
      pointsTo: ['s1'],
      isKey: false,
      significance: 'Points to Count'
    },
    {
      id: 'c3',
      title: 'Scent of Almond',
      location: 'Pedestal',
      text: 'Rare almond perfume oil.',
      pointsTo: ['s2'],
      isKey: true,
      significance: 'Elena signature fragrance'
    }
  ],
  hints: [
    { id: 'h1', level: 1, text: 'Look closer at the perfumes mentioned in the ballroom.' },
    { id: 'h2', level: 2, text: 'The glass was broken from the outside, not inside.' },
    { id: 'h3', level: 3, text: 'The appraiser had specialized diamond cutting tools.' }
  ],
  solution: {
    culpritId: 's2',
    motive: 'Revenge and greed.',
    method: 'Used diamond cutter on balcony glass.',
    opportunity: 'Left garden during toast.',
    explanation: 'Elena Vance executed the theft using professional equipment.',
    keyClueIds: ['c1', 'c3']
  },
  progress: {
    discoveredClueIds: ['c1'], // Only c1 is discovered; c2 and c3 are hidden!
    hintsUsed: 1,
    revealedHintIds: ['h1'] // Only h1 is revealed; h2 and h3 are secret!
  }
};

describe('Solution Secrecy Protocol (§5.3 & M9)', () => {
  const FORBIDDEN_SERVER_KEYS = [
    'solution',
    'culpritId',
    'motive',
    'method',
    'opportunity',
    'explanation',
    'isCulprit',
    'pointsTo',
    'isKey',
    'significance'
  ];

  it('toPublicCase never exposes any forbidden solution keys', () => {
    const publicCase = toPublicCase(mockCompleteCaseDoc);
    const keys = getAllKeys(publicCase);

    for (const forbidden of FORBIDDEN_SERVER_KEYS) {
      expect(
        keys.includes(forbidden),
        `CRITICAL LEAK: Forbidden key '${forbidden}' found in public case response!`
      ).toBe(false);
    }
  });

  it('undiscovered clues do not have a text property', () => {
    const publicCase = toPublicCase(mockCompleteCaseDoc);

    const c1 = publicCase.clues.find((c) => c.id === 'c1');
    const c2 = publicCase.clues.find((c) => c.id === 'c2');
    const c3 = publicCase.clues.find((c) => c.id === 'c3');

    // c1 is discovered -> has text
    expect(c1.discovered).toBe(true);
    expect(c1.text).toBe('A sharp shard stained with red wine.');

    // c2 and c3 are NOT discovered -> text must be undefined
    expect(c2.discovered).toBe(false);
    expect(c2.text).toBeUndefined();
    expect('text' in c2).toBe(false);

    expect(c3.discovered).toBe(false);
    expect(c3.text).toBeUndefined();
    expect('text' in c3).toBe(false);
  });

  it('unrevealed hints do not expose their text', () => {
    const publicCase = toPublicCase(mockCompleteCaseDoc);

    // Only h1 was revealed
    expect(publicCase.hints.total).toBe(3);
    expect(publicCase.hints.used).toBe(1);
    expect(publicCase.hints.revealed.length).toBe(1);
    expect(publicCase.hints.revealed[0].id).toBe('h1');
    expect(publicCase.hints.revealed[0].text).toBe(
      'Look closer at the perfumes mentioned in the ballroom.'
    );

    // h2 and h3 must not exist anywhere in publicCase
    const jsonString = JSON.stringify(publicCase);
    expect(jsonString.includes('The glass was broken from the outside')).toBe(false);
    expect(jsonString.includes('The appraiser had specialized diamond cutting tools')).toBe(false);
  });

  it('culprit identity is never labeled on suspects', () => {
    const publicCase = toPublicCase(mockCompleteCaseDoc);

    for (const suspect of publicCase.suspects) {
      expect(suspect).not.toHaveProperty('isCulprit');
      expect(suspect).not.toHaveProperty('guilty');
    }
  });

  it('fails if a developer accidentally introduces a forbidden field', () => {
    const leakyCase = {
      ...mockCompleteCaseDoc,
      solution: { culpritId: 's2' }
    };
    // Direct raw object without DTO mapping leaks solution
    const keys = getAllKeys(leakyCase);
    expect(keys.includes('solution')).toBe(true);
  });
});
