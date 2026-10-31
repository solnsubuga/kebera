# Tickmark design system

Every screen is built from these pieces. See them all at `/design` in the running app.

## Rules

1. No number without a source. Every figure gets a `SourceChip`.
2. Hollow is kebera, solid is a person. A `Tickmark` fills in only when someone confirms it.
3. Judgment happens on the sign line. One `SignLine` per screen, one decision on it.

## Tokens (Tailwind)

| Token | Use |
| --- | --- |
| `ink`, `ink-soft`, `ink-muted` | Text; a person's commitment |
| `link`, `link-wash` | What kebera wrote, ran or cited; the main button |
| `pine`, `pine-wash` | Agreed, ties out, covered |
| `vermilion`, `vermilion-wash` | Exceptions only |
| `ochre`, `ochre-wash`, `ochre-rule` | The client; waiting on someone outside the firm |
| `ground`, `sheet`, `fill` | Grey ground, white sheets, grey pills |
| `rule`, `rule-soft`, `rule-strong` | Lines |
| `highlight` | Quoted evidence |

Fonts: `font-sans` Inter, `font-mono` Geist Mono (references and run ids), `font-serif` Newsreader (drafted prose).
`tnum` gives tabular figures. `rounded-card` is 18px, `shadow-card` the soft card shadow, `frosted` the glass blur.

## Components

- `@/components/tickmark`: `Tickmark`, `SourceChip`, `Chip`, `SampleChip`, `Kbd`, `Money`, `SignLine`,
  `AssertionStrip`, `AssertionRow`, `MaterialityRuler`, `RunReceipt`.
- `@/components/ui/button`: pill `Button`, variants `default` (blue), `secondary` (grey), `graphite`, `outline`,
  `ghost`, `destructive`, `link`.
- `@/components/ui/card`: `Card`.
- `@/components/layout/*`: `AppShell` with the frosted `Rail`; `EngagementLayout` renders `EngagementHeader` and the
  eight-stage `StageSpine` for every `/engagements/:id/...` route, so screens render only their own content (the
  engagement is available through `useOutletContext<Engagement>()`); `EngagementTabs` and `testTabs()` for stage tabs.
- `@/components/command`: `useRegisterCommands([...])` adds items to the Cmd-K palette while a screen is mounted.
  A free-text ask goes to `/ask?q=...`.
- `@/hooks/use-list-keys`: `useListKeys` gives J/K (and arrows) navigation plus single-key actions like R, W, E, Space.

## Routes

Screens still being built use `soon('Title')` in `src/app/router.tsx`. Replace that one line with your page's lazy
import. Engagement stages live at `/engagements/:id/{accept,connect,understand,materiality,risk,plan,evaluate,report}`;
the Test stage at `/engagements/:id/test/{analytics,tests,exceptions,workpapers,requests}`.
