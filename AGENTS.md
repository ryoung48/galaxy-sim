# Guidelines

## UI / Design

- This project uses [shadcn/ui](https://ui.shadcn.com). Install new shadcn components as needed via `pnpm dlx shadcn add <component>` — do not hand-write UI components that shadcn provides. Never edit shadcn-generated component files directly.
- Use [Material Design Icons](https://pictogrammers.com/library/mdi/) for all icons. Grab the `<path>` SVG directly from the MDI SVG source (available on GitHub at `https://raw.githubusercontent.com/Templarian/MaterialDesign-SVG/master/svg/<icon-name>.svg`).
- Keep SVG icon paths as reusable React components in `src/components/icons/` rather than inlining them, so they can be reused across the app.

## Generation

- All stochastic logic must use seeded dice from `src/galaxy/rng.ts` — never `Math.random()` or ad-hoc randomness.
- All heavy computation (galaxy generation, star placement, simulation ticks, etc.) must run in a WebWorker to keep the main thread responsive.
- Data passed between the main thread and workers must use typed arrays (`Float64Array`, `Uint32Array`, etc.) — no boxing/unboxing or structured clone of large plain objects. Minimize copy overhead by transferring `ArrayBuffer` ownership via `postMessage` transfers.
- Worker entry points should accept a `SharedArrayBuffer` where possible so both sides can coordinate without copying.
- Use `pnpm generate [seed] [numSystems]` to run galaxy generation from the CLI and review the output as JSON. This runs the same algorithm used in the browser worker but outputs structured data for inspection and debugging.

## Verification

- Always run `pnpm lint` after completing a task and ensure it passes cleanly.
- Always run `pnpm typecheck` after completing a task and ensure it passes cleanly.
- After changing galaxy generation or simulation logic, verify with `pnpm generate [seed] [numSystems]` and inspect the JSON output (params, stats, system sample, hyperlanes) to confirm correctness.
- For deeper verification, create tailored test scripts in `scripts/` that import the relevant modules from `src/galaxy/` and assert on specific behaviors (e.g., fixed seeds produce expected star counts, lane topology, edge cases). These scripts can be run with `npx tsx scripts/<name>.ts`.
