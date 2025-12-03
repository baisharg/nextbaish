---
description: 'Continuous autonomous story execution: process all pending stories with auto-retry, commit/push between stories, checkpoint/resume support'
---

# auto-story-continuous

Fully autonomous continuous story execution workflow. Processes multiple stories sequentially without user intervention, with intelligent retry logic and checkpoint/resume capability.

---

## CRITICAL RULES

These rules are **absolute** - never violate them:

1. **ZERO USER INTERACTION** - All decisions are autonomous. Never pause for input.
2. **COMMIT AFTER EACH SUCCESS** - Every approved story gets committed and pushed immediately.
3. **NEVER LEAVE INCONSISTENT STATE** - Complete current phase before moving on or failing.
4. **UPDATE SPRINT-STATUS** - Mark story as `done` in sprint-status.yaml after successful completion.
5. **CHECKPOINT EVERY PHASE** - Save progress after each phase for crash recovery.
6. **VERIFY BEFORE REVIEW** - Tests, types, and lint must pass before code review.
7. **HALT ON FAILURE** - After max retries, STOP execution and write a detailed failure report.

---

## ORCHESTRATOR RULES

The top-level orchestrator (you) coordinates sub-agents but does NOT perform detailed work:

### What the Orchestrator CAN Do
- **Read:** `sprint-status.yaml`, tracking files, checkpoint files (small files only)
- **Bash:** Git commands (`git status`, `git add`, `git commit`, `git push`), verification commands (`pnpm test`, etc.)
- **Task:** Invoke sub-agents for all substantive work
- **Write:** Only tracking files (`continuous-run-*.yaml`) and failure reports

### What the Orchestrator MUST NOT Do
- **NEVER read large documentation files** (prd.md, architecture.md, epics.md, tech specs) - pass file paths to sub-agents instead. This keeps context lean.
- **NEVER use Edit tool** - All code and document modifications must be done by sub-agents.
- **NEVER use Write tool for code/docs** - Only sub-agents create or modify stories, contexts, tech specs, and code.

### Validation Logic for Enhancements
When a validator returns issues:
- **No issues** → Proceed immediately
- **Only low/medium issues (enhancements)** → Call builder to fix ALL issues, then proceed WITHOUT re-validation
- **High/critical issues** → Call builder to fix, then RE-VALIDATE (counts toward max_validation_attempts)

This ensures enhancements are always applied without wasting validation cycles.

---

## Configuration

```yaml
continuous_config:
  # Story selection
  max_stories: null                    # null = unlimited
  epic_filter: null                    # null = all epics, or ["epic-3", "epic-4"]
  status_filter: ["ready-for-dev", "in-progress", "review", "drafted", "backlog"]

  # Retry limits
  max_validation_attempts: 3
  max_review_cycles: 3

  # Git behavior
  auto_commit: true
  auto_push: true

  # Paths
  sprint_status_path: "docs/sprint-artifacts/sprint-status.yaml"
  stories_path: "docs/sprint-artifacts/stories"
  contexts_path: "docs/sprint-artifacts/story-contexts"
  tech_specs_path: "docs/sprint-artifacts/epic-tech-specs"
  log_path: "docs/sprint-artifacts/continuous-run-{timestamp}.yaml"

  # Verification commands (project-specific)
  # Each list is tried in order until one succeeds
  verification:
    typecheck:
      - "pnpm typecheck"
      - "cargo check"
      - "npm run typecheck"
      - "tsc --noEmit"
    test:
      - "pnpm test"
      - "cargo test"
      - "npm test"
      - "pytest"
    lint:
      - "pnpm lint"
      - "cargo clippy"
      - "npm run lint"
      - "ruff check ."
```

---

## Sub-Agent Contracts

Each sub-agent has defined inputs and outputs. **Always use explicit file paths.**

### Claude Sub-Agents (via Task tool)

#### bmm-epic-context-builder

**Purpose:** Generate tech spec from PRD and architecture
**Tool:** Task (Claude opus)

```yaml
Input:
  epic_id: "3"
  prd_path: "docs/prd.md"
  architecture_path: "docs/architecture.md"
  epics_path: "docs/epics.md"
  output_path: "docs/sprint-artifacts/epic-tech-specs/epic-{epic_id}-tech-spec.md"

Output (JSON in response):
  tech_spec_path: string    # Path where tech spec was written
  epic_title: string        # e.g., "Photo Capture with LiDAR Depth"
  ac_count: number          # Number of acceptance criteria
  story_count: number       # Number of stories in epic
```

#### bmm-story-creator

**Purpose:** Create story file from epic
**Tool:** Task (Claude opus)

```yaml
Input:
  story_key: "3-5-local-processing-pipeline"
  epic_id: "3"
  epics_path: "docs/epics.md"
  tech_spec_path: "docs/sprint-artifacts/epic-tech-specs/epic-3-tech-spec.md"
  output_path: "docs/sprint-artifacts/stories/{story_key}.md"

Output (JSON):
  story_file_path: string
  title: string
  ac_count: number
  dependencies: string[]     # Story keys this depends on
  fr_coverage: string[]      # e.g., ["FR11", "FR12", "FR13"]
```

#### bmm-story-context-builder

**Purpose:** Gather context for story implementation
**Tool:** Task (Claude opus)

```yaml
Input:
  story_key: "3-5-local-processing-pipeline"
  story_file_path: "docs/sprint-artifacts/stories/3-5-local-processing-pipeline.md"
  tech_spec_path: "docs/sprint-artifacts/epic-tech-specs/epic-3-tech-spec.md"
  architecture_path: "docs/architecture.md"
  output_path: "docs/sprint-artifacts/story-contexts/{story_key}-context.xml"

Output (JSON):
  context_file_path: string
  artifacts_found: string[]  # Docs referenced
  code_files: string[]       # Existing code found
  warnings: string[]
```

#### bmm-story-implementer

**Purpose:** Implement story with tests
**Tool:** Task (Claude opus)

