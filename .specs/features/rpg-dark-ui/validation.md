# Validation: RPG dark dashboard UI

## Validation

**Result:** PASS

**Diff range:** uncommitted working tree (rpg-dark-ui feature)  
**Sensor:** N/A — no automated UI tests in `apps/web`; build gate used instead.

## Acceptance criteria

| ID | Criterion | Result | Evidence |
|----|-----------|--------|----------|
| AC-1 | Dark RPG palette with matrix-green accents on shell, panels, nav, primary actions | PASS | `apps/web/src/styles/tokens.css:35-58` (dark tokens), `apps/web/src/styles/components.css:2-32` (header + green nav pills), `apps/web/src/styles/components.css:214-220` (primary buttons) |
| AC-2 | Dashboard hero reserves portrait slot without rendering reference artwork | PASS | `apps/web/src/lib/config/branding.ts:5` (`CHARACTER_PORTRAIT_SRC: null`), `apps/web/src/components/character/CharacterPortraitSlot.tsx:16-35` (empty dashed slot when no src) |
| AC-3 | Active nav items as green pills; inactive muted on dark header | PASS | `apps/web/src/styles/components.css:26-32` (`.ds-app-nav-link--active`), `apps/web/src/components/layout/AppLayout.tsx:52-54` |
| AC-4 | Light mode toggle continues to work | PASS | `apps/web/src/components/layout/AppLayout.tsx:79` (ThemeToggle retained), `apps/web/src/styles/tokens.css:1-33` (light tokens unchanged) |

## Build gate

```
npm run build -w @gamefication/web — exit 0
```

## Notes

- Reference image `docs/Gemini_Generated_Image_tp8qtftp8qtftp8q.jpeg` is design direction only; not embedded per spec out-of-scope.
- Streak heatmap from mockup deferred; streak panel shows current/best counts.
- To enable portrait later: set `CHARACTER_PORTRAIT_SRC` in `branding.ts` or pass `imageSrc` to `CharacterPortraitSlot`.
