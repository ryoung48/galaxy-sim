import * as THREE from "three"

const N_SEGMENTS = 64

export function buildSelectionRing(): THREE.Line {
	const positions = new Float32Array((N_SEGMENTS + 1) * 3)
	for (let i = 0; i <= N_SEGMENTS; i++) {
		const a = (i / N_SEGMENTS) * Math.PI * 2
		positions[i * 3] = Math.cos(a)
		positions[i * 3 + 1] = Math.sin(a)
	}
	const geo = new THREE.BufferGeometry()
	geo.setAttribute("position", new THREE.BufferAttribute(positions, 3))
	const mat = new THREE.LineBasicMaterial({ color: 0x00ff88 })
	const ring = new THREE.Line(geo, mat)
	ring.visible = false
	ring.renderOrder = 1
	return ring
}

export function positionRing(
	ring: THREE.Line,
	systemIdx: number | null,
	systemPositions: Float32Array,
): void {
	if (systemIdx === null) {
		ring.visible = false
		return
	}
	ring.position.set(
		systemPositions[2 * systemIdx],
		systemPositions[2 * systemIdx + 1],
		1,
	)
	ring.visible = true
}
