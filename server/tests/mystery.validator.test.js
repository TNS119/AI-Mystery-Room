import { describe, it, expect } from 'vitest';
import { validateMystery } from '../src/services/mystery.validator.js';

const createValidEasyMystery = () => ({
  title: 'The Stolen Diamond of Venice',
  story:
    'During the high tide of the Venetian carnival, the famous Blue Regent diamond vanished from the private vault of Count Orsini. The vault lock was picked with precision, and a drop of rare almond perfume was detected on the velvet lining of the display pedestal. Three guests had access to the master wing during the gala.',
  suspects: [
    {
      id: 's1',
      name: 'Matteo Rossi',
      role: 'Head Butler',
      description: 'A loyal servant with deep debts to Venetian loan sharks.',
      alibi: 'Claims he was attending the wine cellar on the ground floor all night.'
    },
    {
      id: 's2',
      name: 'Elena Vance',
      role: 'Jewelry Appraiser',
      description: 'A distinguished guest known for her connoisseurship and rare almond fragrances.',
      alibi: 'Claims she was conversing with guests in the grand salon.'
    },
    {
      id: 's3',
      name: 'Marco Bellini',
      role: 'Rival Collector',
      description: 'A competitive nobleman who openly coveted the Blue Regent.',
      alibi: 'Claims he arrived after midnight accompanied by his entourage.'
    }
  ],
  clues: [
    {
      id: 'c1',
      title: 'Vial of Almond Essence',
      location: 'Private Balcony',
      text: 'A miniature crystal vial smelling distinctly of almond perfume dropped near the balcony drain.',
      pointsTo: ['s2'],
      isKey: true,
      significance: 'Directly matches Elena Vance fragrance.'
    },
    {
      id: 'c2',
      title: 'Bent Lockpick Tool',
      location: 'Vault Corridor',
      text: 'A specialized jeweler lockpick tool stamped with a Parisian silversmith mark.',
      pointsTo: ['s2'],
      isKey: true,
      significance: 'Elena was trained in Paris; tool requires professional jeweler expertise.'
    },
    {
      id: 'c3',
      title: 'Torn Velvet Ribbon',
      location: 'Vault Threshold',
      text: 'A shred of black velvet matching the livery worn by house staff.',
      pointsTo: ['s1'],
      isKey: false,
      significance: 'Points suspicion at Matteo the butler.'
    },
    {
      id: 'c4',
      title: 'Cellar Key Log',
      location: 'Ground Floor',
      text: 'The log verifies Matteo accessed the cellar at 11:30 PM, confirming his alibi.',
      pointsTo: ['s1'],
      isKey: false,
      significance: 'Exonerates Matteo.'
    },
    {
      id: 'c5',
      title: 'Gondola Schedule',
      location: 'Canal Entrance',
      text: 'Marco Bellini gondola docked at 12:15 AM as testified by the canal master.',
      pointsTo: ['s3'],
      isKey: false,
      significance: 'Corroborates Marco alibi.'
    }
  ],
  hints: [
    {
      id: 'h1',
      level: 1,
      text: 'Consider the unique scent detected on the pedestal lining.'
    },
    {
      id: 'h2',
      level: 2,
      text: 'The thief required refined jeweler tools rather than brute force.'
    }
  ],
  solution: {
    culpritId: 's2',
    motive: 'Greed and a desire to possess the rarest gem in Europe.',
    method: 'Used professional lockpicks to open the display case quietly.',
    opportunity: 'Slipped away to the master wing during the midnight fireworks.',
    explanation:
      'Elena Vance dropped her signature almond perfume vial and used her jeweler lockpicks to breach the vault while guests were distracted by fireworks.',
    keyClueIds: ['c1', 'c2']
  }
});

describe('Mystery Validator (§10.4)', () => {
  it('validates a complete, logically sound Easy mystery fixture', () => {
    const validMystery = createValidEasyMystery();
    const result = validateMystery(validMystery, 'easy');

    expect(result.valid).toBe(true);
    expect(result.errors).toBeUndefined();
  });

  it('rejects a mystery with incorrect suspect count for difficulty', () => {
    const invalid = createValidEasyMystery();
    invalid.suspects.pop(); // Only 2 suspects instead of 3

    const result = validateMystery(invalid, 'easy');
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Expected 3 suspects'))).toBe(true);
  });

  it('rejects a mystery with duplicate suspect IDs', () => {
    const invalid = createValidEasyMystery();
    invalid.suspects[1].id = 's1';

    const result = validateMystery(invalid, 'easy');
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Suspect IDs must be unique'))).toBe(true);
  });

  it('rejects a mystery with an unknown culprit ID', () => {
    const invalid = createValidEasyMystery();
    invalid.solution.culpritId = 's99';

    const result = validateMystery(invalid, 'easy');
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('does not match any suspect'))).toBe(true);
  });

  it('rejects a mystery when hint explicitly leaks culprit name', () => {
    const invalid = createValidEasyMystery();
    invalid.hints[0].text = 'The evidence points to Elena Vance being near the vault.';

    const result = validateMystery(invalid, 'easy');
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('mentions culprit\'s name'))).toBe(true);
  });

  it('rejects a mystery when story leaks culprit guilt', () => {
    const invalid = createValidEasyMystery();
    invalid.story += ' Everyone later discovered that Elena Vance stole the jewel.';

    const result = validateMystery(invalid, 'easy');
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes('Story leaks solution'))).toBe(true);
  });
});
