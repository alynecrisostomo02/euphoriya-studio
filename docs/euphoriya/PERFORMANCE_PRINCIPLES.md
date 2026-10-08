# Euphoriya performance principles

## Product intent

Euphoriya should feel technologically modern and fast without adopting a generic
modern-SaaS aesthetic. The visual language remains vintage fantasy, mystical,
enchanted, celestial, editorial, illustrated, and storybook-inspired.

Performance is part of the fantasy: page turns, constellation lines, ink reveals,
particles, portraits, maps, and ambient scenes should respond immediately and
never make the workspace feel heavy.

These principles apply to the current Vue/Quasar/Electron application and should
remain useful for a future browser/PWA adapter. Electron is an adapter, not the
domain boundary.

## Experience targets

Targets are budgets, not promises detached from measurement. Validate them on a
representative desktop and a mid-range mobile device when a browser/PWA surface
exists.

| Interaction | Target |
| --- | --- |
| Visible response to pointer/keyboard input | within 100 ms |
| Typical local repository read (p95) | within 100 ms |
| Character autosave acknowledgement | within 250 ms after validation |
| Project overview usable after database open | within 1.5 s for a normal project |
| Desktop cold start to usable shell | within 3 s on the reference machine |
| Animation frame rate | 60 fps when supported; no essential interaction below 30 fps |
| Long main-thread task | avoid tasks over 50 ms; split or move expensive work |
| Future web/PWA LCP | at most 2.5 s on the reference mobile profile |
| Future web/PWA INP | at most 200 ms |
| Future web/PWA CLS | at most 0.1 |

Performance tests must define the fixture size and reference hardware. A passing
number without those two facts is not evidence.

## Rendering and motion

1. Prefer `transform` and `opacity` for animation. Avoid animating layout-heavy
   properties across large subtrees.
2. Treat particles, dust, leaves, stars, glow, and ambient backgrounds as
   progressive enhancement. Content and navigation must work without them.
3. Cap particle counts by viewport and device capability. Pause ambient animation
   when the page is hidden, the component is offscreen, or the window is
   unfocused.
4. Respect `prefers-reduced-motion`. Also provide an in-product effect intensity
   setting: reduced, subtle (default), and rich.
5. Do not stack several continuous effects in the same viewport. Establish one
   dominant ambient effect per scene or region.
6. Load route-specific visual code only when that experience is entered. Story
   Mode, Atlas, graph visualization, and rich editors must not inflate the initial
   Character Studio path.
7. Preserve focus, keyboard navigation, contrast, and readable text when effects
   are disabled.

## Vue and application shell

- Lazy-load feature routes and heavy dialogs.
- Keep domain data outside large deeply reactive objects. Expose focused DTOs and
  paginated/queryable collections from application services.
- Virtualize long character, media, timeline, search, and event collections.
- Debounce search and autosave at the application-service boundary while keeping
  immediate local UI feedback.
- Cancel stale searches and media loads when navigation changes.
- Avoid loading Narra or Loreum runtimes. Reference projects do not belong in the
  production bundle.
- Measure bundle composition before adding a large animation, graph, editor, map,
  or media dependency.
- Prefer one shared implementation for desktop and future web presentation logic,
  while storage and filesystem access remain adapters.

## Database and repositories

The renderer never receives `better-sqlite3`, raw SQL, arbitrary filesystem
access, or a generic `query(sql)` IPC method.

The flow remains:

```text
UI -> Application Service -> Repository -> Database Provider
```

Repository APIs should:

- select only the fields required by the current view;
- paginate large archives and histories;
- use measured indexes for real query patterns;
- avoid N+1 reads for galleries, relationships, scenes, and knowledge;
- keep FTS5 derived and rebuildable;
- execute related writes transactionally;
- expose cancellation or stale-result protection where the adapter permits it;
- avoid serializing the entire project into renderer memory.

The legacy Fantasia Archive database version and the Euphoriya data schema version
remain separate version domains. This document does not authorize a new migration,
renumbering, or modification of a `.faproject` file.

