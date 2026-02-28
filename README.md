# Native Agent Skills

Lightweight alternatives to MCP servers. Use Bash scripts and code instead of heavy MCP tools to save tokens and gain more flexibility.

## Why Native Skills?

- **Token Efficient**: Only ~225 tokens vs 13000+ for MCP servers
- **Highly Customizable**: Modify scripts as needed without understanding complex MCP codebases
- **Composable**: Chain commands, save outputs to files, and combine with other tools
- **No Overhead**: Direct execution without MCP protocol overhead

## Available Skills

| Skill | Description |
|-------|-------------|
| [browser-tools](browser-tools/SKILL.md) | Browser automation via Chrome DevTools Protocol - lightweight alternative to Playwright/Chrome DevTools MCP |
| [web-search](web-search/SKILL.md) | Web search and content extraction - lightweight alternative to search MCP |

## Installation

### Claude Code

```
# Clone to a convenient location
git clone https://github.com/Jasion-han/native-agent-skills ~/native-agent-skills

# Symlink individual skills (user-level)
mkdir -p ~/.claude/skills
ln -s ~/native-agent-skills/browser-tools ~/.claude/skills/browser-tools

# Or project-level
mkdir -p .claude/skills
ln -s ~/native-agent-skills/browser-tools .claude/skills/browser-tools
```

### OpenCode

```
/add-dir ~/native-agent-skills
```

Then use `@browser-tools/SKILL.md` or `@web-search/SKILL.md` to reference the skill documentation.

### Codex CLI

```
git clone https://github.com/Jasion-han/native-agent-skills ~/.codex/skills/native-agent-skills
```

## Adding New Skills

Each skill is a folder containing:
- `SKILL.md` - Skill definition and documentation
- `*.js` - Executable scripts
- `package.json` - Dependencies (if needed)

See [browser-tools](browser-tools/) as an example.

## Requirements

- **browser-tools**: Requires Chrome and Node.js. Run `npm install` in the skill directory.
- **web-search**: Requires Brave Search API key. See [web-search/SKILL.md](web-search/SKILL.md) for setup instructions.

## License

MIT
