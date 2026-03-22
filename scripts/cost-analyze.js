#!/usr/bin/env node
'use strict';

const path = require('path');
const { countRepoTokens } = require('./lib/token-counter');
const { estimateAllPhases } = require('./lib/phase-estimator');
const { recommendAllPhases } = require('./lib/recommender');
const { getModels, TIER_LABELS } = require('./lib/model-registry');

// --- CLI flag parsing ---
const args = process.argv.slice(2);
const flags = {
  dryRun: args.includes('--dry-run'),
  test:   args.includes('--test'),
  help:   args.includes('--help') || args.includes('-h'),
  plan:   null,
};

const planIdx = args.indexOf('--plan');
if (planIdx !== -1 && args[planIdx + 1]) {
  flags.plan = args[planIdx + 1];
}

// --- Help text ---
if (flags.help) {
  console.log(`
Usage: node scripts/cost-analyze.js [options]

Options:
  --dry-run    Show token counts only, skip model recommendations
  --test       Use mock data instead of scanning the real repo
  --plan PATH  Target a specific .plan.md file for phase parsing
  --help, -h   Show this help message

Examples:
  npm run cost-analyze
  npm run cost-analyze -- --dry-run
  npm run cost-analyze -- --test
  npm run cost-analyze -- --plan .cursor/plans/my-plan.plan.md
`);
  process.exit(0);
}

// --- Formatting helpers ---
const fmt = (n) => n.toLocaleString();
const fmtDollars = (n) => `$${n.toFixed(4)}`;
const pad = (str, len) => String(str).padEnd(len);
const padR = (str, len) => String(str).padStart(len);

const divider = (char = '-', len = 90) => char.repeat(len);

const printTable = (headers, rows, colWidths) => {
  const headerLine = headers.map((h, i) => pad(h, colWidths[i])).join(' | ');
  console.log(headerLine);
  console.log(divider('-', headerLine.length));
  for (const row of rows) {
    console.log(row.map((cell, i) => pad(String(cell), colWidths[i])).join(' | '));
  }
};

// --- Mock data for --test mode ---
const getMockRepoData = () => ({
  files: [
    { file: 'package.json', tokens: 45, bytes: 200 },
    { file: 'scripts/cost-analyze.js', tokens: 320, bytes: 1400 },
    { file: 'scripts/lib/model-registry.js', tokens: 280, bytes: 1200 },
    { file: '.cursor/rules/model-cost-optimizer.mdc', tokens: 180, bytes: 800 },
  ],
  totalTokens: 825,
  fileCount: 4,
  skippedCount: 2,
});

// --- Main ---
const run = async () => {
  const rootDir = path.resolve(__dirname, '..');

  console.log('');
  console.log(divider('='));
  console.log('  COST ANALYZER -- Model Selection for Build Plan Phases');
  console.log(divider('='));
  console.log('');

  // Step 1: Count repo tokens
  console.log('[1/3] Scanning repository tokens...');
  console.log('');

  let repoData;
  if (flags.test) {
    console.log('  (--test mode: using mock data)');
    repoData = getMockRepoData();
  } else {
    repoData = await countRepoTokens(rootDir);
  }

  console.log(`  Files scanned:  ${fmt(repoData.fileCount)}`);
  console.log(`  Files skipped:  ${fmt(repoData.skippedCount)}`);
  console.log(`  Total tokens:   ${fmt(repoData.totalTokens)}`);
  console.log('');

  // Top files by token count
  const topN = Math.min(10, repoData.files.length);
  if (topN > 0) {
    console.log(`  Top ${topN} files by token count:`);
    const topRows = repoData.files.slice(0, topN).map(f => [
      f.file,
      padR(fmt(f.tokens), 8),
    ]);
    printTable(['File', 'Tokens'], topRows, [60, 10]);
    console.log('');
  }

  // If --dry-run, stop here
  if (flags.dryRun) {
    console.log('  (--dry-run: skipping model recommendations)');
    console.log('');
    process.exit(0);
  }

  // Step 2: Estimate phase token budgets
  console.log(divider('-'));
  console.log('[2/3] Estimating per-phase token budgets...');
  console.log('');

  const phaseEstimates = estimateAllPhases(rootDir);

  const estRows = phaseEstimates.map(p => [
    p.id,
    p.name,
    p.complexity,
    padR(fmt(p.fileCount), 5),
    padR(fmt(p.inputTokens), 8),
    padR(fmt(p.outputTokens), 8),
  ]);

  printTable(
    ['Phase', 'Name', 'Complexity', 'Files', 'Input ~', 'Output ~'],
    estRows,
    [10, 30, 14, 5, 8, 8],
  );
  console.log('');

  // Step 3: Recommend models
  console.log(divider('-'));
  console.log('[3/3] Recommending cheapest viable model per phase...');
  console.log('');

  const { recommendations, summary } = recommendAllPhases(phaseEstimates);

  for (const { phase, recommendation, opusCost } of recommendations) {
    const rec = recommendation.recommended;
    const fb = recommendation.fallback;

    console.log(`  ${phase.id} -- ${phase.name}`);
    console.log(`    Complexity:   ${recommendation.complexity} (min tier: ${recommendation.minTierLabel})`);
    console.log(`    Input tokens: ~${fmt(phase.inputTokens)} | Output tokens: ~${fmt(phase.outputTokens)}`);

    if (rec) {
      console.log(`    Recommended:  ${rec.model} (${rec.provider}, tier ${rec.tier} ${rec.tierLabel})`);
      console.log(`    Est. cost:    ${fmtDollars(rec.totalCost)} (input: ${fmtDollars(rec.inputCost)}, output: ${fmtDollars(rec.outputCost)})`);
    }
    if (fb) {
      console.log(`    Fallback:     ${fb.model} (${fb.provider}, tier ${fb.tier} ${fb.tierLabel}) -- ${fmtDollars(fb.totalCost)}`);
    }
    console.log(`    If Opus:      ${fmtDollars(opusCost)}`);
    console.log('');
  }

  // Summary
  console.log(divider('='));
  console.log('  SUMMARY');
  console.log(divider('='));
  console.log('');
  console.log(`  Phases:              ${summary.phaseCount}`);
  console.log(`  Total (cheapest):    ${fmtDollars(summary.totalCheapest)}`);
  console.log(`  Total (fallback):    ${fmtDollars(summary.totalFallback)}`);
  console.log(`  Total (all Opus):    ${fmtDollars(summary.totalOpus)}`);
  console.log(`  Savings vs Opus:     ${summary.savingsPercent}%`);
  console.log('');

  // Model pricing reference
  console.log(divider('-'));
  console.log('  MODEL PRICING REFERENCE (per 1M tokens, March 2026)');
  console.log(divider('-'));

  const models = getModels();
  const modelRows = models.map(m => [
    m.name,
    m.provider,
    padR(fmtDollars(m.inputPer1M), 8),
    padR(fmtDollars(m.outputPer1M), 9),
    `${m.tier} (${TIER_LABELS[m.tier]})`,
  ]);

  printTable(
    ['Model', 'Provider', 'Input/$1M', 'Output/$1M', 'Tier'],
    modelRows,
    [24, 10, 10, 11, 18],
  );
  console.log('');
};

run().catch(err => {
  console.error('[cost-analyze] Fatal error:', err.message);
  console.error(err.stack);
  process.exit(1);
});
