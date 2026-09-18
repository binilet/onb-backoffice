Mode: B
You are working on the ADMIN APP — React + JavaScript (not TypeScript) +
MUI + FastAPI, on a fresh branch `2019_v2_ui` off this repo's current branch. This is
a separate codebase from the player-facing MERN app (which uses its own
2019_v1/v2 branches) — don't assume anything from that app's structure
carries over here.

Mode for this session: **Mode B** (new feature — navigation/IA for the
shop/agent/owner marketplace feature). Per CONSTITUTION.md's Mode A/Mode B
split: visual rules apply in full, but this is new screens/behavior, not a
restyle of existing ones, so Mode B's rules on schema fidelity apply too.

Read these files in full before proposing anything:
- CONSTITUTION.md — visual direction, theme rules, and the Mode A/B split
  (Section 0). This session is Mode B.
- theme.js — the JS token system for this app (a JS port of the player
  app's theme.ts, kept visually in sync but language-appropriate for this
  codebase). Use it; do not introduce new colors/spacing/radius outside it.
- schema-v2.md — the full data model for the shop/agent/owner/admin/
  cashier marketplace feature, INCLUDING the confirmed role hierarchy and
  the "Service ownership" section (this session is UI/IA only, not backend
  wiring, but nav structure must still reflect who's allowed to see what)

Task for THIS session (step 1 of 2 — navigation and information architecture
only, no full screen builds yet):

1. Read the CURRENT admin app's navigation structure first (actual
   codebase, not assumptions) and show it to me.
2. Propose an updated/merged navigation structure that accommodates the
   NEW entities in schema-v2.md (Shop, ShopBranch, SystemUsers/roles,
   Room, WithdrawalRequest, ShopCreditLedger grants) alongside whatever
   already exists. Present this as a described plan, not code yet.
3. Navigation must reflect the CONFIRMED role hierarchy in schema-v2.md
   (super > agent > owner > admin > cashier) — different roles see
   different nav items. Propose how nav items map to roles, referencing
   schema-v2.md's hierarchy section directly rather than inventing a new
   permissions scheme.
4. Follow CONSTITUTION.md's design direction: tight, professional, one
   visual hero per screen, no default-MUI look. Propose which nav pattern
   (sidebar, top nav, etc.) and why, before writing any component code.
5. Do not build every screen yet. List the screens this feature needs
   (e.g. Shop list/detail, Withdrawal queue, Credit grant form, User/role
   management, superLock controls) as a scoped checklist for later
   sessions, one screen per session, using the step-2 screen template.

Output: a short written plan + the screen checklist. No component code in
this session. I'll review and confirm before we move to building screens.

If anything about the current codebase's structure, routing library, or
existing role/auth handling is unclear, ask rather than assuming a shape
that might not match what's actually there.