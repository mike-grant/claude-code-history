/**
 * Core search engine for Claude Code conversation history
 */

import * as path from 'path';
import {
  ConversationMessage,
  SearchOptions,
  SearchOutput,
  SearchResult
} from './types.js';
import {
  getCurrentProject,
  getProjectJsonlFiles,
  getProjectName,
  projectDirectoryExists
} from './path-utils.js';
import {
  parseJsonlFile,
  extractMessageContent,
  getMessageType
} from './parser.js';

/**
 * Search conversation history for a query
 */
export async function searchHistory(
  query: string,
  options: SearchOptions = {}
): Promise<SearchOutput> {
  const {
    limit = 20,
    context = 150,
    regex = false,
    after,
    before,
    projectPath = getCurrentProject(),
    messageTypes = ['user', 'assistant', 'tool_result']
  } = options;

  // Check if project directory exists
  if (!projectDirectoryExists(projectPath)) {
    return {
      query,
      project: getProjectName(projectPath),
      projectPath,
      totalResults: 0,
      filesSearched: 0,
      results: []
    };
  }

  // Get all JSONL files for the project
  const jsonlFiles = getProjectJsonlFiles(projectPath);

  if (jsonlFiles.length === 0) {
    return {
      query,
      project: getProjectName(projectPath),
      projectPath,
      totalResults: 0,
      filesSearched: 0,
      results: []
    };
  }

  // Search pattern (regex or substring)
  let searchPattern: RegExp;
  if (regex) {
    try {
      searchPattern = new RegExp(query, 'i');
    } catch (err) {
      throw new Error(`Invalid regex pattern: ${query}`);
    }
  } else {
    // Escape special regex characters for literal search
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    searchPattern = new RegExp(escapedQuery, 'i');
  }

  // Search all files
  const allResults: SearchResult[] = [];

  for (const filePath of jsonlFiles) {
    const fileName = path.basename(filePath);

    for await (const message of parseJsonlFile(filePath)) {
      // Filter by message type
      const msgType = getMessageType(message);
      if (!messageTypes.includes(msgType)) {
        continue;
      }

      // Filter by date range
      if (after || before) {
        const msgDate = new Date(message.timestamp);
        if (after && msgDate < after) continue;
        if (before && msgDate > before) continue;
      }

      // Extract and search content
      const content = extractMessageContent(message);
      if (!content || !searchPattern.test(content)) {
        continue;
      }

      // Extract excerpt with context
      const excerpt = extractExcerpt(content, searchPattern, context);

      // Calculate match score
      const score = calculateMatchScore(message, content, query);

      // Create search result
      const result: SearchResult = {
        uuid: message.uuid,
        timestamp: message.timestamp,
        type: msgType,
        content,
        excerpt,
        sessionId: message.sessionId || 'unknown',
        conversationFile: fileName,
        metadata: {
          cwd: message.cwd,
          gitBranch: message.gitBranch,
          agentId: message.agentId,
          model: message.message?.model,
          parentUuid: message.parentUuid || undefined
        },
        matchScore: score
      };

      allResults.push(result);
    }
  }

  // Sort by score (descending) and recency (descending)
  allResults.sort((a, b) => {
    if (Math.abs(a.matchScore - b.matchScore) > 0.01) {
      return b.matchScore - a.matchScore;
    }
    return new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime();
  });

  // Apply limit
  const limitedResults = allResults.slice(0, limit);

  return {
    query,
    project: getProjectName(projectPath),
    projectPath,
    totalResults: allResults.length,
    filesSearched: jsonlFiles.length,
    results: limitedResults
  };
}

/**
 * Extract excerpt from content with context around the match
 */
function extractExcerpt(content: string, pattern: RegExp, contextChars: number): string {
  const match = pattern.exec(content);

  if (!match) {
    // Fallback: return beginning of content
    return content.substring(0, contextChars * 2) + (content.length > contextChars * 2 ? '...' : '');
  }

  const matchStart = match.index;
  const matchEnd = matchStart + match[0].length;

  // Calculate context boundaries
  const start = Math.max(0, matchStart - contextChars);
  const end = Math.min(content.length, matchEnd + contextChars);

  // Extract excerpt
  let excerpt = content.substring(start, end);

  // Add ellipsis
  if (start > 0) {
    excerpt = '...' + excerpt;
  }
  if (end < content.length) {
    excerpt = excerpt + '...';
  }

  return excerpt;
}

/**
 * Calculate match score based on relevance and other factors
 */
function calculateMatchScore(
  message: ConversationMessage,
  content: string,
  query: string
): number {
  let score = 0.5; // Base score

  // Boost user messages (more likely to be relevant queries)
  if (message.message?.role === 'user') {
    score += 0.2;
  }

  // Boost recent messages (within last 30 days)
  const msgDate = new Date(message.timestamp);
  const now = new Date();
  const daysDiff = (now.getTime() - msgDate.getTime()) / (1000 * 60 * 60 * 24);

  if (daysDiff < 7) {
    score += 0.2;
  } else if (daysDiff < 30) {
    score += 0.1;
  }

  // Boost if query appears multiple times
  const queryLower = query.toLowerCase();
  const contentLower = content.toLowerCase();
  const occurrences = (contentLower.match(new RegExp(queryLower.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;

  if (occurrences > 1) {
    score += Math.min(0.3, occurrences * 0.05);
  }

  return Math.min(1.0, score);
}