```yaml
Input:
  story_key: "3-5-local-processing-pipeline"
  story_file_path: "docs/sprint-artifacts/stories/3-5-local-processing-pipeline.md"
  context_file_path: "docs/sprint-artifacts/story-contexts/3-5-local-processing-pipeline-context.xml"
  review_feedback: string | null  # Previous review issues if retry

Output (JSON):
  files_modified: string[]
  files_created: string[]
  test_files: string[]
  implementation_summary: string
```

### Codex Sub-Agents (via Bash tool)

These validators/reviewers use OpenAI Codex CLI with saved prompts in `~/.codex/prompts/`.

#### bmm-epic-context-validator

**Purpose:** Validate tech spec completeness
**Tool:** Bash (Codex CLI)
**Prompt:** `/prompts:bmm-epic-context-validator`

```yaml
Input (as arguments):
  EPIC_ID: "3"

Output (JSON via --output-schema):
  overall_status: "PASS" | "FAIL"
  score: 0-100
  issues:
    critical: string[]
    high: string[]
    medium: string[]
    low: string[]
  ready_for_story_creation: boolean
```

**Invocation:**
```bash
export CODEX_QUIET_MODE=1
codex exec --full-auto --skip-git-repo-check \
  --output-schema '{"type":"object","properties":{"overall_status":{"type":"string"},"score":{"type":"number"},"issues":{"type":"object","properties":{"critical":{"type":"array","items":{"type":"string"}},"high":{"type":"array","items":{"type":"string"}},"medium":{"type":"array","items":{"type":"string"}},"low":{"type":"array","items":{"type":"string"}}}},"ready_for_story_creation":{"type":"boolean"}},"required":["overall_status","score","issues"]}' \
  '/prompts:bmm-epic-context-validator EPIC_ID="{epic_id}"' 2>&1
```

#### bmm-story-context-validator

**Purpose:** Validate story context completeness
**Tool:** Bash (Codex CLI)
**Prompt:** `/prompts:bmm-story-context-validator`

```yaml
Input (as arguments):
  STORY_KEY: "3-5-local-processing-pipeline"

Output (JSON via --output-schema):
  overall_status: "PASS" | "FAIL"
  score: 0-100
  issues:
    critical: string[]
    high: string[]
    medium: string[]
    low: string[]
  ready_for_development: boolean
```

**Invocation:**
```bash
export CODEX_QUIET_MODE=1
codex exec --full-auto --skip-git-repo-check \
  --output-schema '{"type":"object","properties":{"overall_status":{"type":"string"},"score":{"type":"number"},"issues":{"type":"object","properties":{"critical":{"type":"array","items":{"type":"string"}},"high":{"type":"array","items":{"type":"string"}},"medium":{"type":"array","items":{"type":"string"}},"low":{"type":"array","items":{"type":"string"}}}},"ready_for_development":{"type":"boolean"}},"required":["overall_status","score","issues"]}' \
  '/prompts:bmm-story-context-validator STORY_KEY="{story_key}"' 2>&1
```

#### bmm-story-reviewer

**Purpose:** Senior developer code review
**Tool:** Bash (Codex CLI)
**Prompt:** `/prompts:bmm-story-reviewer`

```yaml
Input (as arguments):
  STORY_KEY: "3-5-local-processing-pipeline"

Output (JSON via --output-schema):
  outcome: "APPROVED" | "APPROVED_WITH_IMPROVEMENTS" | "CHANGES_REQUESTED" | "BLOCKED"
  issues:
    critical: string[]
    high: string[]
    medium: string[]
    low: string[]
  blocker_reason: string | null  # Only if BLOCKED
  summary: string
```

**Invocation:**
```bash
export CODEX_QUIET_MODE=1
codex exec --full-auto --skip-git-repo-check \
  --output-schema '{"type":"object","properties":{"outcome":{"type":"string","enum":["APPROVED","APPROVED_WITH_IMPROVEMENTS","CHANGES_REQUESTED","BLOCKED"]},"issues":{"type":"object","properties":{"critical":{"type":"array","items":{"type":"string"}},"high":{"type":"array","items":{"type":"string"}},"medium":{"type":"array","items":{"type":"string"}},"low":{"type":"array","items":{"type":"string"}}}},"blocker_reason":{"type":"string","nullable":true},"summary":{"type":"string"}},"required":["outcome","issues","summary"]}' \
  '/prompts:bmm-story-reviewer STORY_KEY="{story_key}"' 2>&1
```

---

## Tool Selection

| Sub-Agent | Tool | Rationale |
|-----------|------|-----------|
| bmm-epic-context-builder | Claude (Task) | Complex architecture reasoning, creative synthesis |
| bmm-epic-context-validator | Codex (Bash) | Structured checklist validation, adversarial review |
| bmm-story-creator | Claude (Task) | Creative story breakdown from requirements |
| bmm-story-context-builder | Claude (Task) | Codebase exploration, context synthesis |
| bmm-story-context-validator | Codex (Bash) | Completeness checking, adversarial validation |
| bmm-story-implementer | Claude (Task) | Complex code generation with full reasoning |
| bmm-story-reviewer | Codex (Bash) | Adversarial code review (different "eyes" on code) |

**Why split Claude/Codex?**
- **Claude creates, Codex validates** - avoids self-approval bias
- Validators/reviewers are checklist-driven - good fit for Codex structured output
- Different system reviewing code catches different issues
- Codex runs sandboxed (--full-auto) - appropriate for read-only analysis

---

## Workflow Execution

### Phase 0: Pre-Flight Checks

```markdown
1. Read sprint-status.yaml using Read tool
2. Run: git status && git branch --show-current
3. Create tracking file at docs/sprint-artifacts/continuous-run-{YYYYMMDD-HHMMSS}.yaml
4. Check for existing checkpoint (resume capability)
5. Output banner with run configuration
```

**Tracking File Structure:**
```yaml
run_id: "continuous-run-20251125-143000"
started_at: "2025-11-25T14:30:00Z"
branch: "feat/epic-6"
initial_commit: "abc123"

checkpoint: null  # or {story_key, phase, data}

epics_contexted: []
stories_processed: []

statistics:
  total: 0
  success: 0
  failed: 0
```

