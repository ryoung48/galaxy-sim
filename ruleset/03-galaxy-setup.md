# Galaxy Setup

## Galaxy Generation

1. **Place** `N` systems at random 2D points (Poisson-disk for even spread).
2. **Connect** with a Delaunay triangulation, then **prune** every edge longer than the 75th-percentile length. This guarantees varied degree: hubs, chains, dead-ends, and **cut-vertices (chokepoints) emerge naturally**.
3. **Capacity** is drawn skewed so wealth is rare: `C = 1 + ⌊Exp(λ=0.6)⌋`, clamped to `[1, 10]`. Most systems are poor; a few are coveted.
4. **Seed** `K` nations on random systems with degree ≥ 2. Each starts: 1 system at `D = ⌈C/2⌉`, `F = 0`, `T = 20`, no fleets, `a, e ~ Uniform(0,1)`, all `O = 0`.
5. All other systems start unowned with `D = 0`.

Tune `N`, `K` for density. Sparse galaxies → empire-builder epics; dense galaxies → constant border wars.

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
