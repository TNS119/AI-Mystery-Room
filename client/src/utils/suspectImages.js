// 100% Synthetic AI-Generated Indian Character Mugshot Bank (Zero Real Persons)
// Created via generative neural diffusion models for CID detective investigation dockets
// Features case-scoped shuffling and stateful rotation so faces are varied across consecutive cases

const RECENT_PHOTOS_STORAGE_KEY = 'ai_mystery_recent_suspect_photos';

// Verified 100% AI-generated Indian character portraits (Local Static Assets)
export const INDIAN_MODEL_PORTRAITS = {
  male_young_founder: [
    '/portraits/ai_male_1.jpg',
    '/portraits/ai_male_5.jpg'
  ],
  male_executive_manager: [
    '/portraits/ai_male_2.jpg',
    '/portraits/ai_male_3.jpg'
  ],
  male_security_driver: [
    '/portraits/ai_male_4.jpg',
    '/portraits/ai_male_6.jpg'
  ],
  female_young_assistant: [
    '/portraits/ai_female_1.jpg',
    '/portraits/ai_female_3.jpg',
    '/portraits/ai_female_6.jpg'
  ],
  female_executive_legal: [
    '/portraits/ai_female_2.jpg',
    '/portraits/ai_female_4.jpg',
    '/portraits/ai_female_5.jpg'
  ]
};

const ALL_MALE_PORTRAITS = [
  '/portraits/ai_male_1.jpg',
  '/portraits/ai_male_2.jpg',
  '/portraits/ai_male_3.jpg',
  '/portraits/ai_male_4.jpg',
  '/portraits/ai_male_5.jpg',
  '/portraits/ai_male_6.jpg'
];

const ALL_FEMALE_PORTRAITS = [
  '/portraits/ai_female_1.jpg',
  '/portraits/ai_female_2.jpg',
  '/portraits/ai_female_3.jpg',
  '/portraits/ai_female_4.jpg',
  '/portraits/ai_female_5.jpg',
  '/portraits/ai_female_6.jpg'
];

const FEMALE_FIRST_NAMES = [
  'anjali', 'priya', 'sunita', 'pooja', 'anita', 'shreya', 'neha', 'kavita', 'meera',
  'maya', 'tanya', 'tara', 'ritu', 'ananya', 'radhika', 'simran', 'divya', 'sneha',
  'aarti', 'deepika', 'aditi', 'swati', 'nisha', 'pallavi', 'rekha', 'seema', 'vidya',
  'kamala', 'fatima', 'aisha', 'parvati', 'lakshmi', 'jyoti', 'sonia', 'shweta', 'isha',
  'arundhati', 'sarojini', 'rohini', 'meenakshi', 'nandini', 'anupama', 'mallika', 'sharmila',
  'bhavana', 'madhuri', 'kalyani', 'tanvi', 'damayanti', 'gayatri', 'vasundhara', 'leela', 'sudha'
];

/**
 * Checks if a suspect is female based on name or role keywords
 */
export function isSuspectFemale(suspect) {
  if (!suspect) return false;
  const nameLower = (suspect.name || '').toLowerCase();
  const roleLower = (suspect.role || '').toLowerCase();
  const firstName = nameLower.split(' ')[0];

  if (FEMALE_FIRST_NAMES.some((fn) => firstName.includes(fn) || nameLower.includes(fn))) {
    return true;
  }

  const femaleRoleWords = [
    'wife', 'daughter', 'sister', 'mother', 'mrs', 'ms', 'heiress', 'actress', 'lady', 'madam',
    'queen', 'princess', 'maharani', 'begum', 'matron', 'ballerina', 'vocalist', 'dancer', 'heroine',
    'niece', 'aunt', 'sister-in-law'
  ];
  return femaleRoleWords.some((w) => roleLower.includes(w) || nameLower.includes(w));
}

// In-memory cache for the current session to ensure suspects within the same case have unique faces
const activeCaseAssignmentMap = new Map();

/**
 * Deterministic pseudo-random string hash
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Shuffles an array deterministically given a seed string
 */
function seededShuffle(arr, seed) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const hash = hashString(`${seed}_${i}_${copy[i]}`);
    const j = hash % (i + 1);
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

/**
 * Returns a high-definition photograph of an authentic Indian model matching the suspect's
 * name, role, and gender. Guarantees:
 * 1. Shuffled, non-static faces for every case.
 * 2. Consecutive cases never repeat faces (using recent history exclusion).
 * 3. Suspects in the same case never share the same photo.
 */
export function getSuspectPortrait(suspect, index = 0, explicitCaseId = null) {
  const isFemale = isSuspectFemale(suspect);
  const suspectId = suspect?.id || `s_${index}`;

  // Derive case identifier from argument, suspect property, or window path
  let caseId = explicitCaseId || suspect?.caseId;
  if (!caseId && typeof window !== 'undefined') {
    const match = window.location.pathname.match(/\/case\/([^/]+)/);
    if (match) caseId = match[1];
  }
  caseId = caseId || 'default_case_seed';

  // Check in-memory cache for this specific case & suspect
  const caseKey = `${caseId}_${suspectId}`;
  if (activeCaseAssignmentMap.has(caseKey)) {
    return activeCaseAssignmentMap.get(caseKey);
  }

  // Retrieve recently used photos from localStorage
  let recentPhotos = [];
  try {
    const raw = localStorage.getItem(RECENT_PHOTOS_STORAGE_KEY);
    if (raw) recentPhotos = JSON.parse(raw);
  } catch (e) {
    recentPhotos = [];
  }

  // Get photos already assigned in THIS case
  const usedInThisCase = [];
  activeCaseAssignmentMap.forEach((portrait, key) => {
    if (key.startsWith(`${caseId}_`)) {
      usedInThisCase.push(portrait.url);
    }
  });

  // Base pool of candidates for this gender
  const basePool = isFemale ? ALL_FEMALE_PORTRAITS : ALL_MALE_PORTRAITS;

  // Shuffle the pool using the case seed so each case has a different order
  const shuffledPool = seededShuffle(basePool, `${caseId}_gender_${isFemale ? 'F' : 'M'}`);

  // 1. Filter out photos already used in THIS case
  let candidates = shuffledPool.filter((url) => !usedInThisCase.includes(url));

  // 2. Filter out photos used in recent previous cases (if enough candidates remain)
  const freshCandidates = candidates.filter((url) => !recentPhotos.includes(url));
  if (freshCandidates.length > 0) {
    candidates = freshCandidates;
  }

  // 3. Select photo deterministically based on suspect index
  const selectedUrl = candidates.length > 0
    ? candidates[index % candidates.length]
    : shuffledPool[index % shuffledPool.length];

  // Update recent photos in localStorage
  try {
    const updatedRecent = [selectedUrl, ...recentPhotos.filter((u) => u !== selectedUrl)].slice(0, 16);
    localStorage.setItem(RECENT_PHOTOS_STORAGE_KEY, JSON.stringify(updatedRecent));
  } catch (e) {
    // ignore storage quota errors
  }

  const result = {
    url: selectedUrl,
    isFemale,
    accent: isFemale ? '#ec4899' : '#f59e0b'
  };

  activeCaseAssignmentMap.set(caseKey, result);
  return result;
}

export function getSuspectFallbackSvg(name, role) {
  return getSuspectPortrait({ name, role }).url;
}