### Phase 1: Initialize Story Queue

```markdown
1. Parse sprint-status.yaml development_status section
2. Filter stories: status NOT "done" AND status IN status_filter
3. Skip entries starting with "epic-" or ending with "-retrospective"
4. Sort by priority: ready-for-dev > in-progress > review > drafted > backlog
5. Apply max_stories limit if configured
6. Store in stories_pending list
```

**Output:**
```
Found 5 pending stories:
  1. 3-5-local-processing-pipeline (in-progress)
  2. 4-1-capture-upload-endpoint (backlog)
  3. 4-2-upload-queue-retry (backlog)
  ...
```

### Phase 2: Main Processing Loop

For each story in queue:

```markdown
1. Output progress header: "Story {N}/{total}: {story_key}"
2. Extract epic_id from story_key (e.g., "3-5-..." → "3")
3. Save checkpoint: {story_key, phase: "starting"}
4. Execute Phase 3 (single story workflow)
5. Handle outcome:
   - success → Git commit/push, update sprint-status, continue to next
   - failure → HALT immediately, write failure report (Phase 4.5)
6. Update tracking file
```

### Phase 3: Single Story Workflow

#### Step 3.0: Epic Context Check (JIT)

```markdown
Read sprint-status.yaml to get epic-{epic_id} status

IF status == "backlog":
    OUTPUT: "Epic {epic_id} not contexted - running JIT context..."

    Task tool:
      subagent_type: "bmm-epic-context-builder"
      model: "opus"
      description: "Build tech spec for epic {epic_id}"
      prompt: |
        Generate tech spec for Epic {epic_id}.

        Input files:
        - PRD: docs/prd.md
        - Architecture: docs/architecture.md
        - Epics: docs/epics.md (find Epic {epic_id} section)

        Output to: docs/sprint-artifacts/epic-tech-specs/epic-{epic_id}-tech-spec.md

        Return JSON: {"tech_spec_path": "...", "epic_title": "...", "ac_count": N, "story_count": N}

    IF failed → Return {outcome: "failed", phase: "epic-context", reason: "..."}

    # Validate epic context with fix loop (using Codex)
    FOR attempt IN 1..max_validation_attempts:
        Bash tool:
          command: |
            export CODEX_QUIET_MODE=1
            codex exec --full-auto --skip-git-repo-check \
              --output-schema '{"type":"object","properties":{"overall_status":{"type":"string"},"score":{"type":"number"},"issues":{"type":"object","properties":{"critical":{"type":"array","items":{"type":"string"}},"high":{"type":"array","items":{"type":"string"}},"medium":{"type":"array","items":{"type":"string"}},"low":{"type":"array","items":{"type":"string"}}}},"ready_for_story_creation":{"type":"boolean"}},"required":["overall_status","score","issues"]}' \
              '/prompts:bmm-epic-context-validator EPIC_ID="{epic_id}"' 2>&1
          description: "Validate epic {epic_id} tech spec (attempt {attempt})"
          timeout: 300000

        Parse JSON from Codex output

        IF no issues at all:
            BREAK (validation passed)

        IF only low/medium issues (enhancements):
            # Fix ALL enhancements, then proceed WITHOUT re-validation
            Task tool:
              subagent_type: "bmm-epic-context-builder"
              model: "opus"
              description: "Fix enhancements in epic {epic_id} tech spec"
              prompt: |
                Fix ALL these enhancement issues in the tech spec:
                Medium: {medium_issues}
                Low: {low_issues}
                Tech spec: docs/sprint-artifacts/epic-tech-specs/epic-{epic_id}-tech-spec.md
            BREAK (move on - no re-validation needed for enhancements)

        IF high/critical issues:
            IF attempt >= max_validation_attempts:
                Return {outcome: "failed", phase: "epic-validation", reason: "Issues persist", issues: all_issues}

            # Fix ALL issues (including enhancements), then re-validate
            Task tool:
              subagent_type: "bmm-epic-context-builder"
              model: "opus"
              description: "Fix issues in epic {epic_id} tech spec (attempt {attempt})"
              prompt: |
                Fix ALL these issues in the tech spec:
                Critical: {critical_issues}
                High: {high_issues}
                Medium: {medium_issues}
                Low: {low_issues}
                Tech spec: docs/sprint-artifacts/epic-tech-specs/epic-{epic_id}-tech-spec.md
            CONTINUE (re-validate due to high/critical issues)

    Update sprint-status: epic-{epic_id} → "contexted"
    OUTPUT: "📋 Status: epic-{epic_id} → contexted"

ELSE IF status == "contexted":
    OUTPUT: "Epic {epic_id} already contexted ✓"
```

Save checkpoint: `{story_key, phase: "epic-check"}`

#### Step 3.1: Story Creation (if backlog)

```markdown
IF current_status == "backlog":
    Task tool:
      subagent_type: "bmm-story-creator"
      model: "opus"
      description: "Create story {story_key}"
      prompt: |
        Create story file for {story_key} from Epic {epic_id}.

        Input:
        - Epics file: docs/epics.md
        - Tech spec: docs/sprint-artifacts/epic-tech-specs/epic-{epic_id}-tech-spec.md

        Output to: docs/sprint-artifacts/stories/{story_key}.md

        Return JSON: {"story_file_path": "...", "title": "...", "ac_count": N, "dependencies": [...]}

    Update sprint-status: {story_key} → "drafted"
    OUTPUT: "📋 Status: {story_key} → drafted"
```

Save checkpoint: `{story_key, phase: "create"}`

#### Step 3.2: Story Context Building

