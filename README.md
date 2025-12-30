# claude-history

🔍 A CLI tool to search your Claude Code conversation history

## Features

- 🚀 **Fast standalone binary** - No runtime dependencies required
- 🔎 **Full-text search** - Search across all your Claude Code conversations
- 📅 **Date filtering** - Find conversations from specific time periods
- 🎯 **Regex support** - Use regular expressions for complex queries
- 💾 **Auto-detection** - Automatically finds the current project's history
- 📊 **Multiple output formats** - JSON, pretty-printed, or compact

## Installation

### Homebrew (macOS - Recommended)

```bash
# Add the tap
brew tap mike-grant/tap

# Install claude-code-history
brew install claude-code-history
```

### Manual Installation

Download the latest binary from [releases](https://github.com/mike-grant/claude-code-history/releases):

**macOS:**
```bash
# Apple Silicon
curl -L https://github.com/mike-grant/claude-code-history/releases/latest/download/claude-code-history-darwin-arm64 -o claude-code-history

# Intel
curl -L https://github.com/mike-grant/claude-code-history/releases/latest/download/claude-code-history-darwin-x64 -o claude-code-history

# Make executable and move to PATH
chmod +x claude-code-history
sudo mv claude-code-history /usr/local/bin/
```

**Linux:**
```bash
# ARM64
curl -L https://github.com/mike-grant/claude-code-history/releases/latest/download/claude-code-history-linux-arm64 -o claude-code-history

# x64
curl -L https://github.com/mike-grant/claude-code-history/releases/latest/download/claude-code-history-linux-x64 -o claude-code-history

# Make executable and move to PATH
chmod +x claude-code-history
sudo mv claude-code-history /usr/local/bin/
```

## Usage

### Basic Search

Search your current project's conversation history:

```bash
claude-code-history "search query"
```

### Examples

**Search with pretty output:**
```bash
claude-code-history "bug fix" -f pretty -l 5
```

**Search with regex:**
```bash
claude-code-history "error.*handling" --regex
```

**Search specific date range:**
```bash
claude-code-history "deployment" --after "2025-12-01" --before "2025-12-31"
```

**Search only user messages:**
```bash
claude-code-history "how do I" -t user
```

**Search specific project:**
```bash
claude-code-history "api endpoint" -p /path/to/project
```

## Command-Line Options

```
Usage: claude-code-history <query> [options]

Arguments:
  query                         Search query string

Options:
  -p, --project <path>         Project path (default: current directory)
  -l, --limit <number>         Maximum number of results (default: 20)
  -c, --context <number>       Characters of context around match (default: 150)
  -r, --regex                  Treat query as regex pattern
  --after <date>               Only messages after this date (ISO format)
  --before <date>              Only messages before this date (ISO format)
  -t, --type <types>           Message types: user,assistant,tool_result
                               (default: "user,assistant,tool_result")
  -f, --format <format>        Output format: json|pretty|compact (default: "json")
  -h, --help                   Display help
  -V, --version                Display version
```

## How It Works

Claude Code stores conversation history in `~/.claude/projects/` using path-encoded directory names:

```
/Users/you/projects/my-app
  ↓
~/.claude/projects/-Users-you-projects-my-app/
```

`claude-history` automatically:
1. Detects your current project directory
2. Encodes the path to match Claude's format
3. Searches all conversation `.jsonl` files
4. Returns ranked, relevant results

## Output Formats

### JSON (default)
Machine-readable format for scripting:
```json
{
  "query": "search term",
  "totalResults": 5,
  "results": [...]
}
```

### Pretty
Human-readable format:
```
Search Results for "search term" in my-project
Found 5 results in 3 conversation files

─────────────────────────────────────────────────────
Result 1 of 5
Date: 12/30/2025, 16:32:25
Type: user

...excerpt with search term highlighted...
─────────────────────────────────────────────────────
```

### Compact
Minified JSON (one line):
```json
{"query":"...","totalResults":5,"results":[...]}
```

## Development

Built with [Bun](https://bun.sh) for fast compilation and runtime.

### Setup

```bash
# Install Bun
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install

# Run in development
bun src/index.ts "search query" -f pretty
```

### Building

```bash
# Build single binary for current platform
bun run build:binary

# Build binaries for all platforms (macOS & Linux)
bun run build:binaries
```

Binaries are output to `dist-binaries/`:
- `claude-history-darwin-arm64` (macOS Apple Silicon)
- `claude-history-darwin-x64` (macOS Intel)
- `claude-history-linux-arm64` (Linux ARM64)
- `claude-history-linux-x64` (Linux x64)

### Project Structure

```
claude-code-history/
├── src/
│   ├── index.ts       # Entry point
│   ├── cli.ts         # CLI interface
│   ├── search.ts      # Search engine
│   ├── parser.ts      # JSONL parser
│   ├── path-utils.ts  # Path encoding
│   ├── output.ts      # Output formatters
│   └── types.ts       # TypeScript types
├── scripts/
│   └── build-binaries.ts  # Multi-platform build script
└── .github/
    └── workflows/
        └── release.yml    # Auto-build on git tags
```

## Publishing a Release

1. Update version in `package.json`
2. Create and push a git tag:
   ```bash
   git tag v1.0.0
   git push origin v1.0.0
   ```
3. GitHub Actions will automatically:
   - Build binaries for all platforms
   - Create a GitHub release
   - Upload binaries and checksums

## License

MIT

## Contributing

Contributions welcome! Please open an issue or PR.