SQLite journal mode must be selected together with lifecycle and backup design.
If WAL is adopted, create/open/close/backup/restore must explicitly manage
checkpointing and sidecar files. Do not enable it as an isolated performance tweak.

## Autosave

Character Studio uses autosave, but autosave must not issue a database write on
every keystroke.

- Update the local editing model immediately.
- Validate incrementally.
- Persist after a short idle window or meaningful field transition.
- Flush pending valid changes before close/navigation.
- Surface saving, saved, offline, and failed states without blocking creation.
- Preserve recent undo and periodic snapshots.
- Coalesce compatible edits into useful version-history entries.
- Never promote drafts, imports, AI suggestions, rumors, or alternate paths to
  canon through autosave.

## Media

Imported media is copied into the project's `media/` directory and referenced by
a project-relative path.

- Preserve originals; generate thumbnails/previews as derived assets.
- Use correctly sized thumbnails in character galleries and search results.
- Decode large images away from critical navigation when the platform permits it.
- Lazy-load offscreen images and panels.
- Store dimensions, media type, content hash, and preview status in metadata.
- Never put large image, audio, or video payloads in renderer state.
- Pause audio/video and expensive visual processing when not visible.
- Missing derived previews must be rebuildable from the original.

## Project lifecycle, backup, and restore

Performance optimizations must not weaken durability.

- Create/open validates the manifest and database compatibility before exposing
  repositories.
- Use quick health checks during normal open and reserve deep checks for explicit
  validation, migration, backup, restore, recovery, or detected inconsistency.
- Backup uses SQLite's safe backup mechanism and staging validation, not a raw
  copy of an active database.
- Restore validates into staging and creates a safety backup before promotion.
- Promotion must be atomic or recoverable.
- A failure leaves the active project untouched.
- Projects opened as references are read-only until an explicit edit transition.

The portable layout remains:

```text
EuphoriyaProject/
├── project.json
├── euphoriya.db
├── media/
├── backups/
└── exports/
```

## Performance-aware visual system

The intended default atmosphere is mystical twilight. Visual richness should come
from composition, typography, illustration, color, texture, and carefully timed
motion—not from running many effects continuously.

Prefer:

- static or lightly animated textures;
- precomposed ornamental assets;
- restrained glow layers;
- small, bounded particle fields;
- responsive image variants;
- scene-level effect budgets;
- CSS design tokens shared by desktop and future web adapters.

Avoid:

- full-screen blur stacks;
- multiple large translucent layers;
- permanent parallax on every surface;
- unbounded canvas particles;
- autoplay media without user intent;
- decorative effects that delay input or reading;
- hiding essential status solely inside animation.

## Measurement and regression gates

Focused Euphoriya checks are authoritative while third-party source trees remain
isolated.

Add measurements incrementally:

1. project create/open/close fixture timing;
2. repository query benchmarks at small, medium, and large fixture sizes;
3. character gallery render and scroll test;
4. autosave write-coalescing test;
5. media thumbnail loading test;
6. animation test with effects subtle, rich, and reduced;
7. memory sampling after repeated project open/close;
8. backup/restore timing plus integrity verification;
9. future web Core Web Vitals on desktop and mid-range mobile profiles.

Classify failures as either:

- **EUPHORIYA REGRESSION** — caused by integrated product code; or
- **THIRD-PARTY / PREEXISTING** — isolated Narra, Loreum, upstream download, or
  repository-configuration failure.

Do not weaken Euphoriya checks to make unrelated source-reference errors appear
green.

## Immediate application order

1. Reconcile legacy v12, Euphoriya v1, and Euphoriya v2 version domains.
2. Implement the portable project lifecycle and safe backup/restore.
3. Connect existing repositories to the active Euphoriya project context.
4. Connect the first Character Studio slice: identity, species, portrait,
   autosave, close, reopen, and persistence verification.
5. Measure the vertical slice before adding heavier visual effects.
6. Introduce the shared effect-intensity setting and reduced-motion behavior.
7. Optimize only from captured measurements, preserving the Euphoriya visual
   identity.
