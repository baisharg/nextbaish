---
description: 'Automated story lifecycle: create, context, validate, implement, and review one story end-to-end automatically'
---

# auto-story

You are orchestrating the complete story lifecycle from creation through code review. This workflow executes 5 specialized sub-agents in sequence, automatically proceeding through phases unless issues require user intervention.

## Workflow Overview

Execute the following phases in order, continuing automatically unless issues arise:

### Phase 1: Story Creation
1. Invoke the `bmm-story-creator` sub-agent using the Task tool
2. The sub-agent will autonomously execute the create-story workflow
3. It will return: story key, file path, status, summary
4. Log the story key for use in subsequent phases
5. **Auto-proceed** to Phase 2 (no checkpoint)

### Phase 2: Story Context Building
1. Invoke the `bmm-story-context-builder` sub-agent using the Task tool
2. The sub-agent will autonomously execute the story-context workflow
3. It will return: context file path, artifacts gathered, validation status, warnings
4. **Auto-proceed** to Phase 3 (no checkpoint)

### Phase 3: Story Context Validation
1. Invoke the `bmm-story-context-validator` sub-agent using the Task tool
2. The sub-agent will autonomously validate the Story Context XML
3. It will return: validation status (PASS/FAIL), issues found, recommendations
4. **CONDITIONAL CHECKPOINT**:
   - If validation FAILED with CRITICAL issues:
     - Present the issues clearly
     - Ask: "Validation failed with critical issues. Fix issues and retry validation, or abort? (retry/abort)"
     - If retry: Re-invoke validator and repeat this checkpoint
     - If abort: HALT workflow
   - If validation PASSED or only has LOW/MEDIUM issues:
     - **Auto-proceed** to Phase 4 (no checkpoint)

### Phase 4: Story Implementation
1. Invoke the `bmm-story-implementer` sub-agent using the Task tool
2. The sub-agent will autonomously execute the dev-story workflow
3. It will continuously implement until complete (no pausing)
4. It will return: implementation summary, files changed, test results, AC status
5. **Auto-proceed** to Phase 5 (no checkpoint)

### Phase 5: Code Review
1. Invoke the `bmm-story-reviewer` sub-agent using the Task tool
2. The sub-agent will autonomously execute the code-review workflow
3. It will return: review outcome (APPROVED/APPROVED_WITH_IMPROVEMENTS/CHANGES REQUESTED/BLOCKED), issues, action items
4. **CONDITIONAL CHECKPOINT** based on outcome:

   **If APPROVED**:
   - Present success summary: "Story approved! All acceptance criteria validated. Story is complete and ready for deployment."
   - Workflow complete successfully

   **If APPROVED_WITH_IMPROVEMENTS**:
   - Present MEDIUM issues found
   - Log: "Minor improvements needed. Auto-looping back to implementation to fix MEDIUM issues."
   - **Auto-proceed** to Phase 4 (story-implementer will detect review follow-ups and fix MEDIUM issues)
   - After fixes, automatically return to Phase 5 for re-review
   - No user intervention required

   **If CHANGES REQUESTED**:
   - Present action items clearly organized by severity (CRITICAL/HIGH issues found)
   - Explain that story has been cycled back to in-progress status
   - Ask: "Changes requested by code review. Loop back to implementation to address issues? (yes/no)"
   - If yes: Return to Phase 4 (story-implementer will detect review follow-ups)
   - If no: HALT workflow with status "Changes requested - manual intervention needed"

   **If BLOCKED**:
   - Present blocker details
   - HALT workflow with status "Blocked - external dependency or issue requires resolution"

## Critical Instructions

**Sub-Agent Invocation**:
- Use the Task tool with appropriate `subagent_type` parameter
- Pass clear prompts explaining what the sub-agent should do
- Example:
  ```
  Task tool:
  - subagent_type: "bmm-story-creator"
  - prompt: "Execute create-story workflow autonomously for the next backlog story. Return structured results including story key, file path, and summary."
  ```

**Automatic Flow**:
- Continue automatically through phases unless issues arise
- Log progress as each phase completes
- Only pause for user input when CRITICAL issues or review problems occur
- Present summaries at natural stopping points (validation failures, review outcomes)

**Conditional Checkpoints** (only stop when):
- Context validation FAILS with CRITICAL issues
- Code review returns CHANGES REQUESTED or BLOCKED
- Any sub-agent returns an error

**Error Handling**:
- If any sub-agent fails, HALT immediately
- Report which phase failed and what error occurred
- Do not attempt to proceed to next phase

**One Story at a Time**:
- This workflow processes ONE story from start to finish
- To process multiple stories, run the workflow multiple times
- Each run is independent and complete

**State Tracking**:
- Track story key across all phases
- Reference the same story throughout the workflow
- Verify each phase operates on the correct story

## Expected Sub-Agent Outputs

Each sub-agent will return structured results. Look for these key fields:

**story-creator**: story_key, story_file_path, status_update, summary, ac_count, tasks_count
**story-context-builder**: story_key, context_file_path, status_update, artifacts_count, warnings
**story-context-validator**: story_key, overall_status, validation_score, critical_issues, recommendations
**story-implementer**: story_key, status_update, ac_status, files_created, files_modified, test_results
**story-reviewer**: story_key, review_outcome (APPROVED/APPROVED_WITH_IMPROVEMENTS/CHANGES REQUESTED/BLOCKED), status_update, critical_issues, high_issues, medium_issues, action_items

Parse these outputs and log progress as the workflow advances automatically.

## Workflow Success Criteria

The workflow runs automatically and is successful when:
1. Story created and drafted ✅
2. Story context assembled and validated ✅
3. Story implemented with all ACs satisfied ✅
4. Code review APPROVED with no CRITICAL/HIGH issues ✅
5. MEDIUM issues auto-fixed (if any) via automatic implementation loop ✅
6. Story status updated to "done" in sprint-status.yaml ✅

Present a final summary showing all phases completed successfully.

**Automatic Loops**:
- MEDIUM issues: Auto-loop to implementation, no user input needed
- Context validation failures: Ask user retry/abort
- CRITICAL/HIGH issues from review: Ask user to continue or abort
