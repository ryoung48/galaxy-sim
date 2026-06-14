import * as THREE from "three"
import type { Galaxy } from "../types"

export function buildLanesGeometry(galaxy: Galaxy): THREE.LineSegments {
	const { lanes, laneCount, r_xy, width, height } = galaxy
	const cx = width / 2
	const cy = height / 2

	const positions = new Float32Array(laneCount * 6)
	for (let i = 0; i < laneCount; i++) {
		const a = lanes[2 * i]
		const b = lanes[2 * i + 1]
		positions[6 * i] = r_xy[2 * a] - cx
		positions[6 * i + 1] = cy - r_xy[2 * a + 1]
		positions[6 * i + 2] = 0
		positions[6 * i + 3] = r_xy[2 * b] - cx
		positions[6 * i + 4] = cy - r_xy[2 * b + 1]
		positions[6 * i + 5] = 0
	}

	const geo = new THREE.BufferGeometry()
	geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))

	const mat = new THREE.LineBasicMaterial({
		color: 0xffffff,
		opacity: 0.12,
		transparent: true,
	})
	return new THREE.LineSegments(geo, mat)
}
