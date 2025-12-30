#!/usr/bin/env bun

/**
 * claude-history - CLI tool to search Claude Code conversation history
 */

import { runCli } from './cli.js';

// Run the CLI
runCli().catch((error) => {
  console.error('Fatal error:', error.message);
  process.exit(1);
});