```markdown
Task tool:
  subagent_type: "bmm-story-context-builder"
  model: "opus"
  description: "Build context for {story_key}"
  prompt: |
    Build implementation context for story {story_key}.

    Input:
    - Story: docs/sprint-artifacts/stories/{story_key}.md
    - Tech spec: docs/sprint-artifacts/epic-tech-specs/epic-{epic_id}-tech-spec.md
    - Architecture: docs/architecture.md

    Search codebase for relevant existing code.
    Output to: docs/sprint-artifacts/story-contexts/{story_key}-context.xml

    Return JSON: {"context_file_path": "...", "artifacts_found": [...], "code_files": [...], "warnings": [...]}
```

Save checkpoint: `{story_key, phase: "context", data: {context_file_path}}`

#### Step 3.3: Story Context Validation (with fix loop)

```markdown
FOR attempt IN 1..max_validation_attempts:
    # VALIDATE (using Codex)
    Bash tool:
      command: |
        export CODEX_QUIET_MODE=1
        codex exec --full-auto --skip-git-repo-check \
          --output-schema '{"type":"object","properties":{"overall_status":{"type":"string"},"score":{"type":"number"},"issues":{"type":"object","properties":{"critical":{"type":"array","items":{"type":"string"}},"high":{"type":"array","items":{"type":"string"}},"medium":{"type":"array","items":{"type":"string"}},"low":{"type":"array","items":{"type":"string"}}}},"ready_for_development":{"type":"boolean"}},"required":["overall_status","score","issues"]}' \
          '/prompts:bmm-story-context-validator STORY_KEY="{story_key}"' 2>&1
      description: "Validate context for {story_key} (attempt {attempt})"
      timeout: 300000

    Parse JSON from Codex output

    IF no issues at all:
        BREAK (validation passed, move on)

    IF only low/medium issues (enhancements):
        # Fix ALL enhancements, then proceed WITHOUT re-validation
        Task tool:
          subagent_type: "bmm-story-context-builder"
          model: "opus"
          description: "Fix enhancements in context for {story_key}"
          prompt: |
            Fix ALL these enhancement issues in the story context:
            Medium: {medium_issues}
            Low: {low_issues}

            Context file: {context_file_path}
            Update the context file to address ALL issues.
        BREAK (move on - no re-validation needed for enhancements)

    IF high/critical issues:
        IF attempt >= max_validation_attempts:
            Return {outcome: "failed", phase: "context-validation", reason: "Issues persist after {max_validation_attempts} attempts", issues: all_issues}

        # Fix ALL issues (including enhancements), then re-validate
        Task tool:
          subagent_type: "bmm-story-context-builder"
          model: "opus"
          description: "Fix issues in context for {story_key} (attempt {attempt})"
          prompt: |
            Fix ALL these issues in the story context:
            Critical: {critical_issues}
            High: {high_issues}
            Medium: {medium_issues}
            Low: {low_issues}

            Context file: {context_file_path}
            Update the context file to address ALL issues.

        CONTINUE (re-validate due to high/critical issues)

Update sprint-status: {story_key} → "ready-for-dev"
OUTPUT: "📋 Status: {story_key} → ready-for-dev"
```

Save checkpoint: `{story_key, phase: "validate"}`

#### Step 3.3.5: Pre-Implementation Environment Check

```markdown
OUTPUT: "Checking environment..."

# Quick sanity checks before implementation
1. IF package.json or Cargo.toml in files_to_modify:
   Bash: pnpm install 2>&1 || cargo fetch 2>&1
   OUTPUT: "Dependencies refreshed ✓"

2. Check working directory is clean (no uncommitted changes from previous story):
   Bash: git status --porcelain
   IF dirty → OUTPUT warning: "Warning: uncommitted changes detected"

3. Verify key paths exist:
   - Story file exists
   - Context file exists
   - Tech spec exists

OUTPUT: "Environment ready ✓"
```

#### Step 3.4: Story Implementation (with review fix loop)

```markdown
FOR cycle IN 1..max_review_cycles:

    # IMPLEMENT (or fix from previous feedback)
    Task tool:
      subagent_type: "bmm-story-implementer"
      model: "opus"
      description: "Implement {story_key} (cycle {cycle})"
      prompt: |
        Implement story {story_key}.

        Story: docs/sprint-artifacts/stories/{story_key}.md
        Context: {context_file_path}
        {IF cycle > 1: "Previous feedback to address: {review_feedback}"}

        Implement all acceptance criteria with tests.
        Return JSON: {"files_modified": [...], "files_created": [...], "test_files": [...], "implementation_summary": "..."}

    Update sprint-status: {story_key} → "in-progress"
    OUTPUT: "📋 Status: {story_key} → in-progress"
    Save checkpoint: {story_key, phase: "implement", data: {files_modified, files_created}}

    # VERIFY (mandatory gates)
    OUTPUT: "Running verification gates..."

    # Gate 1: Type check
    # Try each command from verification.typecheck until one works
    Bash: Try verification.typecheck commands in order
    IF failed → Store errors, call implementer to fix, re-verify

    # Gate 2: Tests
    # Try each command from verification.test until one works
    Bash: Try verification.test commands in order
    IF failed → Store errors, call implementer to fix, re-verify

    # Gate 3: Lint
    # Try each command from verification.lint until one works
    Bash: Try verification.lint commands in order
    IF failed → Try auto-fix, then call implementer if still failing

    IF any gate failed AND cycle < max_review_cycles:
        review_feedback = gate_errors
        CONTINUE (loop back to implementer to fix)
    ELIF any gate failed:
        Return {outcome: "failed", phase: "verification", reason: "Verification gates failed after {max_review_cycles} cycles", errors: gate_errors}

    Save checkpoint: {story_key, phase: "verify"}

    # REVIEW (using Codex)
    Bash tool:
      command: |
        export CODEX_QUIET_MODE=1
        codex exec --full-auto --skip-git-repo-check \
          --output-schema '{"type":"object","properties":{"outcome":{"type":"string","enum":["APPROVED","APPROVED_WITH_IMPROVEMENTS","CHANGES_REQUESTED","BLOCKED"]},"issues":{"type":"object","properties":{"critical":{"type":"array","items":{"type":"string"}},"high":{"type":"array","items":{"type":"string"}},"medium":{"type":"array","items":{"type":"string"}},"low":{"type":"array","items":{"type":"string"}}}},"blocker_reason":{"type":"string","nullable":true},"summary":{"type":"string"}},"required":["outcome","issues","summary"]}' \
          '/prompts:bmm-story-reviewer STORY_KEY="{story_key}"' 2>&1
      description: "Review {story_key} (cycle {cycle})"
      timeout: 300000

    Parse JSON from Codex output

    Update sprint-status: {story_key} → "review"
    OUTPUT: "📋 Status: {story_key} → review"

    # Handle review outcome based on issue severity
    IF no issues at all:
        BREAK (success! move on)

    IF only low/medium issues (enhancements):
        # Fix ALL enhancements, then proceed WITHOUT re-review
        OUTPUT: "Fixing enhancement issues..."
        Task tool:
          subagent_type: "bmm-story-implementer"
          model: "opus"
          description: "Fix enhancements for {story_key}"
          prompt: |
            Fix ALL these enhancement review issues:
            Medium: {medium_issues}
            Low: {low_issues}

            Files: {files_modified}
            Make minimal changes to address ALL these issues.
        BREAK (move on - no re-review needed for enhancements)

    IF high/critical issues:
        IF cycle >= max_review_cycles:
            Return {outcome: "failed", phase: "review", reason: "Issues persist after {max_review_cycles} cycles", issues: all_issues}

        # Fix ALL issues (including enhancements), then re-review
        OUTPUT: "Fixing issues for re-review..."
        review_feedback = all_issues
        CONTINUE (re-review due to high/critical issues)

    IF outcome == "BLOCKED":
        Return {outcome: "failed", phase: "review-blocked", reason: blocker_reason}
```

