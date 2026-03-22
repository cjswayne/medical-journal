'use strict';

const fs = require('fs');
const path = require('path');
const { countFileListTokens } = require('./token-counter');

// Output multiplier: estimated generated tokens as a ratio of input context.
// For greenfield files the model reads the plan + related context as input,
// then writes code as output. Output is typically 1.2-2x the input context
// for generation tasks, less for editing.
const OUTPUT_MULTIPLIER_NEW = 1.5;
const OUTPUT_MULTIPLIER_EDIT = 0.6;

// Default phases for the weed-diary project (from the agent-driven build plan).
// Each phase lists files it touches and its complexity category.
const DEFAULT_PHASES = [
  {
    id: 'phase-0',
    name: 'Project Scaffolding',
    complexity: 'scaffolding',
    files: [
      'package.json',
      '.env.example',
      'setup.md',
    ],
    contextFiles: ['.cursor/plans/agent-driven_build_plan_b1ecf537.plan.md'],
    isNew: true,
  },
  {
    id: 'phase-1',
    name: 'Server Config and Models',
    complexity: 'simple_route',
    files: [
      'server/package.json',
      'server/index.js',
      'server/config/db.js',
      'server/config/cloudinary.js',
      'server/models/Entry.js',
      'server/models/CustomOption.js',
    ],
    contextFiles: ['.cursor/plans/agent-driven_build_plan_b1ecf537.plan.md'],
    isNew: true,
  },
  {
    id: 'phase-2',
    name: 'Auth Middleware and Route',
    complexity: 'simple_route',
    files: [
      'server/middleware/authCheck.js',
      'server/routes/auth.js',
    ],
    contextFiles: ['server/index.js'],
    isNew: true,
  },
  {
    id: 'phase-3',
    name: 'Server Routes',
    complexity: 'aggregation',
    files: [
      'server/routes/entries.js',
      'server/routes/upload.js',
      'server/routes/options.js',
      'server/routes/analytics.js',
      'server/utils/cloudinaryUpload.js',
    ],
    contextFiles: [
      'server/models/Entry.js',
      'server/models/CustomOption.js',
      'server/middleware/authCheck.js',
    ],
    isNew: true,
  },
  {
    id: 'phase-4',
    name: 'Server Tests',
    complexity: 'test_suite',
    files: [
      'server/tests/setup.js',
      'server/tests/auth.test.js',
      'server/tests/entries.test.js',
      'server/tests/options.test.js',
      'server/tests/analytics.test.js',
    ],
    contextFiles: [
      'server/routes/auth.js',
      'server/routes/entries.js',
      'server/routes/options.js',
      'server/routes/analytics.js',
      'server/models/Entry.js',
    ],
    isNew: true,
  },
  {
    id: 'phase-5',
    name: 'Client Scaffolding and Theme',
    complexity: 'styling',
    files: [
      'client/package.json',
      'client/vite.config.js',
      'client/index.html',
      'client/src/main.jsx',
      'client/src/styles/variables.css',
      'client/src/styles/global.css',
    ],
    contextFiles: [],
    isNew: true,
  },
  {
    id: 'phase-6',
    name: 'Context, Hooks, and Utilities',
    complexity: 'component',
    files: [
      'client/src/App.jsx',
      'client/src/context/AuthContext.jsx',
      'client/src/hooks/useAuth.js',
      'client/src/hooks/useEntries.js',
      'client/src/hooks/useAnalytics.js',
      'client/src/hooks/useOptions.js',
      'client/src/utils/api.js',
      'client/src/utils/constants.js',
      'client/src/utils/formatters.js',
    ],
    contextFiles: [],
    isNew: true,
  },
  {
    id: 'phase-7',
    name: 'Reusable Components',
    complexity: 'component',
    files: [
      'client/src/components/EntryCard.jsx',
      'client/src/components/SkeletonCard.jsx',
      'client/src/components/SearchBar.jsx',
      'client/src/components/SensoryPicker.jsx',
      'client/src/components/EffectsRater.jsx',
      'client/src/components/StrainList.jsx',
      'client/src/components/ImageUploader.jsx',
      'client/src/components/TagInput.jsx',
      'client/src/components/MapEmbed.jsx',
      'client/src/components/CollapsibleSection.jsx',
      'client/src/components/ProtectedRoute.jsx',
    ],
    contextFiles: [
      'client/src/utils/constants.js',
      'client/src/utils/api.js',
      'client/src/context/AuthContext.jsx',
    ],
    isNew: true,
  },
  {
    id: 'phase-8',
    name: 'Pages',
    complexity: 'full_page',
    files: [
      'client/src/pages/LoginPage.jsx',
      'client/src/pages/HomePage.jsx',
      'client/src/pages/EntryFormPage.jsx',
      'client/src/pages/EntryViewPage.jsx',
      'client/src/styles/Login.module.css',
      'client/src/styles/HomePage.module.css',
      'client/src/styles/EntryForm.module.css',
      'client/src/styles/EntryView.module.css',
    ],
    contextFiles: [
      'client/src/components/EntryCard.jsx',
      'client/src/components/SensoryPicker.jsx',
      'client/src/components/EffectsRater.jsx',
      'client/src/components/StrainList.jsx',
      'client/src/components/ImageUploader.jsx',
      'client/src/components/TagInput.jsx',
      'client/src/components/CollapsibleSection.jsx',
      'client/src/hooks/useEntries.js',
      'client/src/hooks/useOptions.js',
      'client/src/context/AuthContext.jsx',
      'client/src/utils/constants.js',
    ],
    isNew: true,
  },
  {
    id: 'phase-9',
    name: 'Analytics Page',
    complexity: 'aggregation',
    files: [
      'client/src/pages/AnalyticsPage.jsx',
      'client/src/styles/Analytics.module.css',
    ],
    contextFiles: [
      'client/src/hooks/useAnalytics.js',
      'client/src/styles/variables.css',
    ],
    isNew: true,
  },
  {
    id: 'phase-10',
    name: 'Quality Gate Review',
    complexity: 'architecture',
    files: [],
    contextFiles: [],
    isNew: false,
  },
];

