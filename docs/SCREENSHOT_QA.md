# Repeatable Screenshot QA

## Repository boundary

MedClaw is a message router and containerized agent, not a first-party web or mobile UI. Its screen inventory is therefore zero. Product evidence must be captured in an authenticated DingTalk, Feishu/Lark, or QQ client using `qa/chat-screenshot-scenarios.json`. A rendered fake chat is useful only as a mockup and must not be presented as runtime proof.

Streaming has two distinct visual states and both are required evidence: one capture while a Feishu/DingTalk card is actively receiving text, and one after that same card settles. The final capture must show that no duplicate answer was posted. QQ is captured only in its settled fallback state.

## Reusable web harness

For a repository that does have a web UI, copy and edit `qa/screenshots.example.json`, then run:

```bash
npm run screenshots -- --manifest qa/screenshots.json
```

The harness provides:

- a manifest of every route/state, so missing screens are visible;
- fixed desktop and mobile viewports;
- API fixtures declared per scenario;
- optional authenticated browser state;
- fixed clock, locale, and timezone;
- font readiness, animation disabling, caret hiding, and PII masks;
- one full-page image plus overlapping scroll segments for long pages;
- a machine-readable output manifest under `artifacts/screenshots/`.

Validate a manifest without opening a browser:

```bash
npm run screenshots -- --manifest qa/screenshots.example.json --validate
```

Install the bundled Chromium once when needed:

```bash
npx playwright install chromium
```

The design follows Playwright's supported full-page screenshot, device/project, network-mocking/HAR, and stable screenshot-assertion capabilities. Keep runtime screenshots and mocked screenshots in separate artifact folders and label the data source in the scenario manifest.
