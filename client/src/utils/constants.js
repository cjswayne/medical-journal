export const STRAIN_TYPES = ['sativa', 'indica', 'hybrid'];

export const CANNABIS_FORMS = ['flower', 'oil', 'edible', 'extract', 'tincture', 'topical', 'other'];

export const CONSUMPTION_METHODS = ['smoke', 'vape', 'ingest', 'dab', 'sublingual', 'apply', 'other'];

export const DEFAULT_AROMAS = [
  'Nutty', 'Sweet', 'Fruity', 'Citrusy', 'Floral',
  'Herbal', 'Woody', 'Musky', 'Pungent', 'Spicy'
];

export const DEFAULT_FLAVORS = [
  'Nutty', 'Sweet', 'Fruity', 'Citrusy', 'Floral',
  'Herbal', 'Woody', 'Musky', 'Pungent', 'Spicy'
];

export const CANNABINOID_KEYS = ['thc', 'cbd', 'thca', 'thcv', 'cbda', 'cbdv', 'cbg', 'cbn', 'cbc'];

export const CANNABINOID_LABELS = {
  thc: 'THC', cbd: 'CBD', thca: 'THCA', thcv: 'THCV',
  cbda: 'CBDA', cbdv: 'CBDV', cbg: 'CBG', cbn: 'CBN', cbc: 'CBC'
};

export const EFFECT_KEYS = [
  'painRelief', 'headache', 'energy', 'creative',
  'stressRelief', 'dryMouth', 'sleepy', 'anxious',
  'crampRelief', 'dryEyes', 'lazy', 'focused',
  'relaxation', 'hungry', 'uplifted', 'peaceful'
];

export const EFFECT_LABELS = {
  painRelief: 'Pain Relief', headache: 'Headache', energy: 'Energy',
  creative: 'Creative', stressRelief: 'Stress Relief', dryMouth: 'Dry Mouth',
  sleepy: 'Sleepy', anxious: 'Anxious', crampRelief: 'Cramp Relief',
  dryEyes: 'Dry Eyes', lazy: 'Lazy', focused: 'Focused',
  relaxation: 'Relaxation', hungry: 'Hungry', uplifted: 'Uplifted',
  peaceful: 'Peaceful'
};

// Cloudinary transform helpers
export const cloudinaryTransform = (url, width = 400) => {
  if (!url || !url.includes('cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
};
