#!/usr/bin/env bun

/**
 * Build standalone binaries for multiple platforms
 * Run with: bun run scripts/build-binaries.ts
 */

import { $ } from 'bun';
import { mkdir } from 'fs/promises';
import { existsSync } from 'fs';

const version = process.env.VERSION || '1.0.0';
const distDir = 'dist-binaries';

// Ensure dist directory exists
if (!existsSync(distDir)) {
  await mkdir(distDir, { recursive: true });
}

console.log('🔨 Building binaries...\n');

// Define target platforms
const targets = [
  { name: 'darwin-arm64', platform: 'darwin', arch: 'arm64' },
  { name: 'darwin-x64', platform: 'darwin', arch: 'x64' },
  { name: 'linux-arm64', platform: 'linux', arch: 'arm64' },
  { name: 'linux-x64', platform: 'linux', arch: 'x64' },
];

for (const target of targets) {
  const outputName = `${distDir}/claude-code-history-${target.name}`;

  console.log(`Building ${target.name}...`);

  try {
    // Bun compile with target specification
    await $`bun build src/index.ts --compile --target=bun-${target.platform}-${target.arch} --outfile ${outputName}`;

    console.log(`✅ ${target.name} built successfully`);
  } catch (error) {
    console.error(`❌ Failed to build ${target.name}:`, error);
  }
}

console.log('\n✨ All binaries built successfully!');
console.log(`\nBinaries located in: ${distDir}/`);
console.log('\nFile sizes:');
await $`ls -lh ${distDir}/`;
