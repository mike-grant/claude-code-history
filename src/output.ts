/**
 * Output formatters for search results
 */

import { SearchOutput, OutputFormat } from './types.js';

/**
 * Format search results as JSON
 */
export function formatJson(results: SearchOutput, compact: boolean = false): string {
  return JSON.stringify(results, null, compact ? 0 : 2);
}

/**
 * Format search results in human-readable pretty format
 */
export function formatPretty(results: SearchOutput): string {
  const lines: string[] = [];

  // Header
  lines.push(`Search Results for "${results.query}" in ${results.project}`);
  lines.push(`Found ${results.totalResults} results in ${results.filesSearched} conversation files`);
  lines.push('');

  // No results
  if (results.results.length === 0) {
    lines.push('No results found.');
    return lines.join('\n');
  }

  // Results
  results.results.forEach((result, index) => {
    lines.push('─'.repeat(65));
    lines.push(`Result ${index + 1} of ${results.results.length}`);
    lines.push(`Date: ${formatTimestamp(result.timestamp)}`);
    lines.push(`Type: ${result.type}`);
    lines.push(`Session: ${result.sessionId}`);
    lines.push('');

    // Excerpt
    lines.push(wrapText(result.excerpt, 65));
    lines.push('');

    // Metadata
    if (result.metadata.gitBranch) {
      lines.push(`Branch: ${result.metadata.gitBranch}`);
    }
    if (result.metadata.cwd) {
      lines.push(`CWD: ${result.metadata.cwd}`);
    }
    if (result.metadata.model) {
      lines.push(`Model: ${result.metadata.model}`);
    }

    lines.push('');
  });

  lines.push('─'.repeat(65));

  return lines.join('\n');
}

/**
 * Format output based on specified format
 */
export function formatOutput(results: SearchOutput, format: OutputFormat): string {
  switch (format) {
    case 'json':
      return formatJson(results, false);
    case 'compact':
      return formatJson(results, true);
    case 'pretty':
      return formatPretty(results);
    default:
      return formatJson(results, false);
  }
}

/**
 * Format timestamp as readable date/time
 */
function formatTimestamp(timestamp: string): string {
  const date = new Date(timestamp);
  return date.toLocaleString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });
}

/**
 * Wrap text to specified width
 */
function wrapText(text: string, width: number): string {
  const words = text.split(' ');
  const lines: string[] = [];
  let currentLine = '';

  for (const word of words) {
    if ((currentLine + ' ' + word).length <= width) {
      currentLine += (currentLine ? ' ' : '') + word;
    } else {
      if (currentLine) {
        lines.push(currentLine);
      }
      currentLine = word;
    }
  }

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.join('\n');
}