Save checkpoint: `{story_key, phase: "review"}`

#### Step 3.5: Success

```markdown
Return {
  outcome: "success",
  files_modified: [...],
  test_results: "...",
  review_cycles: N,
  validation_attempts: N
}
```

### Phase 4: Git Integration

After successful story:

```markdown
1. Get story title from story file
2. Stage all changes:
   Bash: git add -A

3. Commit with structured message:
   Bash: git commit -m "$(cat <<'EOF'
   [Story {story_key}] {title}

   {implementation_summary}

   Files: {len(files_modified)} modified
   Tests: {test_status}
   Review: APPROVED (cycle {review_cycles})

   Co-Authored-By: Claude <noreply@anthropic.com>
   EOF
   )"

4. Push to remote:
   Bash: git push origin {branch}

5. Update sprint-status: {story_key} → "done"
   OUTPUT: "📋 Status: {story_key} → done ✅"

6. Clear checkpoint (story complete)
```

### Phase 4.5: Failure Report (on any failure)

When a story fails after max retries, HALT and generate a detailed failure report:

```markdown
1. Create failure report file: docs/sprint-artifacts/failure-report-{story_key}-{timestamp}.md

2. Write comprehensive failure report:

   # Failure Report: {story_key}

   **Run ID:** {run_id}
   **Failed At:** {timestamp}
   **Phase:** {failed_phase}
   **Retry Attempts:** {attempts_made}/{max_attempts}

   ## Summary
   {brief description of what failed and why}

   ## Failed Phase Details

   ### Phase: {failed_phase}
   - **Started:** {phase_start_time}
   - **Duration:** {phase_duration}
   - **Outcome:** FAILED

   ## Error Details

   ### Primary Error
   ```
   {error_message}
   ```

   ### Full Error Output
   ```
   {complete_error_output}
   ```

   ## Context

   ### Story Information
   - **Story Key:** {story_key}
   - **Epic:** {epic_id}
   - **Story File:** {story_file_path}
   - **Context File:** {context_file_path}

   ### Files Involved
   {list of files that were modified/created before failure}

   ### Retry History
   | Attempt | Phase | Error Summary |
   |---------|-------|---------------|
   | 1 | {phase} | {error_summary} |
   | 2 | {phase} | {error_summary} |
   | ... | ... | ... |

   ## Diagnosis

   ### Likely Root Cause
   {AI analysis of the root cause based on error patterns}

   ### Contributing Factors
   - {factor 1}
   - {factor 2}

   ## Recommendations

   ### Immediate Actions
   1. {action 1}
   2. {action 2}

   ### Before Resuming
   - [ ] {checklist item 1}
   - [ ] {checklist item 2}

   ## State at Failure

   ### Git Status
   ```
   {git status output}
   ```

   ### Modified Files (uncommitted)
   {list of uncommitted changes}

   ### Checkpoint Data
   ```yaml
   {checkpoint contents}
   ```

   ## Resume Instructions

   After fixing the issue, resume with:
   ```bash
   /auto-story-continuous
   ```
   The workflow will automatically resume from the checkpoint.

3. Update tracking file with failure details

4. Output halt message:

   ⛔ WORKFLOW HALTED - STORY FAILED
   ═══════════════════════════════════════════════════

   Story: {story_key}
   Phase: {failed_phase}
   Attempts: {attempts}/{max}

   Error: {brief_error}

   📄 Full report: {failure_report_path}

   Fix the issue, then run /auto-story-continuous to resume.
   ═══════════════════════════════════════════════════
```

### Phase 5: Final Report

After all stories processed successfully:

```markdown
OUTPUT:

═══════════════════════════════════════════════════════════════════════════════
                         CONTINUOUS RUN COMPLETE ✅
═══════════════════════════════════════════════════════════════════════════════

Run ID:    {run_id}
Duration:  {duration}
Branch:    {branch}

───────────────────────────────────────────────────────────────────────────────
                                  RESULTS
───────────────────────────────────────────────────────────────────────────────

Stories Processed:  {total}
All Successful:     ✅ Yes

───────────────────────────────────────────────────────────────────────────────
                                GIT ACTIVITY
───────────────────────────────────────────────────────────────────────────────

Commits Created:  {commit_count}
Pushed to Remote: {push_count}

───────────────────────────────────────────────────────────────────────────────
                              COMPLETED STORIES
───────────────────────────────────────────────────────────────────────────────

  #   Story Key                              Commit    Cycles
  ─   ─────────                              ──────    ──────
  1   3-5-local-processing-pipeline          a1b2c3d   1
  2   4-1-capture-upload-endpoint            e4f5g6h   2
  3   4-2-upload-queue-retry                 i7j8k9l   1

───────────────────────────────────────────────────────────────────────────────

📄 Full log: {log_file_path}

═══════════════════════════════════════════════════════════════════════════════
```

