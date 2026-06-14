import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import type { Galaxy } from "../types"
import {
	buildCoreGlow,
	buildInnerCircle,
	buildRimCircle,
	buildSpiralNebula,
} from "./background"
import { HALF_H } from "./constants"
import { buildLanesGeometry } from "./lanes"
import { buildPointsGeometry } from "./points"
import { buildSelectionRing, positionRing } from "./ring"

const RING_SCREEN_PX = 6
const PICK_SCREEN_PX = 16

export interface GalaxyScene {
	dispose(): void
	resize(): void
	updateGalaxy(galaxy: Galaxy | null): void
	pick(clientX: number, clientY: number): number | null
	setSelected(systemIndex: number | null): void
}

export function createGalaxyScene(canvas: HTMLCanvasElement): GalaxyScene {
	const renderer = new THREE.WebGLRenderer({ canvas, antialias: true })
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

	const scene = new THREE.Scene()
	scene.background = new THREE.Color(0x020408)

	const initialAspect =
		canvas.clientWidth > 0 && canvas.clientHeight > 0
			? canvas.clientWidth / canvas.clientHeight
			: 16 / 9
	const camera = new THREE.OrthographicCamera(
		-HALF_H * initialAspect,
		HALF_H * initialAspect,
		HALF_H,
		-HALF_H,
		0.1,
		2000,
	)
	camera.position.set(0, 0, 100)
	camera.lookAt(0, 0, 0)
	renderer.setSize(
		canvas.clientWidth || window.innerWidth,
		canvas.clientHeight || window.innerHeight,
		false,
	)

	const controls = new OrbitControls(camera, canvas)
	controls.enableRotate = false
	controls.mouseButtons = {
		LEFT: THREE.MOUSE.PAN,
		MIDDLE: THREE.MOUSE.DOLLY,
		RIGHT: THREE.MOUSE.PAN,
	}
	controls.enableDamping = true
	controls.dampingFactor = 0.09
	controls.panSpeed = 1.4
	controls.screenSpacePanning = true
	controls.enableZoom = true
	controls.zoomToCursor = true
	controls.minZoom = 0.3
	controls.maxZoom = 80

	let rafId = -1
	let galaxyGroup: THREE.Group | null = null
	let pointsMesh: THREE.Points | null = null
	let pointToSystem: Int32Array | null = null
	let systemPositions: Float32Array | null = null

	const ring = buildSelectionRing()
	scene.add(ring)

	const worldPerPx = () =>
		canvas.clientHeight > 0
			? (2 * HALF_H) / (camera.zoom * canvas.clientHeight)
			: 1

	const animate = () => {
		rafId = requestAnimationFrame(animate)
		controls.update()

		if (pointsMesh) {
			;(pointsMesh.material as THREE.PointsMaterial).size = Math.max(
				0.1,
				4 * Math.min(1, camera.zoom ** 1.5),
			)
		}

		if (ring.visible) {
			const r = RING_SCREEN_PX * worldPerPx() * camera.zoom ** 0.25
			ring.scale.set(r, r, 1)
		}

		renderer.render(scene, camera)
	}
	rafId = requestAnimationFrame(animate)

	function disposeGroup(group: THREE.Group) {
		group.traverse((obj) => {
			const mesh = obj as THREE.Mesh
			if (mesh.geometry) mesh.geometry.dispose()
			if (mesh.material) {
				const mats = Array.isArray(mesh.material)
					? mesh.material
					: [mesh.material]
				mats.forEach((m: THREE.Material) => {
					const materialWithMap = m as THREE.Material & {
						map?: THREE.Texture | null
					}
					materialWithMap.map?.dispose()
					m.dispose()
				})
			}
		})
	}

	return {
		dispose() {
			cancelAnimationFrame(rafId)
			if (galaxyGroup) {
				disposeGroup(galaxyGroup)
				scene.remove(galaxyGroup)
			}
			controls.dispose()
			renderer.dispose()
		},

		resize() {
			const w = canvas.clientWidth
			const h = canvas.clientHeight
			if (w === 0 || h === 0) return
			renderer.setSize(w, h, false)
			const aspect = w / h
			camera.left = -HALF_H * aspect
			camera.right = HALF_H * aspect
			camera.top = HALF_H
			camera.bottom = -HALF_H
			camera.updateProjectionMatrix()
		},

		updateGalaxy(galaxy: Galaxy | null) {
			if (galaxyGroup) {
				disposeGroup(galaxyGroup)
				scene.remove(galaxyGroup)
				galaxyGroup = null
			}
			pointsMesh = null
			pointToSystem = null
			systemPositions = null
			ring.visible = false
			if (!galaxy) return

			const result = buildPointsGeometry(galaxy)
			pointsMesh = result.points
			pointToSystem = result.pointToSystem
			systemPositions = result.systemPositions

			const group = new THREE.Group()
			group.add(buildSpiralNebula(galaxy.radiusMax, galaxy.radiusMin))
			group.add(buildCoreGlow(galaxy.radiusMin))
			group.add(buildInnerCircle(galaxy.radiusMin))
			group.add(buildRimCircle(galaxy.radiusMax))
			group.add(buildLanesGeometry(galaxy))
			group.add(pointsMesh)
			scene.add(group)
			galaxyGroup = group
		},

		pick(clientX: number, clientY: number): number | null {
			if (!pointsMesh || !pointToSystem) return null
			const rect = canvas.getBoundingClientRect()
			const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1
			const ndcY = -((clientY - rect.top) / rect.height) * 2 + 1
			const raycaster = new THREE.Raycaster()
			const threshold = PICK_SCREEN_PX * worldPerPx()
			;(raycaster.params as { Points?: { threshold: number } }).Points = {
				threshold,
			}
			raycaster.setFromCamera(new THREE.Vector2(ndcX, ndcY), camera)
			const hits = raycaster.intersectObject(pointsMesh)
			if (hits.length === 0 || hits[0].index == null) return null
			return pointToSystem[hits[0].index]
		},

		setSelected(systemIdx) {
			if (systemPositions) positionRing(ring, systemIdx, systemPositions)
			else ring.visible = false
		},
	}
}
