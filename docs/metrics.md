# Metrics and Feedback Plan

This plan defines a lightweight way to learn whether Repo Context CLI is becoming easier to discover, try, and adopt.

It is intentionally manual. The project should not add product telemetry, hidden analytics, or automated reporting until there is a clear user benefit and an explicit privacy design.

## Goals

- Notice whether public adoption is growing after documentation, release, or workflow changes.
- Turn repeated feedback into README, example, comparison, issue-template, or roadmap updates.
- Keep the measurement loop small enough for a maintainer to run weekly.
- Avoid tracking users or collecting repository contents.

## No telemetry

Repo Context CLI currently has no runtime telemetry.

Do not collect repository contents, file names, command names, package names, local paths, editor names, or user identifiers from CLI runs.

Any future analytics proposal must be opt-in, documented before implementation, and reviewed against the project's trust boundary: No LLM calls, no source edits, conservative redaction, and safe generated-file behavior.

## Signals to track

### npm downloads

Track:

- Weekly downloads for `repo-context-cli`.
- Change from the previous week.
- Version published during the period, if any.
- Any release, README, example, or social sharing event that may explain the change.

Download counts are directional. They can include CI installs, repeated local installs, bots, and package-manager cache behavior. Use them to spot broad movement, not to claim active users.

Useful source:

- npm package page for `repo-context-cli`.

### GitHub issues

Track:

- New bugs, feature requests, support questions, and security reports.
- Time to first maintainer response.
- Whether issue templates collected enough reproduction detail.
- Repeated confusion in issue titles, issue bodies, or maintainer follow-up questions.

Treat GitHub issues as the strongest qualitative feedback source because they show where the tool failed to explain itself, failed to work, or suggested a missing workflow.

### Adoption signals

Track:

- GitHub stars, forks, watchers, and external pull requests.
- Mentions in discussions, blog posts, README examples, newsletters, or social posts.
- References from repositories that adopt generated context files.
- Questions from users trying the dry-run, adoption guide, MCP mode, editor guides, or context-refresh workflow.

Adoption signals should explain which workflow is resonating. A useful signal is not only "more stars"; it is "users understand the dry-run path" or "teams are trying context refresh pull requests."

## Weekly snapshot

Run this review once per week while Phase 6 is active. Keep it manual review so the project does not need credentials, dashboards, or background jobs.

Suggested table:

| Date | npm weekly downloads | GitHub issues opened | Stars | Notable feedback | Action |
| --- | ---: | ---: | ---: | --- | --- |
| 2026-06-02 | Baseline | Baseline | Baseline | Start tracking after Phase 6 docs | Recheck in one week |

Suggested checklist:

- Check the public npm package page.
- Check GitHub repository insights and issue list.
- Review new issue labels and whether templates are producing actionable reports.
- Search for public mentions only when there is a specific launch, release, or documentation push to evaluate.
- Record one action, or record "No action" if the signal is too weak.

## Feedback loop

Use feedback to decide the smallest next improvement:

- Repeated confusion about what the tool does: tighten the README first screen or comparison guide.
- Repeated confusion about first use: improve Quickstart, example gallery, or adoption guide.
- Repeated confusion about safe file writes: improve safety defaults, dry-run examples, or issue-template prompts.
- Repeated bugs: add focused fixtures or regression tests before changing implementation.
- Repeated feature requests: add the request to the roadmap only after the pattern is clear and the trust boundary is still intact.

Do not promote a feature because one metric moved once. Prefer a small documentation or test improvement before expanding CLI scope.

## Review cadence

- Weekly during Phase 6 adoption-growth work.
- After every npm release.
- After README, example, comparison, or adoption-guide changes.
- After an external mention or a meaningful issue cluster.

The plan is complete when maintainers can answer:

- Are more developers finding the package?
- Are users getting stuck before a successful dry run?
- Which docs or workflows are producing the clearest adoption signals?
- What is the next smallest improvement that preserves the CLI trust boundary?
