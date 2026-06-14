import Delaunator from "delaunator"
import { buildScaledMST } from "./mst"
import { makeScaledRng } from "./rng"
import type { Galaxy, GalaxyParams } from "./types"

function buildCSR(
	triangles: Uint32Array,
	halfedges: Int32Array,
	N: number,
): { adjOffset: Int32Array; adjList: Int32Array } {
	const numSides = triangles.length
	const next = (s: number) => (s % 3 === 2 ? s - 2 : s + 1)

	const degree = new Int32Array(N)
	for (let s = 0; s < numSides; s++) {
		const opp = halfedges[s]
		if (opp === -1 || s < opp) {
			degree[triangles[s]]++
			degree[triangles[next(s)]]++
		}
	}

	const adjOffset = new Int32Array(N + 1)
	for (let i = 0; i < N; i++) adjOffset[i + 1] = adjOffset[i] + degree[i]

	const adjList = new Int32Array(adjOffset[N])
	const cursor = new Int32Array(N)

	for (let s = 0; s < numSides; s++) {
		const opp = halfedges[s]
		if (opp === -1 || s < opp) {
			const a = triangles[s]
			const b = triangles[next(s)]
			adjList[adjOffset[a] + cursor[a]++] = b
			adjList[adjOffset[b] + cursor[b]++] = a
		}
	}

	return { adjOffset, adjList }
}

export function generateGalaxy(
	params: GalaxyParams,
	progressCb?: (label: string, pct: number) => void,
): Galaxy {
	const { seed, numSystems, radiusMin, radiusMax, width, height } = params
	const rng = makeScaledRng(seed)

	const cx = width / 2
	const cy = height / 2

	const coords = new Float64Array(2 * numSystems)
	const r_xy = new Float32Array(2 * numSystems)

	const annularArea = Math.PI * (radiusMax ** 2 - radiusMin ** 2)
	const minDist = 0.55 * Math.sqrt(annularArea / numSystems)
	const minDist2 = minDist * minDist

	const cellSize = minDist
	const gridW = Math.ceil(width / cellSize) + 2
	const gridCells = new Map<number, number[]>()
	const cellKey = (gx: number, gy: number) => gy * gridW + gx

	const addToGrid = (idx: number, x: number, y: number) => {
		const key = cellKey(Math.floor(x / cellSize), Math.floor(y / cellSize))
		const bucket = gridCells.get(key)
		if (bucket) bucket.push(idx)
		else gridCells.set(key, [idx])
	}

	const tooClose = (x: number, y: number, count: number): boolean => {
		const gx = Math.floor(x / cellSize)
		const gy = Math.floor(y / cellSize)
		for (let dy = -2; dy <= 2; dy++) {
			for (let dx = -2; dx <= 2; dx++) {
				const bucket = gridCells.get(cellKey(gx + dx, gy + dy))
				if (!bucket) continue
				for (const idx of bucket) {
					if (idx >= count) continue
					const ex = r_xy[2 * idx] - x
					const ey = r_xy[2 * idx + 1] - y
					if (ex * ex + ey * ey < minDist2) return true
				}
			}
		}
		return false
	}

	progressCb?.("Placing systems...", 10)

	const MAX_TRIES = 30
	for (let i = 0; i < numSystems; i++) {
		let x = 0,
			y = 0
		for (let attempt = 0; attempt < MAX_TRIES; attempt++) {
			const r = Math.sqrt(
				rng() * (radiusMax ** 2 - radiusMin ** 2) + radiusMin ** 2,
			)
			const angle = rng() * 2 * Math.PI
			x = cx + r * Math.cos(angle)
			y = cy + r * Math.sin(angle)
			if (!tooClose(x, y, i)) break
		}
		coords[2 * i] = x
		coords[2 * i + 1] = y
		r_xy[2 * i] = x
		r_xy[2 * i + 1] = y
		addToGrid(i, x, y)
	}

	progressCb?.("Triangulating...", 40)

	const delaunay = new Delaunator(coords)
	const { triangles, halfedges } = delaunay

	progressCb?.("Marking edges...", 60)

	const r_edge = new Uint8Array(numSystems)
	for (let i = 0; i < numSystems; i++) {
		const dx = r_xy[2 * i] - cx
		const dy = r_xy[2 * i + 1] - cy
		const dist = Math.hypot(dx, dy)
		r_edge[i] = dist > radiusMax || dist < radiusMin ? 1 : 0
	}

	progressCb?.("Building graph...", 70)

	const { adjOffset, adjList } = buildCSR(triangles, halfedges, numSystems)

	progressCb?.("Computing hyperlanes...", 81)

	const { lanes, laneCount } = buildScaledMST(
		{
			r_xy,
			r_edge,
			adjOffset,
			adjList,
			numSystems,
			cx,
			cy,
			coreRadius: radiusMin,
		},
		rng,
	)

	progressCb?.("Finalizing...", 98)

	return {
		seed,
		numSystems,
		r_xy,
		r_edge,
		adjOffset,
		adjList,
		lanes,
		laneCount,
		radiusMin,
		radiusMax,
		width,
		height,
	}
}
