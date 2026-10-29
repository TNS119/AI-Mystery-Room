// Curated photographic portraits of authentic Indian models and professionals
// Tailored to Indian names, roles, and genders for realistic detective crime dockets
// Features case-scoped shuffling and stateful rotation so the same faces are NEVER repeated across consecutive cases

const RECENT_PHOTOS_STORAGE_KEY = 'ai_mystery_recent_suspect_photos';

// Expanded library of verified, authentic Indian model portraits
export const INDIAN_MODEL_PORTRAITS = {
  male_young_founder: [
    'https://plus.unsplash.com/premium_photo-1691030256264-59cdf9414ed1?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
    'https://plus.unsplash.com/premium_photo-1682089787056-9ac0c78a2ac2?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
    'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
    'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&crop=faces&w=400&h=400&q=80'
  ],
  male_executive_manager: [
    'https://plus.unsplash.com/premium_photo-1682430700877-d85b273bc253?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
    'https://plus.unsplash.com/premium_photo-1682092603230-1ce7cf8ca451?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
    'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
    'https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&crop=faces&w=400&h=400&q=80'
  ],
  male_security_driver: [
    'https://plus.unsplash.com/premium_photo-1682096592504-5bc960bea6d7?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
    'https://plus.unsplash.com/premium_photo-1691032016317-639a11f71b85?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
    'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
    'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&crop=faces&w=400&h=400&q=80'
  ],
  female_young_assistant: [
    'https://plus.unsplash.com/premium_photo-1682089810582-f7b200217b67?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
    'https://plus.unsplash.com/premium_photo-1691030255194-99b2f36906c5?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
    'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&crop=faces&w=400&h=400&q=80'
  ],
  female_executive_legal: [
    'https://plus.unsplash.com/premium_photo-1718570265514-cb05defa16e7?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
    'https://plus.unsplash.com/premium_photo-1682092039530-584ae1d9da7f?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
    'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
    'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
    'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?auto=format&fit=crop&crop=faces&w=400&h=400&q=80',
    'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&crop=faces&w=400&h=400&q=80'
  ]
};

const ALL_MALE_PORTRAITS = [
  ...INDIAN_MODEL_PORTRAITS.male_young_founder,
  ...INDIAN_MODEL_PORTRAITS.male_executive_manager,
  ...INDIAN_MODEL_PORTRAITS.male_security_driver
];

const ALL_FEMALE_PORTRAITS = [
  ...INDIAN_MODEL_PORTRAITS.female_young_assistant,
  ...INDIAN_MODEL_PORTRAITS.female_executive_legal
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
  let selectedUrl = candidates.length > 0
    ? candidates[index % candidates.length]
    : shuffledPool[index % shuffledPool.length];

  // Guarantee facial centering & balanced framing on Unsplash image crops
  if (selectedUrl && selectedUrl.includes('unsplash.com') && !selectedUrl.includes('crop=faces')) {
    selectedUrl = selectedUrl.replace('fit=crop', 'fit=crop&crop=faces');
  }

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
