Mode: B
You are working on the ADMIN APP — React + JavaScript (not TypeScript) +
MUI + FastAPI, on branch `2019_v2_ui`. Separate codebase from the
player-facing MERN app.

Mode for this session: **Mode B** (new feature screen). Read
CONSTITUTION.md, theme.js, and schema-v2.md before making changes if you
haven't already this session. Follow the navigation plan agreed on in the
step-1 session — do not restructure navigation in this task.

This session builds ONE screen: [NAME THE SCREEN, e.g. "Shop list +
Shop detail/edit view"].

Requirements:
- UI/styling only — no real API calls yet (step 3, a separate FastAPI
  session, wires up the backend). Use mock/placeholder data shaped to
  match the relevant table(s) in schema-v2.md so the screen is ready to
  receive real data later without restructuring.
- Use theme.ts tokens exclusively — no hardcoded colors/spacing.
- Respect role visibility: if this screen has role-gated actions (e.g.
  only super can set superLock), show/hide or disable those controls
  based on a mock "current user role" prop, so the gating logic exists in
  the component even before real auth is wired in.
- Follow CONSTITUTION.md Section 6 (Definition of Done) — light/dark,
  i18n-ready strings (English/Amharic/Oromo keys even if translations are
  placeholder), responsive, no hardcoded values outside theme.ts.
- Show diffs/new files clearly, not a dump of the whole app.

If this screen needs a field or relationship not covered in schema-v2.md,
stop and ask rather than inventing one.