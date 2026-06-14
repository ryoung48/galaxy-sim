# Galaxy Setup

## Current Project Galaxy Generation

Right now, the project generates **map geometry and hyperlane topology**. It does not yet generate the full political and economic simulation described in the rest of this ruleset.

Generation inputs are:

- `seed`
- `numSystems`

The current UI defaults are:

- `seed = "abc123"`
- `numSystems = 2000`

The generator currently works like this:

1. **Place** `N` systems in a ring-shaped distribution with roughly even spacing.
2. Try each placement up to 30 times before accepting the last sampled position.
3. **Triangulate** all placed systems with Delaunay triangulation.
4. Convert the triangulation into a full undirected adjacency graph stored as CSR (`adjOffset`, `adjList`).
5. Mark systems with `r_edge` to distinguish the usable ring from systems treated as edge/core outliers.
6. **Build hyperlanes** from the Delaunay adjacency using a randomized Prim-style spanning process over non-edge systems:
   - start from the first non-edge system,
   - assign random weights from the seeded RNG when pushing candidate Delaunay edges,
   - reject any lane whose segment crosses the inner core,
   - continue until all non-edge systems reachable under that rule are connected.
7. Revisit the rejected non-core-crossing edges, shuffle them with the same seeded RNG, and add 30% of them back as extra lanes.

The generated galaxy currently contains:

- system coordinates: `r_xy`
- edge flags: `r_edge`
- Delaunay adjacency: `adjOffset`, `adjList`
- hyperlanes: `lanes`, `laneCount`

The result is a deterministic ring-shaped galaxy with dense local neighborhood data and a thinner hyperlane network that avoids cutting through the center.

## Prospective Simulation Initialization

Once the galaxy layout exists, the simulation layer would initialize political state like this:

1. **Capacity** is drawn from a skewed distribution so rich systems are rare: `C = 1 + ⌊Exp(λ=0.6)⌋`, clamped to `[1, 10]`. Most systems are poor; a few are highly desirable.
2. **Seed** `K` nations on random systems with degree ≥ 2. Each starts: 1 system at `D = ⌈C/2⌉`, `F = 0`, `T = 20`, no fleets, `a, e ~ Uniform(0,1)`, all `O = 0`.
3. All other systems start unowned with `D = 0`.

Tuning `N` and `K` changes the feel of the map. Sparse galaxies produce slower expansion games; dense galaxies produce more constant border pressure.

## Default Constants (tune these)

| Constant | Symbol | Default | Lever it controls |
|---|---|---|---|
| growth rate | `g` | 0.10 | how fast peace pays off |
| Industry per development | — | 1.0 | overall economy scale |
| fleet upkeep | `u` | 0.10 | hard cap on military size |
| build cost | — | 1 I → 1 S | guns-vs-expansion tradeoff |
| fortify cost | — | 1 I → 1 F (cap `F ≤ D`) | defense affordability |
| colonize cost | `κ·C` | `κ = 2` | how contested rich systems are |
| war damage | `δ` | 0.50 | conquest vs colonization bias |
| combat luck | `m` | U(0.85, 1.15) | frequency of upsets |
| secession treasury | — | 5 | viability of breakaway states |
| war threshold | — | `O < −40` | how warlike the galaxy is |
