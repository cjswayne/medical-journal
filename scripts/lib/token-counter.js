'use strict';

const fs = require('fs');
const path = require('path');
const { glob } = require('glob');
const { getEncoding } = require('js-tiktoken');

// cl100k_base covers GPT-4/3.5 tokenization; close enough for estimation
let encoder = null;
const getEncoder = () => {
  if (!encoder) encoder = getEncoding('cl100k_base');
  return encoder;
};

// Extensions worth counting -- skip binaries, images, lockfiles
const COUNTABLE_EXTENSIONS = new Set([
  '.js', '.jsx', '.ts', '.tsx', '.mjs', '.cjs',
  '.json', '.css', '.html', '.md', '.mdc',
  '.env', '.yml', '.yaml', '.toml',
  '.sh', '.bash',
]);

const IGNORE_PATTERNS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/.git/**',
  '**/package-lock.json',
  '**/yarn.lock',
  '**/pnpm-lock.yaml',
  '**/*.map',
];

// Count tokens in a single string
const countTokens = (text) => {
  try {
    return getEncoder().encode(text).length;
  } catch (err) {
    console.error(`[token-counter] Encoding error: ${err.message}`);
    // Rough fallback: ~4 chars per token
    return Math.ceil(text.length / 4);
  }
};

// Walk repo, count tokens per file, return sorted results
const countRepoTokens = async (rootDir) => {
  const pattern = '**/*';
  const files = await glob(pattern, {
    cwd: rootDir,
    nodir: true,
    ignore: IGNORE_PATTERNS,
    absolute: false,
  });

  const results = [];
  let totalTokens = 0;
  let skippedCount = 0;

  for (const relPath of files) {
    const ext = path.extname(relPath).toLowerCase();
    // Also count extensionless dotfiles like .env
    const basename = path.basename(relPath);
    const isDotfile = basename.startsWith('.') && !ext;

    if (!COUNTABLE_EXTENSIONS.has(ext) && !isDotfile) {
      skippedCount++;
      continue;
    }

    const absPath = path.join(rootDir, relPath);
    try {
      const content = fs.readFileSync(absPath, 'utf-8');
      const tokens = countTokens(content);
      results.push({ file: relPath, tokens, bytes: Buffer.byteLength(content) });
      totalTokens += tokens;
    } catch (err) {
      console.error(`[token-counter] Could not read ${relPath}: ${err.message}`);
    }
  }

  // Sort largest first
  results.sort((a, b) => b.tokens - a.tokens);

  return { files: results, totalTokens, fileCount: results.length, skippedCount };
};

// Count tokens for a specific list of file paths (relative to rootDir)
const countFileListTokens = (rootDir, filePaths) => {
  let total = 0;
  const breakdown = [];

  for (const relPath of filePaths) {
    const absPath = path.join(rootDir, relPath);
    try {
      if (!fs.existsSync(absPath)) {
        // File does not exist yet -- estimate by path heuristics
        breakdown.push({ file: relPath, tokens: 0, exists: false });
        continue;
      }
      const content = fs.readFileSync(absPath, 'utf-8');
      const tokens = countTokens(content);
      breakdown.push({ file: relPath, tokens, exists: true });
      total += tokens;
    } catch (err) {
      console.error(`[token-counter] Could not read ${relPath}: ${err.message}`);
      breakdown.push({ file: relPath, tokens: 0, exists: false });
    }
  }

  return { totalTokens: total, breakdown };
};

module.exports = { countTokens, countRepoTokens, countFileListTokens };
