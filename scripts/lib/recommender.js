'use strict';

const {
  getModelsExcludingOpusFast,
  getModelsByMinTier,
  getTaskComplexity,
  estimateCost,
  TIER_LABELS,
} = require('./model-registry');

// Find the cheapest model that meets the minimum tier for a task
const recommendModel = (phaseEstimate) => {
  const complexity = getTaskComplexity(phaseEstimate.complexity);
  if (!complexity) {
    return {
      error: `Unknown complexity category: ${phaseEstimate.complexity}`,
      model: null,
      fallback: null,
    };
  }

  const eligible = getModelsByMinTier(complexity.minTier);
  if (eligible.length === 0) {
    return {
      error: 'No eligible models found (all filtered out)',
      model: null,
      fallback: null,
    };
  }

  // Score each eligible model by total cost (cheapest wins)
  const scored = eligible.map(model => ({
    model,
    ...estimateCost(model, phaseEstimate.inputTokens, phaseEstimate.outputTokens),
  }));

  scored.sort((a, b) => a.totalCost - b.totalCost);

  const recommended = scored[0];
  // Fallback: next tier up (first model with a higher tier than recommended)
  const fallback = scored.find(s => s.model.tier > recommended.model.tier) || null;

  return {
    recommended: {
      model: recommended.model.name,
      provider: recommended.model.provider,
      tier: recommended.model.tier,
      tierLabel: TIER_LABELS[recommended.model.tier],
      inputCost: recommended.inputCost,
      outputCost: recommended.outputCost,
      totalCost: recommended.totalCost,
    },
    fallback: fallback ? {
      model: fallback.model.name,
      provider: fallback.model.provider,
      tier: fallback.model.tier,
      tierLabel: TIER_LABELS[fallback.model.tier],
      totalCost: fallback.totalCost,
    } : null,
    complexity: complexity.label,
    minTier: complexity.minTier,
    minTierLabel: TIER_LABELS[complexity.minTier],
  };
};

// Recommend models for all phases and compute totals
const recommendAllPhases = (phaseEstimates) => {
  let totalCheapest = 0;
  let totalFallback = 0;

  // Compute what it would cost if every phase used the most expensive model
  const allModels = getModelsExcludingOpusFast();
  const mostExpensive = allModels[allModels.length - 1];
  let totalOpus = 0;

  const recommendations = phaseEstimates.map(est => {
    const rec = recommendModel(est);

    if (rec.recommended) {
      totalCheapest += rec.recommended.totalCost;
    }
    if (rec.fallback) {
      totalFallback += rec.fallback.totalCost;
    } else if (rec.recommended) {
      totalFallback += rec.recommended.totalCost;
    }

    const opusCost = estimateCost(mostExpensive, est.inputTokens, est.outputTokens);
    totalOpus += opusCost.totalCost;

    return {
      phase: est,
      recommendation: rec,
      opusCost: opusCost.totalCost,
    };
  });

  const savings = totalOpus > 0
    ? ((1 - totalCheapest / totalOpus) * 100).toFixed(1)
    : 0;

  return {
    recommendations,
    summary: {
      totalCheapest,
      totalFallback,
      totalOpus,
      savingsPercent: parseFloat(savings),
      phaseCount: phaseEstimates.length,
    },
  };
};

module.exports = { recommendModel, recommendAllPhases };