// Heuristic: estimate output tokens for files that do not exist yet.
// Based on typical file sizes by extension and role.
const FILE_SIZE_ESTIMATES = {
  '.js':   200,   // ~200 tokens for a typical JS module
  '.jsx':  350,   // React components tend to be larger
  '.css':  120,
  '.html': 80,
  '.json': 60,
  '.md':   400,
  '.mdc':  150,
  'test':  500,   // Test files are verbose
  'page':  600,   // Page components are the largest
  'route': 300,   // Express route files
  'model': 250,   // Mongoose model files
};

const estimateFileOutputTokens = (filePath) => {
  const basename = path.basename(filePath).toLowerCase();

  if (basename.includes('.test.')) return FILE_SIZE_ESTIMATES.test;
  if (basename.includes('page'))  return FILE_SIZE_ESTIMATES.page;
  if (filePath.includes('routes/')) return FILE_SIZE_ESTIMATES.route;
  if (filePath.includes('models/')) return FILE_SIZE_ESTIMATES.model;

  const ext = path.extname(filePath).toLowerCase();
  return FILE_SIZE_ESTIMATES[ext] || 200;
};

// Estimate tokens for a single phase
const estimatePhase = (phase, rootDir) => {
  // Input tokens: context files the model needs to read
  const allContextFiles = [...(phase.contextFiles || [])];
  const { totalTokens: contextTokens } = countFileListTokens(rootDir, allContextFiles);

  // Plan file overhead: the model always reads some plan context (~2K tokens)
  const planOverhead = 2000;
  const inputTokens = contextTokens + planOverhead;

  // Output tokens: files to generate or edit
  let outputTokens = 0;
  if (phase.isNew) {
    for (const f of phase.files) {
      const absPath = path.join(rootDir, f);
      if (fs.existsSync(absPath)) {
        const content = fs.readFileSync(absPath, 'utf-8');
        const { countTokens } = require('./token-counter');
        outputTokens += Math.ceil(countTokens(content) * OUTPUT_MULTIPLIER_EDIT);
      } else {
        outputTokens += estimateFileOutputTokens(f);
      }
    }
  } else {
    // Review-only phases: minimal output (comments, summary)
    outputTokens = 500;
  }

  return {
    id: phase.id,
    name: phase.name,
    complexity: phase.complexity,
    fileCount: phase.files.length,
    inputTokens,
    outputTokens,
  };
};

// Estimate all phases
const estimateAllPhases = (rootDir, phases = null) => {
  const phaseList = phases || DEFAULT_PHASES;
  return phaseList.map(p => estimatePhase(p, rootDir));
};

// Parse a .plan.md file for ## Phase headers (best-effort extraction)
const parsePlanFile = (planPath) => {
  if (!fs.existsSync(planPath)) return null;

  const content = fs.readFileSync(planPath, 'utf-8');
  const phaseRegex = /^## Phase (\d+)\s*[-–—]\s*(.+)$/gm;
  const phases = [];
  let match;

  while ((match = phaseRegex.exec(content)) !== null) {
    phases.push({
      id: `phase-${match[1]}`,
      name: match[2].trim(),
      rawIndex: match.index,
    });
  }

  return phases.length > 0 ? phases : null;
};

module.exports = {
  DEFAULT_PHASES,
  estimatePhase,
  estimateAllPhases,
  estimateFileOutputTokens,
  parsePlanFile,
};
