# CLI Safety & Command Execution Rules

## Core Principles

1. **Verify Before Suggesting**: Always check `package.json` scripts and tool documentation before suggesting CLI commands
2. **No Flag Hallucination**: Only use flags that are officially documented for the specific tool version
3. **Learn From Errors**: If a command fails, analyze the error and adjust - never repeat the same failing command
4. **Explicit Reasoning**: When a command fails, explain why before trying again

## Jest-Specific Rules (CRITICAL)

### ❌ Common Hallucination: `--run` Flag

**Jest does NOT have a `--run` flag.** This is a Vitest/Playwright pattern that does not apply to Jest.

### ✅ Valid Jest Flags

- `--runInBand` - Run tests serially (one at a time)
- `--watch` - Watch mode for development
- `--coverage` - Generate coverage report
- `--verbose` - Detailed test output
- `--testNamePattern="pattern"` - Filter tests by name
- `--bail` - Stop on first failure
- `--detectOpenHandles` - Debug async operations

### ✅ Running Jest Tests Correctly

```bash
# Run all tests
npm test

# Run specific test file
npm test -- auth.service.test.ts

# Run serially (for database/integration tests)
npm test -- auth.service.test.ts --runInBand

# Run with verbose output
npm test -- auth.service.test.ts --verbose

# Filter by test name
npm test -- --testNamePattern="should validate token"

# Multiple flags
npm test -- auth.service.test.ts --runInBand --verbose
```

## Database Test Requirements

When running tests that interact with the database:

1. **Always use `--runInBand`** to prevent race conditions
2. **Never use `--watch`** in automated contexts
3. **Verify migrations** are applied before running tests
4. **Check connection** to PostgreSQL and Redis if needed

Example:
```bash
npm test -- __tests__/database-roundtrip.test.ts --runInBand
```

## Command Failure Protocol

If a CLI command fails:

1. **Read the error message carefully** - it usually tells you what's wrong
2. **Explain the failure** - don't just try again silently
3. **Check the tool's help** - run `<tool> --help` if unsure about flags
4. **Verify package.json** - ensure the script exists and is configured correctly
5. **Adjust and retry** - modify the command based on the error, don't repeat it

### Example Error Pattern

```
❌ BAD:
Command: npm test -- file.test.ts --run
Error: Unknown option '--run'
Action: Trying npm test -- file.test.ts --run again...

✅ GOOD:
Command: npm test -- file.test.ts --run
Error: Unknown option '--run'
Analysis: Jest doesn't support --run flag. This is a Vitest pattern.
Action: Running npm test -- file.test.ts (Jest runs once by default)
```

## Tool-Specific Flag Reference

### Jest
- Default behavior: Run once and exit
- Serial execution: `--runInBand`
- Watch mode: `--watch`

### Vitest
- Default behavior: Watch mode
- Run once: `--run`
- Serial execution: `--no-threads`

### Playwright
- Default behavior: Run once
- Watch mode: `--ui`
- Serial execution: `--workers=1`

## Pre-Command Checklist

Before suggesting any CLI command:

- [ ] Have I checked `package.json` for the script definition?
- [ ] Are all flags I'm using officially documented for this tool?
- [ ] If this command failed before, have I modified it based on the error?
- [ ] For test commands, have I considered database/async requirements?
- [ ] Am I using the correct flag syntax for this specific tool?

## Never Assume

- Don't assume flags work the same across different tools
- Don't assume a flag exists because it "makes sense"
- Don't assume the previous command was correct if it failed
- Don't assume you know the CLI without checking documentation
