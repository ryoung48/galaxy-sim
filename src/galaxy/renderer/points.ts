import * as THREE from "three"
import type { Galaxy } from "../types"

function createGlowTexture(): THREE.DataTexture {
	const size = 32
	const data = new Uint8Array(size * size * 4)
	const r = size / 2
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			const dx = x - r + 0.5
			const dy = y - r + 0.5
			const t = Math.max(0, 1 - Math.sqrt(dx * dx + dy * dy) / r)
			const alpha = t > 0.65 ? 255 : Math.round(255 * Math.pow(t / 0.65, 1.8))
			const i = (y * size + x) * 4
			data[i] = 255
			data[i + 1] = 255
			data[i + 2] = 255
			data[i + 3] = alpha
		}
	}
	const tex = new THREE.DataTexture(data, size, size, THREE.RGBAFormat)
	tex.needsUpdate = true
	return tex
}

let _glowTex: THREE.DataTexture | null = null
const getGlowTexture = () => {
	_glowTex ??= createGlowTexture()
	return _glowTex
}

const DIM_GREY = { r: 0.2, g: 0.2, b: 0.2 }

function heatColor(t: number): { r: number; g: number; b: number } {
	const hue = ((1 - t) * 0.15 + 0.05) * 360
	const s = 1
	const l = 0.5 + t * 0.2
	const c = (1 - Math.abs(2 * l - 1)) * s
	const x = c * (1 - Math.abs(((hue / 60) % 2) - 1))
	const m = l - c / 2
	let rv = 0,
		gv = 0,
		bv = 0
	if (hue < 60) {
		rv = c
		gv = x
	} else if (hue < 120) {
		rv = x
		gv = c
	} else if (hue < 180) {
		gv = c
		bv = x
	} else if (hue < 240) {
		gv = x
		bv = c
	} else if (hue < 300) {
		rv = x
		bv = c
	} else {
		rv = c
		bv = x
	}
	return { r: rv + m, g: gv + m, b: bv + m }
}

export function buildPointsGeometry(galaxy: Galaxy): {
	points: THREE.Points
	pointToSystem: Int32Array
	systemPositions: Float32Array
} {
	const { numSystems, r_xy, r_edge, width, height } = galaxy
	const cx = width / 2
	const cy = height / 2

	const systemPositions = new Float32Array(numSystems * 2)
	for (let i = 0; i < numSystems; i++) {
		systemPositions[2 * i] = r_xy[2 * i] - cx
		systemPositions[2 * i + 1] = cy - r_xy[2 * i + 1]
	}

	const positions = new Float32Array(numSystems * 3)
	const colors = new Float32Array(numSystems * 3)
	const pointToSystem = new Int32Array(numSystems)

	for (let i = 0; i < numSystems; i++) {
		const wx = systemPositions[2 * i]
		const wy = systemPositions[2 * i + 1]
		positions[i * 3] = wx
		positions[i * 3 + 1] = wy
		pointToSystem[i] = i

		if (r_edge[i]) {
			colors[i * 3] = DIM_GREY.r
			colors[i * 3 + 1] = DIM_GREY.g
			colors[i * 3 + 2] = DIM_GREY.b
		} else {
			const dist = Math.hypot(wx, wy)
			const maxR = galaxy.radiusMax
			const t = Math.min(1, dist / maxR)
			const c = heatColor(t)
			colors[i * 3] = c.r
			colors[i * 3 + 1] = c.g
			colors[i * 3 + 2] = c.b
		}
	}

	const geo = new THREE.BufferGeometry()
	geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
	geo.setAttribute("color", new THREE.BufferAttribute(colors, 3))

	const mat = new THREE.PointsMaterial({
		size: 4,
		vertexColors: true,
		sizeAttenuation: false,
		map: getGlowTexture(),
		alphaTest: 0.02,
		transparent: true,
	})

	return {
		points: new THREE.Points(geo, mat),
		pointToSystem,
		systemPositions,
	}
}