---

## Checkpoint/Resume System

### Saving Checkpoints

After each phase completion, update tracking file:

```yaml
checkpoint:
  story_key: "3-5-local-processing-pipeline"
  phase: "validate"  # epic-check | create | context | validate | env-check | implement | verify | review
  saved_at: "2025-11-25T14:35:00Z"
  data:
    context_file_path: "docs/sprint-artifacts/story-contexts/3-5-...-context.xml"
    validation_attempts: 1
    review_cycles: 0
    files_progress:           # Track files written during implementation
      modified: []
      created: []
      last_file: null         # Last file successfully written
```

### Resuming from Checkpoint

On workflow start, check for existing checkpoint:

```markdown
IF checkpoint exists:
    OUTPUT:
    """
    ⚡ CHECKPOINT DETECTED

    Story: {checkpoint.story_key}
    Phase: {checkpoint.phase}
    Saved: {checkpoint.saved_at}

    Resuming from {checkpoint.phase} phase...
    """

    Skip completed phases, continue from checkpoint.phase
    Load checkpoint.data for context
```

---

## Worked Examples

### Example 1: Successful Story Processing

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║  STORY 1/3: 3-5-local-processing-pipeline                                     ║
║  Status: backlog → processing                                                 ║
╚═══════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────────
│ PHASE: Epic Context Check
└─────────────────────────────────────────────────────────────────────────────────
  ✓ Epic 3 already contexted (tech-spec exists)

┌─────────────────────────────────────────────────────────────────────────────────
│ PHASE: Story Creation
└─────────────────────────────────────────────────────────────────────────────────
  📝 Creating story from backlog...
     Agent: bmm-story-creator (opus)
     Input:  docs/epics.md, epic-3-tech-spec.md
     Output: docs/sprint-artifacts/stories/3-5-local-processing-pipeline.md
  ✅ DONE - Story created (5 acceptance criteria, 8 tasks)

┌─────────────────────────────────────────────────────────────────────────────────
│ PHASE: Context Building
└─────────────────────────────────────────────────────────────────────────────────
  🔍 Building implementation context...
     Agent: bmm-story-context-builder (opus)
     Scanning: architecture.md, existing code, dependencies
     Output: docs/sprint-artifacts/story-contexts/3-5-local-processing-pipeline-context.xml
  ✅ DONE - Context built (12 artifacts, 8 code files)

┌─────────────────────────────────────────────────────────────────────────────────
│ PHASE: Context Validation (attempt 1/3)
└─────────────────────────────────────────────────────────────────────────────────
  🔬 Validating context completeness...
     Tool: Codex CLI (/prompts:bmm-story-context-validator)

     Issues Found:
       • 0 critical
       • 0 high
       • 1 medium: "Could include more interface examples"
       • 2 low: "Missing optional helper utils", "Could add more code samples"

  🔧 Only enhancements found - fixing without re-validation...
     Agent: bmm-story-context-builder (Claude opus)
     Fixing: 1 medium + 2 low issues
  ✅ DONE - All enhancements applied, moving on

┌─────────────────────────────────────────────────────────────────────────────────
│ PHASE: Implementation (cycle 1/3)
└─────────────────────────────────────────────────────────────────────────────────
  🔨 Implementing story...
     Agent: bmm-story-implementer (opus)
     Context: 3-5-local-processing-pipeline-context.xml
  ✅ DONE - Implementation complete

     Modified Files:
       • apps/mobile/services/processingPipeline.ts
       • apps/mobile/hooks/useLocalProcessing.ts
       • apps/mobile/store/processingStore.ts
       • apps/mobile/utils/imageCompression.ts

     Created Files:
       • apps/mobile/services/__tests__/processingPipeline.test.ts
       • apps/mobile/hooks/__tests__/useLocalProcessing.test.ts

┌─────────────────────────────────────────────────────────────────────────────────
│ PHASE: Verification Gates
└─────────────────────────────────────────────────────────────────────────────────
  🔬 Running verification gates...

     ┌──────────────┬────────┬─────────────────────────────────┐
     │ Gate         │ Status │ Details                         │
     ├──────────────┼────────┼─────────────────────────────────┤
     │ Type Check   │ ✅ PASS │ 0 errors                        │
     │ Tests        │ ✅ PASS │ 12 passed, 0 failed, 0 skipped  │
     │ Lint         │ ✅ PASS │ 0 errors, 2 warnings            │
     └──────────────┴────────┴─────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────
│ PHASE: Code Review (cycle 1/3)
└─────────────────────────────────────────────────────────────────────────────────
  👀 Reviewing implementation...
     Tool: Codex CLI (/prompts:bmm-story-reviewer)
     Checking: AC coverage, code quality, test coverage

     Issues Found:
       • 0 critical
       • 0 high
       • 1 medium: "Consider adding error boundary for async operations"
       • 1 low: "Consider adding JSDoc to exported function"

  🔧 Only enhancements found - fixing without re-review...
     Agent: bmm-story-implementer (Claude opus)
     Fixing: 1 medium + 1 low issues
  ✅ DONE - All enhancements applied

     Review Summary:
       • All 5 acceptance criteria covered
       • Test coverage: 87%
       • No security concerns
       • Code follows project patterns

┌─────────────────────────────────────────────────────────────────────────────────
│ PHASE: Git Commit & Push
└─────────────────────────────────────────────────────────────────────────────────
  📦 Staging changes...
     $ git add -A
  📦 Committing...
     $ git commit -m "[Story 3-5] Local processing pipeline..."
  ✅ Committed: a1b2c3d

  ⬆️  Pushing to remote...
     $ git push origin feat/epic-3
  ✅ Pushed successfully

