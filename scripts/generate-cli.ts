import { generateGalaxy } from "../src/galaxy/generate"
import type { Galaxy, GalaxyParams } from "../src/galaxy/types"

function encodeGalaxyParams(params: Omit<GalaxyParams, "seed">) {
	return [
		params.numSystems,
		params.radiusMin,
		params.radiusMax,
		params.width,
		params.height,
	]
		.map((value) => value.toString(36))
		.join("-")
}

function decodeGalaxyCode(code: string): {
	seed: string
	params?: Omit<GalaxyParams, "seed">
} {
	const [seedPart, encodedPart] = code.split(".", 2)
	const seed = seedPart.trim()

	if (!encodedPart) return { seed }

	const values = encodedPart.split("-").map((part) => Number.parseInt(part, 36))

	if (values.length !== 5 || values.some((v) => !Number.isFinite(v))) {
		return { seed }
	}

	const [numSystems, radiusMin, radiusMax, width, height] = values
	return { seed, params: { numSystems, radiusMin, radiusMax, width, height } }
}

function usage() {
	process.stderr.write(
		[
			"Usage: generate <galaxyCode>",
			"",
			"  galaxyCode  Galaxy code in the format: seed.numSystems-radiusMin-radiusMax-width-height",
			"              (all values base-36 encoded).",
			"              Example: abc123.8c-5k-jg-18g-18g",
			"",
		].join("\n"),
	)
}

if (process.argv.includes("--help") || process.argv.includes("-h")) {
	usage()
	process.exit(0)
}

const galaxyCode = process.argv[2]

if (!galaxyCode) {
	process.stderr.write("Error: galaxy code is required\n\n")
	usage()
	process.exit(1)
}

const { seed, params: codeParams } = decodeGalaxyCode(galaxyCode)

if (!codeParams) {
	process.stderr.write("Error: invalid or incomplete galaxy code\n\n")
	usage()
	process.exit(1)
}

const params: GalaxyParams = {
	seed,
	...codeParams,
}

const galaxy: Galaxy = generateGalaxy(params, (label, pct) => {
	process.stderr.write(`\r${label} ${pct}%`)
})
process.stderr.write("\n")

const nSystems = galaxy.numSystems
const edgeCount = galaxy.r_edge.reduce((a, b) => a + b, 0)
const nonEdgeCount = nSystems - edgeCount
const outputCode = `${seed}.${encodeGalaxyParams(params)}`

let delaunayDegSum = 0
const degHist: Record<number, number> = {}
for (let i = 0; i < nSystems; i++) {
	const deg = galaxy.adjOffset[i + 1] - galaxy.adjOffset[i]
	if (!galaxy.r_edge[i]) {
		delaunayDegSum += deg
	}
	degHist[deg] = (degHist[deg] || 0) + 1
}

const sampleCount = Math.min(nSystems, 5)
const sampleSystems: Record<string, unknown>[] = []
for (let i = 0; i < sampleCount; i++) {
	const n: number[] = []
	for (let j = galaxy.adjOffset[i]; j < galaxy.adjOffset[i + 1]; j++) {
		n.push(galaxy.adjList[j])
	}
	sampleSystems.push({
		idx: i,
		x: Math.round(galaxy.r_xy[2 * i]),
		y: Math.round(galaxy.r_xy[2 * i + 1]),
		edge: !!galaxy.r_edge[i],
		neighbors: n,
	})
}

const output = {
	params,
	galaxyCode: outputCode,
	stats: {
		numSystems: nSystems,
		laneCount: galaxy.laneCount,
		nonEdgeSystems: nonEdgeCount,
		edgeSystems: edgeCount,
		avgDelaunayDegree: (delaunayDegSum / nonEdgeCount).toFixed(2),
		degreeHistogram: Object.fromEntries(
			Object.entries(degHist).sort((a, b) => Number(a[0]) - Number(b[0])),
		),
		hyperlaneSample:
			galaxy.laneCount > 0
				? [...new Array(Math.min(10, galaxy.laneCount))].map((_, i) => [
						galaxy.lanes[2 * i],
						galaxy.lanes[2 * i + 1],
					])
				: [],
	},
	systemSample: sampleSystems,
}

process.stdout.write(JSON.stringify(output, null, 2) + "\n")
