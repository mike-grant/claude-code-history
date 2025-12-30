/**
 * JSONL stream parser for Claude Code conversation files
 */

import { createReadStream } from 'fs';
import { createInterface } from 'readline';
import { ConversationMessage } from './types.js';

/**
 * Parse a JSONL file and yield messages one at a time
 * Uses streaming to handle large files efficiently
 */
export async function* parseJsonlFile(filePath: string): AsyncGenerator<ConversationMessage> {
  const fileStream = createReadStream(filePath, { encoding: 'utf8' });
  const rl = createInterface({
    input: fileStream,
    crlfDelay: Infinity
  });

  for await (const line of rl) {
    // Skip empty lines
    if (!line.trim()) {
      continue;
    }

    try {
      const message = JSON.parse(line) as ConversationMessage;
      yield message;
    } catch (err) {
      // Skip malformed JSON lines
      // Could log error in verbose mode if needed
      continue;
    }
  }
}

/**
 * Extract searchable text content from a message
 */
export function extractMessageContent(message: ConversationMessage): string {
  const contents: string[] = [];

  // Handle user messages
  if (message.message?.role === 'user') {
    if (typeof message.message.content === 'string') {
      contents.push(message.message.content);
    } else if (Array.isArray(message.message.content)) {
      for (const item of message.message.content) {
        if (item.type === 'text' && item.text) {
          contents.push(item.text);
        }
      }
    }
  }

  // Handle assistant messages
  if (message.message?.role === 'assistant') {
    if (Array.isArray(message.message.content)) {
      for (const item of message.message.content) {
        if (item.type === 'text' && item.text) {
          contents.push(item.text);
        }
        if (item.type === 'thinking' && item.thinking) {
          contents.push(item.thinking);
        }
      }
    }
  }

  // Handle tool results
  if (message.type === 'tool_result') {
    if (typeof message.message === 'string') {
      contents.push(message.message);
    } else if (message.message && typeof message.message === 'object') {
      const msg = message.message as any;
      if (msg.content) {
        if (typeof msg.content === 'string') {
          contents.push(msg.content);
        } else if (Array.isArray(msg.content)) {
          for (const item of msg.content) {
            if (item.type === 'text' && item.text) {
              contents.push(item.text);
            }
          }
        }
      }
    }
  }

  return contents.join(' ');
}

/**
 * Determine the message type for search results
 */
export function getMessageType(message: ConversationMessage): 'user' | 'assistant' | 'tool_result' {
  if (message.message?.role === 'user') {
    return 'user';
  }
  if (message.message?.role === 'assistant') {
    return 'assistant';
  }
  if (message.type === 'tool_result') {
    return 'tool_result';
  }
  // Default to assistant for other types
  return 'assistant';
}