┌─────────────────────────────────────────────────────────────────────────────────
│ PHASE: Status Update
└─────────────────────────────────────────────────────────────────────────────────
  📋 Updating sprint-status.yaml: 3-5-local-processing-pipeline → done
  🧹 Clearing checkpoint

╔═══════════════════════════════════════════════════════════════════════════════╗
║  ✅ STORY COMPLETED: 3-5-local-processing-pipeline                            ║
║                                                                               ║
║  Duration:      4m 23s                                                        ║
║  Review Cycles: 1                                                             ║
║  Git Commit:    a1b2c3d                                                       ║
║  Files Changed: 6 (4 modified, 2 created)                                     ║
╚═══════════════════════════════════════════════════════════════════════════════╝

→ Moving to next story...
```

### Example 2: Failed Story (Halted with Report)

```
╔═══════════════════════════════════════════════════════════════════════════════╗
║  STORY 2/3: 4-1-capture-upload-endpoint                                       ║
║  Status: backlog → processing                                                 ║
╚═══════════════════════════════════════════════════════════════════════════════╝

┌─────────────────────────────────────────────────────────────────────────────────
│ PHASE: Epic Context Check
└─────────────────────────────────────────────────────────────────────────────────
  ⚡ Epic 4 not contexted - running JIT context build...
     Agent: bmm-epic-context-builder (opus)
  ✅ DONE - Tech spec created

┌─────────────────────────────────────────────────────────────────────────────────
│ PHASE: Story Creation
└─────────────────────────────────────────────────────────────────────────────────
  📝 Creating story from backlog...
  ✅ DONE - Story created

┌─────────────────────────────────────────────────────────────────────────────────
│ PHASE: Context Building
└─────────────────────────────────────────────────────────────────────────────────
  🔍 Building implementation context...
  ✅ DONE - Context built

┌─────────────────────────────────────────────────────────────────────────────────
│ PHASE: Implementation (cycle 1/3)
└─────────────────────────────────────────────────────────────────────────────────
  🔨 Implementing story...
  ✅ DONE - Implementation complete

┌─────────────────────────────────────────────────────────────────────────────────
│ PHASE: Verification Gates
└─────────────────────────────────────────────────────────────────────────────────
  🔬 Running verification gates...

     ┌──────────────┬────────┬─────────────────────────────────┐
     │ Gate         │ Status │ Details                         │
     ├──────────────┼────────┼─────────────────────────────────┤
     │ Type Check   │ ✅ PASS │ 0 errors                        │
     │ Tests        │ ❌ FAIL │ 8 passed, 3 failed              │
     │ Lint         │ ─ SKIP │ (blocked by test failure)       │
     └──────────────┴────────┴─────────────────────────────────┘

  ⚠️  Tests failed - retrying implementation...

┌─────────────────────────────────────────────────────────────────────────────────
│ PHASE: Implementation (cycle 2/3)
└─────────────────────────────────────────────────────────────────────────────────
  🔨 Re-implementing with feedback...
     Feedback: "3 tests failing: uploadCapture timeout, invalid signature, missing header"
  ✅ DONE - Implementation updated

┌─────────────────────────────────────────────────────────────────────────────────
│ PHASE: Verification Gates
└─────────────────────────────────────────────────────────────────────────────────
     ┌──────────────┬────────┬─────────────────────────────────┐
     │ Gate         │ Status │ Details                         │
     ├──────────────┼────────┼─────────────────────────────────┤
     │ Type Check   │ ✅ PASS │ 0 errors                        │
     │ Tests        │ ❌ FAIL │ 10 passed, 1 failed             │
     │ Lint         │ ─ SKIP │ (blocked by test failure)       │
     └──────────────┴────────┴─────────────────────────────────┘

  ⚠️  Tests still failing - retrying implementation...

┌─────────────────────────────────────────────────────────────────────────────────
│ PHASE: Implementation (cycle 3/3) - FINAL ATTEMPT
└─────────────────────────────────────────────────────────────────────────────────
  🔨 Re-implementing with feedback...
  ✅ DONE - Implementation updated

┌─────────────────────────────────────────────────────────────────────────────────
│ PHASE: Verification Gates
└─────────────────────────────────────────────────────────────────────────────────
     ┌──────────────┬────────┬─────────────────────────────────┐
     │ Gate         │ Status │ Details                         │
     ├──────────────┼────────┼─────────────────────────────────┤
     │ Type Check   │ ✅ PASS │ 0 errors                        │
     │ Tests        │ ❌ FAIL │ 10 passed, 1 failed             │
     │ Lint         │ ─ SKIP │ (blocked by test failure)       │
     └──────────────┴────────┴─────────────────────────────────┘

  ❌ MAX RETRIES EXCEEDED - Generating failure report...

