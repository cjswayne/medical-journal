'use strict';

// Intelligence tiers: 1 (lowest) to 5 (highest)
// Prices are per 1M tokens as of March 2026 from Cursor docs
const MODELS = [
  { name: 'GPT-5.4 nano',        provider: 'openai',    inputPer1M: 0.20,  outputPer1M: 1.25,   tier: 1 },
  { name: 'Gemini 2.5 Flash',    provider: 'google',    inputPer1M: 0.30,  outputPer1M: 2.50,   tier: 1 },
  { name: 'Composer 2',          provider: 'cursor',    inputPer1M: 0.50,  outputPer1M: 2.50,   tier: 2 },
  { name: 'Gemini 3 Flash',      provider: 'google',    inputPer1M: 0.50,  outputPer1M: 3.00,   tier: 2 },
  { name: 'GPT-5.4 mini',        provider: 'openai',    inputPer1M: 0.75,  outputPer1M: 4.50,   tier: 3 },
  { name: 'Claude 4.5 Haiku',    provider: 'anthropic', inputPer1M: 1.00,  outputPer1M: 5.00,   tier: 3 },
  { name: 'Auto',                provider: 'cursor',    inputPer1M: 1.25,  outputPer1M: 6.00,   tier: 3 },
  { name: 'Composer 1',          provider: 'cursor',    inputPer1M: 1.25,  outputPer1M: 10.00,  tier: 3 },
  { name: 'Gemini 3 Pro',        provider: 'google',    inputPer1M: 2.00,  outputPer1M: 12.00,  tier: 4 },
  { name: 'GPT-5.4',             provider: 'openai',    inputPer1M: 2.50,  outputPer1M: 15.00,  tier: 4 },
  { name: 'Claude 4.6 Sonnet',   provider: 'anthropic', inputPer1M: 3.00,  outputPer1M: 15.00,  tier: 4 },
  { name: 'Claude 4.5 Sonnet',   provider: 'anthropic', inputPer1M: 3.00,  outputPer1M: 15.00,  tier: 4 },
  { name: 'Claude 4 Sonnet',     provider: 'anthropic', inputPer1M: 3.00,  outputPer1M: 15.00,  tier: 4 },
  { name: 'Composer 1.5',        provider: 'cursor',    inputPer1M: 3.50,  outputPer1M: 17.50,  tier: 4 },
  { name: 'Claude 4.5 Opus',     provider: 'anthropic', inputPer1M: 5.00,  outputPer1M: 25.00,  tier: 5 },
  { name: 'Claude 4.6 Opus',     provider: 'anthropic', inputPer1M: 5.00,  outputPer1M: 25.00,  tier: 5 },
  { name: 'Claude 4.6 Opus Fast',provider: 'anthropic', inputPer1M: 30.00, outputPer1M: 150.00, tier: 5 },
];

// Minimum tier required per task complexity category
const TASK_COMPLEXITY = {
  scaffolding:   { minTier: 1, label: 'Config files, .env, boilerplate, scaffolding' },
  styling:       { minTier: 1, label: 'CSS/theme/styling only' },
  simple_route:  { minTier: 2, label: 'Single-file CRUD routes, simple middleware' },
  test_suite:    { minTier: 2, label: 'Test suites (well-specified from plan)' },
  component:     { minTier: 3, label: 'Multi-file components with interactions' },
  aggregation:   { minTier: 3, label: 'Complex aggregation, analytics, pipelines' },
  full_page:     { minTier: 4, label: 'Full-page integration (many dependencies)' },
  architecture:  { minTier: 5, label: 'Architecture review, quality gates' },
};

const TIER_LABELS = {
  1: 'Low',
  2: 'Medium',
  3: 'Medium-High',
  4: 'High',
  5: 'Very High',
};

const getModels = () => [...MODELS];

// Filter out Opus Fast by default (user must explicitly request it)
const getModelsExcludingOpusFast = () =>
  MODELS.filter(m => m.name !== 'Claude 4.6 Opus Fast');

const getModelsByMinTier = (minTier) =>
  getModelsExcludingOpusFast().filter(m => m.tier >= minTier);

const getTaskComplexity = (key) => TASK_COMPLEXITY[key] || null;

const getAllComplexities = () => ({ ...TASK_COMPLEXITY });

// Estimate cost in dollars for given input/output token counts
const estimateCost = (model, inputTokens, outputTokens) => {
  const inputCost = (inputTokens / 1_000_000) * model.inputPer1M;
  const outputCost = (outputTokens / 1_000_000) * model.outputPer1M;
  return { inputCost, outputCost, totalCost: inputCost + outputCost };
};

module.exports = {
  MODELS,
  TASK_COMPLEXITY,
  TIER_LABELS,
  getModels,
  getModelsExcludingOpusFast,
  getModelsByMinTier,
  getTaskComplexity,
  getAllComplexities,
  estimateCost,
};
