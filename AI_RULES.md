# AI Agent Rules - Terminal Execution Preference

## Global Rule: Always Use Terminal (Not Sandbox)

**Scope:** All projects in this workspace

**Rule:** When the AI assistant needs to execute commands and is presented with the choice between "run in sandbox" and "run in terminal", it MUST ALWAYS choose "run in terminal".

### Why This Rule Exists:

1. **Full System Access**: Terminal provides unrestricted access needed for:
   - Building projects (`npm run build`)
   - Git operations (`git push`, `git pull`)
   - File operations outside workspace directory
   - Package management (`npm install`, `pip install`)
   - Process management (`pm2 restart`, `systemctl`)

2. **No Permission Restrictions**: Sandbox has limitations that can cause failures:
   - Cannot write outside workspace
   - Restricted file system access
   - Limited network access
   - Permission denied errors

3. **Better Compatibility**: Most development tools expect full terminal access:
   - Build tools (webpack, vite, next.js)
   - Database migrations
   - Docker commands
   - Server deployment scripts

### Implementation:

When executing ANY command via `run_in_terminal` tool:
- Set `required_permissions='all'` when sandbox restrictions cause failures
- Do NOT use sandbox mode for any command
- Always prefer direct terminal execution

### Examples:

✅ **Correct:**
```python
run_in_terminal(
    command="npm run build",
    required_permissions='all'
)
```

❌ **Incorrect:**
```python
run_in_terminal(
    command="npm run build"
    # Missing required_permissions, will fail in sandbox
)
```

### Exceptions:

**None.** This rule applies to ALL commands in ALL projects without exception.

---

**Last Updated:** 2026-04-28
**Applies To:** chinahuib2b and all future projects
