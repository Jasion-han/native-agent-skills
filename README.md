# Agent Skills

Custom skills for AI coding agents (compatible with Claude Code, OpenCode, Codex CLI, and similar tools).

## Available Skills

| Skill | Description |
|-------|-------------|
| [browser-tools](browser-tools/SKILL.md) | Interactive browser automation via Chrome DevTools Protocol |

## Installation

### Claude Code

Claude Code only looks one level deep for `SKILL.md` files, so each skill folder must be directly under the skills directory. Clone the repo somewhere, then symlink individual skills:

```
# Clone to a convenient location
git clone https://github.com/Jasion-han/agent-skills ~/agent-skills

# Symlink individual skills (user-level)
mkdir -p ~/.claude/skills
ln -s ~/agent-skills/browser-tools ~/.claude/skills/browser-tools

# Or project-level
mkdir -p .claude/skills
ln -s ~/agent-skills/browser-tools .claude/skills/browser-tools
```

### OpenCode

```
/add-dir ~/agent-skills
```

Then use `@browser-tools/SKILL.md` to reference the skill documentation.

### Codex CLI

```
git clone https://github.com/Jasion-han/agent-skills ~/.codex/skills/agent-skills
```

## Skill Format

Each skill follows the standard format:

```
---
name: skill-name
description: Short description shown to agent
---

# Instructions

Detailed instructions here...
Helper files available at: {baseDir}/
```

The `{baseDir}` placeholder is replaced with the skill's directory path at runtime.

## Requirements

- **browser-tools**: Requires Chrome and Node.js. Run `npm install` in the skill directory.

## License

MIT
