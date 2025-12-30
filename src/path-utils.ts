/**
 * Path encoding/decoding utilities for Claude Code project directories
 */

import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

/**
 * Encode a file system path to Claude Code's directory naming format
 * Example: /Users/mike/Desktop/Repos/scrapezy -> -Users-mike-Desktop-Repos-scrapezy
 */
export function encodePath(fsPath: string): string {
  // Normalize and resolve to absolute path
  const absolutePath = path.resolve(fsPath);

  // Replace all path separators with hyphens
  // Split by separator, filter out empty strings, join with hyphens, and add leading hyphen
  const parts = absolutePath.split(path.sep).filter(Boolean);
  return '-' + parts.join('-');
}

/**
 * Decode a Claude Code directory name back to a file system path
 * Example: -Users-mike-Desktop-Repos-scrapezy -> /Users/mike/Desktop/Repos/scrapezy
 */
export function decodePath(encodedPath: string): string {
  // Remove leading hyphen if present
  const withoutLeadingHyphen = encodedPath.startsWith('-')
    ? encodedPath.slice(1)
    : encodedPath;

  // Split by hyphen and join with path separator
  const parts = withoutLeadingHyphen.split('-').filter(Boolean);

  // Reconstruct absolute path
  return path.sep + path.join(...parts);
}

/**
 * Get the current working directory
 */
export function getCurrentProject(): string {
  return process.cwd();
}

/**
 * Get the Claude Code project directory for a given file system path
 */
export function getClaudeProjectDir(fsPath: string): string {
  const homeDir = os.homedir();
  const claudeDir = path.join(homeDir, '.claude', 'projects');
  const encodedPath = encodePath(fsPath);

  return path.join(claudeDir, encodedPath);
}

/**
 * Check if a Claude Code project directory exists for the given path
 */
export function projectDirectoryExists(fsPath: string): boolean {
  const projectDir = getClaudeProjectDir(fsPath);

  try {
    return fs.existsSync(projectDir) && fs.statSync(projectDir).isDirectory();
  } catch (err) {
    return false;
  }
}

/**
 * Get all JSONL files in the Claude Code project directory
 */
export function getProjectJsonlFiles(fsPath: string): string[] {
  const projectDir = getClaudeProjectDir(fsPath);

  if (!projectDirectoryExists(fsPath)) {
    return [];
  }

  try {
    const files = fs.readdirSync(projectDir);
    return files
      .filter(file => file.endsWith('.jsonl'))
      .map(file => path.join(projectDir, file));
  } catch (err) {
    return [];
  }
}

/**
 * Extract project name from path (last directory name)
 */
export function getProjectName(fsPath: string): string {
  return path.basename(path.resolve(fsPath));
}
