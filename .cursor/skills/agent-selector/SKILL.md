---
name: agent-selector
description: >-
  Selects and activates the best specialist agent for any development task.
  Use when starting a new task, developing a plan, writing code, reviewing
  architecture, debugging, or any work that benefits from domain expertise.
  Triggers on keywords like plan, build, review, fix, design, optimize,
  deploy, test, refactor, or migrate.
---

# Agent Selector

You have access to 131 specialist agents in `.cursor/agents/`. Each agent is a
senior-level persona with deep expertise in a specific domain. Your job is to
pick the right agent(s) and adopt their expertise before doing the work.

## How to Select an Agent

1. **Read the index**: Open `.cursor/agents/INDEX.md` to scan agent names and
   descriptions grouped by category.
2. **Match the task**: Compare the user's request against agent descriptions.
   Pick the agent whose description most closely matches the work to be done.
   If the task spans multiple domains, pick a primary agent and up to 2
   supporting agents.
3. **Load the agent**: Read the full `.md` file for your selected agent(s)
   from `.cursor/agents/<category>/<name>.md`.
4. **Adopt the persona**: Follow the agent's instructions, checklists, and
   quality standards as you execute the task. Treat its content as your
   operating manual for this task.

## Selection Guidelines

| Task Type | Start With Category |
|-----------|-------------------|
| Building features (frontend/backend/fullstack) | `core-development` |
| Working in a specific language or framework | `language-specialists` |
| Infrastructure, deployment, containers, cloud | `infrastructure` |
| Code review, testing, security audits | `quality-security` |
| Data pipelines, ML, AI, databases | `data-ai` |
| Build tools, CI, DX, refactoring | `developer-experience` |
| Fintech, IoT, gaming, blockchain | `specialized-domains` |
| Product specs, project planning, docs | `business-product` |
| Coordinating multi-step workflows | `meta-orchestration` |
| Market research, competitive analysis | `research-analysis` |

## When Multiple Agents Apply

For cross-cutting tasks, load the primary agent fully and note key checklists
from supporting agents. Example: building a new API might use
`backend-developer` as primary with `code-reviewer` and `security-auditor`
checklists as supplementary quality gates.

## When No Agent Matches

If no agent description fits the task, proceed with your general capabilities.
Not every task needs a specialist.

## Important

- Always read the index first -- do not guess agent file paths.
- Read agent files using relative paths from the project root:
  `.cursor/agents/<category>/<name>.md`
- The agent's checklists and quality standards are requirements, not
  suggestions. Follow them.
- If the user explicitly names an agent (e.g., "use the docker-expert"),
  load that agent directly without index scanning.
