/**
 * CLI interface for claude-history
 */

import { Command } from 'commander';
import { searchHistory } from './search.js';
import { formatOutput } from './output.js';
import { OutputFormat, SearchOptions } from './types.js';

const program = new Command();

export async function runCli(): Promise<void> {
  program
    .name('claude-history')
    .description('Search Claude Code conversation history')
    .version('1.0.0')
    .argument('<query>', 'Search query string')
    .option('-l, --limit <number>', 'Maximum number of results to return', '20')
    .option('-c, --context <number>', 'Characters of context around match', '150')
    .option('-r, --regex', 'Treat query as regex pattern', false)
    .option('-p, --project <path>', 'Project path (default: current directory)')
    .option('--after <date>', 'Only show messages after this date (ISO format)')
    .option('--before <date>', 'Only show messages before this date (ISO format)')
    .option('-t, --type <types>', 'Message types to search (comma-separated: user,assistant,tool_result)', 'user,assistant,tool_result')
    .option('-f, --format <format>', 'Output format (json|pretty|compact)', 'json')
    .action(async (query: string, options: any) => {
      try {
        // Parse options
        const searchOptions: SearchOptions = {
          limit: parseInt(options.limit, 10),
          context: parseInt(options.context, 10),
          regex: options.regex,
          projectPath: options.project
        };

        // Parse date filters
        if (options.after) {
          searchOptions.after = new Date(options.after);
          if (isNaN(searchOptions.after.getTime())) {
            throw new Error(`Invalid date format for --after: ${options.after}`);
          }
        }

        if (options.before) {
          searchOptions.before = new Date(options.before);
          if (isNaN(searchOptions.before.getTime())) {
            throw new Error(`Invalid date format for --before: ${options.before}`);
          }
        }

        // Parse message types
        if (options.type) {
          const types = options.type.split(',').map((t: string) => t.trim());
          const validTypes = ['user', 'assistant', 'tool_result'];

          for (const type of types) {
            if (!validTypes.includes(type)) {
              throw new Error(`Invalid message type: ${type}. Valid types: ${validTypes.join(', ')}`);
            }
          }

          searchOptions.messageTypes = types as ('user' | 'assistant' | 'tool_result')[];
        }

        // Validate format
        const format = options.format as OutputFormat;
        if (!['json', 'pretty', 'compact'].includes(format)) {
          throw new Error(`Invalid format: ${format}. Valid formats: json, pretty, compact`);
        }

        // Perform search
        const results = await searchHistory(query, searchOptions);

        // Format and output results
        const output = formatOutput(results, format);
        console.log(output);

      } catch (error) {
        if (error instanceof Error) {
          console.error(`Error: ${error.message}`);
        } else {
          console.error('An unexpected error occurred');
        }
        process.exit(1);
      }
    });

  await program.parseAsync(process.argv);
}
