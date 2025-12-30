/**
 * Type definitions for Claude Code conversation history
 */

export interface MessageContent {
  type: 'text' | 'tool_use' | 'tool_result' | 'thinking' | 'image';
  text?: string;
  thinking?: string;
  tool_use_id?: string;
  name?: string;
  input?: Record<string, any>;
  content?: string | any[];
  is_error?: boolean;
  [key: string]: any;
}

export interface ConversationMessage {
  type: 'user' | 'assistant' | 'tool_result' | 'summary' | 'file-history-snapshot' | 'system';
  uuid: string;
  parentUuid?: string | null;
  timestamp: string;
  cwd?: string;
  gitBranch?: string;
  sessionId?: string;
  agentId?: string;
  message?: {
    role?: 'user' | 'assistant';
    content?: string | MessageContent[];
    model?: string;
    [key: string]: any;
  };
  requestId?: string;
  isSidechain?: boolean;
  userType?: string;
  version?: string;
  [key: string]: any;
}

export interface SearchResult {
  uuid: string;
  timestamp: string;
  type: 'user' | 'assistant' | 'tool_result';
  content: string;
  excerpt: string;
  sessionId: string;
  conversationFile: string;
  metadata: {
    cwd?: string;
    gitBranch?: string;
    agentId?: string;
    model?: string;
    parentUuid?: string;
  };
  matchScore: number;
}

export interface SearchOutput {
  query: string;
  project: string;
  projectPath: string;
  totalResults: number;
  filesSearched: number;
  results: SearchResult[];
}

export interface SearchOptions {
  limit?: number;
  context?: number;
  regex?: boolean;
  after?: Date;
  before?: Date;
  projectPath?: string;
  messageTypes?: ('user' | 'assistant' | 'tool_result')[];
}

export type OutputFormat = 'json' | 'pretty' | 'compact';
