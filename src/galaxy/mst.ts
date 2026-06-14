import type { ScaledRng } from "./rng"

interface MSTInput {
	r_xy: Float32Array
	r_edge: Uint8Array
	adjOffset: Int32Array
	adjList: Int32Array
	numSystems: number
	cx: number
	cy: number
	coreRadius: number
}

interface MSTOutput {
	lanes: Int32Array
	laneCount: number
}

class MinHeap {
	private cap: number
	private size = 0
	private weights: Float64Array
	private froms: Int32Array
	private tos: Int32Array

	constructor(cap = 512) {
		this.cap = cap
		this.weights = new Float64Array(cap)
		this.froms = new Int32Array(cap)
		this.tos = new Int32Array(cap)
	}

	get length() {
		return this.size
	}

	private grow(): void {
		const next = this.cap * 2
		const w = new Float64Array(next)
		w.set(this.weights)
		const f = new Int32Array(next)
		f.set(this.froms)
		const t = new Int32Array(next)
		t.set(this.tos)
		this.weights = w
		this.froms = f
		this.tos = t
		this.cap = next
	}

	push(from: number, to: number, weight: number): void {
		if (this.size >= this.cap) this.grow()
		let i = this.size++
		this.weights[i] = weight
		this.froms[i] = from
		this.tos[i] = to
		while (i > 0) {
			const p = (i - 1) >>> 1
			if (this.weights[p] <= this.weights[i]) break
			this.swap(i, p)
			i = p
		}
	}

	pop(): [from: number, to: number] {
		const from = this.froms[0]
		const to = this.tos[0]
		const last = --this.size
		this.weights[0] = this.weights[last]
		this.froms[0] = this.froms[last]
		this.tos[0] = this.tos[last]
		let i = 0
		while (true) {
			const l = (i << 1) + 1
			const r = l + 1
			let s = i
			if (l < this.size && this.weights[l] < this.weights[s]) s = l
			if (r < this.size && this.weights[r] < this.weights[s]) s = r
			if (s === i) break
			this.swap(i, s)
			i = s
		}
		return [from, to]
	}

	private swap(a: number, b: number): void {
		const tmp = this.weights[a]
		this.weights[a] = this.weights[b]
		this.weights[b] = tmp
		let ti = this.froms[a]
		this.froms[a] = this.froms[b]
		this.froms[b] = ti
		ti = this.tos[a]
		this.tos[a] = this.tos[b]
		this.tos[b] = ti
	}
}

function segmentCrossesCircle(
	x1: number,
	y1: number,
	x2: number,
	y2: number,
	cx: number,
	cy: number,
	r: number,
): boolean {
	const dx = x2 - x1
	const dy = y2 - y1
	const fx = x1 - cx
	const fy = y1 - cy
	const a = dx * dx + dy * dy
	const b = 2 * (fx * dx + fy * dy)
	const c = fx * fx + fy * fy - r * r
	const disc = b * b - 4 * a * c
	if (disc < 0) return false
	const sq = Math.sqrt(disc)
	const t1 = (-b - sq) / (2 * a)
	const t2 = (-b + sq) / (2 * a)
	return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1) || (t1 < 0 && t2 > 1)
}

function shufflePairs(pairs: [number, number][], rng: ScaledRng): void {
	for (let i = pairs.length - 1; i > 0; i--) {
		const j = Math.floor(rng() * (i + 1))
		const tmp = pairs[i]
		pairs[i] = pairs[j]
		pairs[j] = tmp
	}
}

export function buildScaledMST(
	{
		r_xy,
		r_edge,
		adjOffset,
		adjList,
		numSystems,
		cx,
		cy,
		coreRadius,
	}: MSTInput,
	rng: ScaledRng,
): MSTOutput {
	let startIdx = 0
	while (startIdx < numSystems && r_edge[startIdx]) startIdx++
	if (startIdx >= numSystems) return { lanes: new Int32Array(0), laneCount: 0 }

	let nonEdgeCount = 0
	for (let i = 0; i < numSystems; i++) if (!r_edge[i]) nonEdgeCount++

	const visited = new Uint8Array(numSystems)
	const laneBuffer: number[] = []
	const rejectBuffer: [number, number][] = []
	const heap = new MinHeap(512)

	visited[startIdx] = 1
	let visitedCount = 1

	for (let j = adjOffset[startIdx]; j < adjOffset[startIdx + 1]; j++) {
		const nb = adjList[j]
		if (!r_edge[nb]) heap.push(startIdx, nb, rng())
	}

	while (visitedCount < nonEdgeCount && heap.length > 0) {
		const [a, b] = heap.pop()
		const ax = r_xy[2 * a],
			ay = r_xy[2 * a + 1]
		const bx = r_xy[2 * b],
			by = r_xy[2 * b + 1]
		const crossesCore = segmentCrossesCircle(ax, ay, bx, by, cx, cy, coreRadius)
		if (visited[b] || crossesCore) {
			rejectBuffer.push([a, b])
			continue
		}
		visited[b] = 1
		visitedCount++
		laneBuffer.push(a, b)

		for (let j = adjOffset[b]; j < adjOffset[b + 1]; j++) {
			const nb = adjList[j]
			if (!visited[nb] && !r_edge[nb]) heap.push(b, nb, rng())
		}
	}

	const safeRejects = rejectBuffer.filter(([a, b]) => {
		const ax = r_xy[2 * a],
			ay = r_xy[2 * a + 1]
		const bx = r_xy[2 * b],
			by = r_xy[2 * b + 1]
		return !segmentCrossesCircle(ax, ay, bx, by, cx, cy, coreRadius)
	})
	shufflePairs(safeRejects, rng)
	const extraCount = Math.floor(safeRejects.length * 0.3)
	for (let i = 0; i < extraCount; i++) {
		laneBuffer.push(safeRejects[i][0], safeRejects[i][1])
	}

	const lanes = new Int32Array(laneBuffer)
	return { lanes, laneCount: lanes.length / 2 }
}
