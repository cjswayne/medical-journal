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

// Predefined terpene list with chemical structure SVG paths
export const TERPENE_OPTIONS = [
  '\u03B2-Caryophyllene',
  'Myrcene',
  'Limonene',
  '\u03B1-Pinene',
  '\u03B2-Pinene',
  'Linalool',
  'Humulene',
  'Terpinolene',
  'Ocimene',
  'Farnesene',
  'Nerolidol',
  'Bisabolol',
  'Guaiol',
  'Eucalyptol (1,8-Cineole)',
  'Camphene',
  'Borneol',
  'Terpineol',
  'Valencene',
  'Geraniol',
  'Sabinene',
  'Isopulegol',
  'Cedrene',
];

// Simplified skeletal structure SVGs for each terpene (molecular formula diagrams)
export const TERPENE_STRUCTURES = {
  '\u03B2-Caryophyllene': 'M10,30 L20,15 L35,15 L45,25 L40,40 L25,45 L15,40 Z M35,15 L50,10 L55,20',
  'Myrcene': 'M10,40 L20,25 L30,30 L40,15 L50,20 M20,25 L15,10 M40,15 L50,5',
  'Limonene': 'M25,10 L40,15 L45,30 L35,42 L20,42 L10,30 L15,15 Z M25,10 L25,2 M35,42 L40,50',
  '\u03B1-Pinene': 'M15,35 L25,15 L40,15 L45,30 L35,40 L20,40 Z M25,15 L30,25 L40,15',
  '\u03B2-Pinene': 'M15,35 L25,15 L40,15 L45,30 L35,40 L20,40 Z M30,25 L30,8',
  'Linalool': 'M5,35 L15,25 L25,30 L35,20 L45,25 L55,15 M15,25 L10,12 M45,25 L50,35',
  'Humulene': 'M10,25 L20,10 L35,10 L45,20 L45,35 L35,45 L20,45 L10,35 Z',
  'Terpinolene': 'M25,8 L40,15 L45,30 L35,42 L20,42 L10,30 L15,15 Z M25,42 L25,52',
  'Ocimene': 'M5,40 L15,28 L25,32 L35,18 L45,22 L55,10 M35,18 L30,5',
  'Farnesene': 'M5,35 L12,25 L22,30 L30,18 L40,22 L48,12 L58,16 M30,18 L25,5 M48,12 L53,2',
  'Nerolidol': 'M5,40 L15,28 L25,32 L35,18 L45,22 L55,10 M15,28 L10,15 M45,22 L50,35',
  'Bisabolol': 'M25,8 L38,14 L42,28 L33,40 L20,40 L12,28 L16,14 Z M33,40 L40,50 L50,45',
  'Guaiol': 'M15,20 L28,12 L38,18 L38,32 L28,38 L15,32 Z M38,25 L50,20 L55,30 L50,40 L38,32',
  'Eucalyptol (1,8-Cineole)': 'M20,10 L35,10 L42,22 L35,35 L20,35 L12,22 Z M20,10 L35,35 M35,10 L20,35',
  'Camphene': 'M20,38 L25,15 L40,20 L38,38 Z M25,15 L15,5 M25,15 L35,8',
  'Borneol': 'M15,35 L25,15 L40,15 L45,30 L35,40 L20,40 Z M25,15 L30,28 L40,15 M45,30 L55,28',
  'Terpineol': 'M25,8 L40,15 L45,30 L35,42 L20,42 L10,30 L15,15 Z M45,30 L55,32',
  'Valencene': 'M15,20 L28,12 L38,18 L38,32 L28,38 L15,32 Z M28,12 L28,2 M38,32 L48,38 L48,28',
  'Geraniol': 'M5,35 L15,25 L28,30 L38,18 L50,22 M15,25 L10,12 M50,22 L58,30',
  'Sabinene': 'M20,38 L28,15 L42,22 L35,40 Z M28,15 L22,5 M28,15 L35,5',
  'Isopulegol': 'M25,8 L40,15 L45,30 L35,42 L20,42 L10,30 L15,15 Z M10,30 L2,35 M35,42 L38,52',
  'Cedrene': 'M15,18 L28,10 L38,16 L38,30 L28,36 L15,30 Z M38,23 L50,18 L55,28 L48,36 L38,30',
};

// Cloudinary transform helpers
export const cloudinaryTransform = (url, width = 400) => {
  if (!url || !url.includes('cloudinary.com')) return url;
  return url.replace('/upload/', `/upload/f_auto,q_auto,w_${width}/`);
};

// Format today as YYYY-MM-DD for date inputs
export const todayISO = () => new Date().toISOString().split('T')[0];