╔═══════════════════════════════════════════════════════════════════════════════╗
║  ⛔ WORKFLOW HALTED - STORY FAILED                                            ║
╠═══════════════════════════════════════════════════════════════════════════════╣
║                                                                               ║
║  Story:    4-1-capture-upload-endpoint                                        ║
║  Phase:    verification                                                       ║
║  Attempts: 3/3                                                                ║
║                                                                               ║
║  Error:                                                                       ║
║  ┌─────────────────────────────────────────────────────────────────────────┐  ║
║  │ FAIL  backend/src/routes/captures.rs::test_upload_large_file            │  ║
║  │                                                                         │  ║
║  │ assertion `left == right` failed                                        │  ║
║  │   left: 413                                                             │  ║
║  │  right: 200                                                             │  ║
║  │                                                                         │  ║
║  │ Stack: routes/captures.rs:142                                           │  ║
║  └─────────────────────────────────────────────────────────────────────────┘  ║
║                                                                               ║
║  📄 Full report: docs/sprint-artifacts/failure-report-4-1-capture-upload-     ║
║                  endpoint-20251125-143500.md                                  ║
║                                                                               ║
║  ─────────────────────────────────────────────────────────────────────────────║
║  Fix the issue, then run /auto-story-continuous to resume from checkpoint.   ║
║                                                                               ║
╚═══════════════════════════════════════════════════════════════════════════════╝
```

### Example 3: Enhancements Fixed Without Re-Review

```
┌─────────────────────────────────────────────────────────────────────────────────
│ PHASE: Code Review (cycle 1/3)
└─────────────────────────────────────────────────────────────────────────────────
  👀 Reviewing implementation...
     Tool: Codex CLI (/prompts:bmm-story-reviewer)

     Issues Found:
       • 0 critical
       • 0 high
       • 2 medium: "Missing error boundary", "No loading state for async op"
       • 1 low: "Inconsistent naming"

  🔧 Only enhancements found - fixing without re-review...
     Agent: bmm-story-implementer (Claude opus)
     Fixing: 2 medium + 1 low issues
  ✅ DONE - All enhancements applied

     Review Summary:
       • All acceptance criteria covered
       • Enhancement issues addressed
       • No re-review needed (only low/medium issues)
       • Proceeding to commit

┌─────────────────────────────────────────────────────────────────────────────────
│ PHASE: Git Commit & Push
└─────────────────────────────────────────────────────────────────────────────────
  📦 Staging changes...
  📦 Committing...
  ✅ Committed: x7y8z9w
```

### Example 4: High Issues Trigger Re-Review

```
┌─────────────────────────────────────────────────────────────────────────────────
│ PHASE: Code Review (cycle 1/3)
└─────────────────────────────────────────────────────────────────────────────────
  👀 Reviewing implementation...
     Tool: Codex CLI (/prompts:bmm-story-reviewer)

     Issues Found:
       • 0 critical
       • 1 high: "Missing input validation on user data"
       • 1 medium: "No loading state"
       • 1 low: "Inconsistent naming"

  ⚠️  High issues found - fixing then RE-REVIEWING...
     Agent: bmm-story-implementer (Claude opus)
     Fixing: 1 high + 1 medium + 1 low issues
  ✅ DONE - All issues addressed

┌─────────────────────────────────────────────────────────────────────────────────
│ PHASE: Verification Gates (re-run after fixes)
└─────────────────────────────────────────────────────────────────────────────────
     ┌──────────────┬────────┬─────────────────────────────────┐
     │ Gate         │ Status │ Details                         │
     ├──────────────┼────────┼─────────────────────────────────┤
     │ Type Check   │ ✅ PASS │ 0 errors                        │
     │ Tests        │ ✅ PASS │ 14 passed (2 new)               │
     │ Lint         │ ✅ PASS │ 0 errors                        │
     └──────────────┴────────┴─────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────────
│ PHASE: Code Review (cycle 2/3)
└─────────────────────────────────────────────────────────────────────────────────
  👀 Re-reviewing after high-priority fixes...
     Tool: Codex CLI (/prompts:bmm-story-reviewer)

     Issues Found:
       • 0 critical
       • 0 high
       • 0 medium
       • 0 low

  ✅ APPROVED - No issues remaining
```

---

## Safety Mechanisms

### Halt on Failure

When any story fails after max retries:
1. Immediately stop processing
2. Generate detailed failure report (see Phase 4.5)
3. Save checkpoint for resume capability
4. Output halt message with report location

This ensures issues are addressed before continuing, preventing cascading failures.

### Graceful Interrupt (Ctrl+C)

1. Complete current phase (don't leave half-done)
2. Save checkpoint
3. Save tracking file
4. Output: "Interrupted. Checkpoint saved. Resume with /auto-story-continuous"

---

## Quick Reference

### Tool Calls

```markdown
# Read file
Read tool: file_path: "docs/sprint-artifacts/sprint-status.yaml"

# Run bash command
Bash tool: command: "git status", description: "Check git status"

# Invoke Claude sub-agent (for creation/implementation)
Task tool:
  subagent_type: "bmm-story-implementer"
  model: "opus"
  description: "Implement story 3-5-example"
  prompt: "..."

# Invoke Codex sub-agent (for validation/review)
Bash tool:
  command: |
    export CODEX_QUIET_MODE=1
    codex exec --full-auto --skip-git-repo-check \
      --output-schema '{...}' \
      '/prompts:bmm-story-reviewer STORY_KEY="3-5-example"' 2>&1
  description: "Review story 3-5-example"
  timeout: 300000
```

### Status Flow

```
backlog → drafted → ready-for-dev → in-progress → review → done
                                         ↑            │
                                         └────────────┘ (if changes requested)
```

### Codex Prompts

Located in `~/.codex/prompts/`:

| Prompt | Purpose |
|--------|---------|
| `bmm-epic-context-validator.md` | Validate epic tech spec completeness |
| `bmm-story-context-validator.md` | Validate story context XML completeness |
| `bmm-story-reviewer.md` | Senior developer code review |

### File Locations

| Artifact | Path |
|----------|------|
| Sprint status | `docs/sprint-artifacts/sprint-status.yaml` |
| Stories | `docs/sprint-artifacts/stories/{story_key}.md` |
| Contexts | `docs/sprint-artifacts/story-contexts/{story_key}-context.xml` |
| Tech specs | `docs/sprint-artifacts/epic-tech-specs/epic-{N}-tech-spec.md` |
| Run logs | `docs/sprint-artifacts/continuous-run-{timestamp}.yaml` |
| Failure reports | `docs/sprint-artifacts/failure-report-{story_key}-{timestamp}.md` |

---

## Start Execution

**BEGIN NOW:**

1. Phase 0: Pre-flight checks
2. Phase 1: Initialize story queue
3. Phase 2: Process each story
4. Phase 5: Generate final report

Remember:
- Zero user interaction
- Checkpoint after every phase
- Verify before review
- Commit after every success
- **HALT on failure** - write detailed report, do NOT skip

Let's go!
