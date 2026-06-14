import { useCallback, useEffect, useRef, useState } from "react"
import { CrosshairsIcon } from "@/components/icons/CrosshairsIcon"
import { Button } from "@/components/ui/button"
import { createGalaxyScene, type GalaxyScene } from "@/galaxy/renderer/scene"
import type { GalaxyParams } from "@/galaxy/types"
import type {
	GalaxyWorkerRequest,
	GalaxyWorkerResponse,
} from "@/galaxy/worker-types"
import { GalaxyControlPanel } from "./galaxy-control-panel"

const BASE_PARAMS = {
	radiusMin: 200,
	radiusMax: 700,
	width: 1600,
	height: 1600,
} as const

const PARAMS: GalaxyParams = {
	seed: "abc123",
	numSystems: 2000,
	...BASE_PARAMS,
}

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

function decodeGalaxyCode(code: string) {
	const [seedPart, encodedPart] = code.split(".", 2)
	const nextSeed = seedPart.trim()

	if (!encodedPart) {
		return { seed: nextSeed }
	}

	const values = encodedPart.split("-").map((part) => Number.parseInt(part, 36))

	if (values.length !== 5 || values.some((value) => !Number.isFinite(value))) {
		return { seed: nextSeed }
	}

	const [numSystems, radiusMin, radiusMax, width, height] = values
	return {
		seed: nextSeed,
		params: { numSystems, radiusMin, radiusMax, width, height },
	}
}

export function GalaxyView() {
	const canvasRef = useRef<HTMLCanvasElement>(null)
	const sceneRef = useRef<GalaxyScene | null>(null)
	const workerRef = useRef<Worker | null>(null)
	const [seed, setSeed] = useState(() => {
		const saved = localStorage.getItem("galaxy-code")
		if (!saved) return PARAMS.seed
		return decodeGalaxyCode(saved).seed
	})
	const [numSystems, setNumSystems] = useState(() => {
		const saved = localStorage.getItem("galaxy-code")
		if (!saved) return PARAMS.numSystems
		return decodeGalaxyCode(saved).params?.numSystems ?? PARAMS.numSystems
	})
	const [isGenerating, setIsGenerating] = useState(false)
	const [generationLabel, setGenerationLabel] = useState("")
	const [generationProgress, setGenerationProgress] = useState(0)
	const [panelOpen, setPanelOpen] = useState(true)
	const [selectedSystem, setSelectedSystem] = useState<number | null>(null)

	const pendingRef = useRef(false)
	const galaxyCode = `${seed}.${encodeGalaxyParams({ ...BASE_PARAMS, numSystems })}`

	useEffect(() => {
		const canvas = canvasRef.current!
		const scene = createGalaxyScene(canvas)
		sceneRef.current = scene
		scene.resize()
		const observer = new ResizeObserver(() => scene.resize())
		observer.observe(canvas)
		return () => {
			observer.disconnect()
			scene.dispose()
			sceneRef.current = null
		}
	}, [])

	useEffect(() => {
		const worker = new Worker(
			new URL("../galaxy/galaxy.worker.ts", import.meta.url),
			{ type: "module" },
		)

		worker.onmessage = (event: MessageEvent<GalaxyWorkerResponse>) => {
			const data = event.data
			if (data.type === "progress") {
				setGenerationLabel(data.label)
				setGenerationProgress(data.pct)
			} else if (data.type === "done") {
				sceneRef.current?.updateGalaxy(data.galaxy)
				setSelectedSystem(null)
				pendingRef.current = false
				setIsGenerating(false)
			} else if (data.type === "error") {
				pendingRef.current = false
				setIsGenerating(false)
			}
		}

		workerRef.current = worker

		return () => {
			worker.terminate()
			workerRef.current = null
		}
	}, [])

	const doGenerate = useCallback(() => {
		const worker = workerRef.current
		if (!worker || pendingRef.current) return
		localStorage.setItem("galaxy-code", galaxyCode)
		pendingRef.current = true
		setIsGenerating(true)
		setGenerationLabel("Initializing...")
		setGenerationProgress(0)
		const params: GalaxyParams = {
			seed,
			numSystems,
			...BASE_PARAMS,
		}
		const msg: GalaxyWorkerRequest = { type: "generate", params }
		worker.postMessage(msg)
	}, [seed, numSystems, galaxyCode])

	const handleGalaxyCodeChange = useCallback((value: string) => {
		const { seed: nextSeed, params } = decodeGalaxyCode(value)
		setSeed(nextSeed)
		if (
			params &&
			Number.isInteger(params.numSystems) &&
			params.numSystems > 0
		) {
			setNumSystems(params.numSystems)
		}
	}, [])

	const handleMouseMove = useCallback(
		(e: React.MouseEvent<HTMLCanvasElement>) => {
			sceneRef.current?.pick(e.clientX, e.clientY)
		},
		[],
	)

	const handleClick = useCallback(
		(e: React.MouseEvent<HTMLCanvasElement>) => {
			const scene = sceneRef.current
			if (!scene) return
			const hit = scene.pick(e.clientX, e.clientY)
			const next = hit === selectedSystem ? null : hit
			setSelectedSystem(next)
			scene.setSelected(next)
		},
		[selectedSystem],
	)

	return (
		<div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
			<canvas
				ref={canvasRef}
				style={{
					width: "100%",
					height: "100%",
					display: "block",
					cursor: selectedSystem !== null ? "pointer" : "default",
				}}
				onMouseMove={handleMouseMove}
				onClick={handleClick}
			/>

			<GalaxyControlPanel
				galaxyCode={galaxyCode}
				numSystems={numSystems}
				onSeedChange={setSeed}
				onGalaxyCodeChange={handleGalaxyCodeChange}
				onNumSystemsChange={setNumSystems}
				onGenerate={doGenerate}
				isGenerating={isGenerating}
				generationLabel={generationLabel}
				generationProgress={generationProgress}
				open={panelOpen}
				onOpenChange={setPanelOpen}
			/>

			{!panelOpen && (
				<Button
					onClick={() => setPanelOpen(true)}
					variant="outline"
					size="icon"
					className="fixed left-3 top-3 z-[200] border bg-transparent hover:bg-transparent"
					style={{
						background: "rgba(6, 10, 16, 0.9)",
						border: "1px solid rgba(255,255,255,0.08)",
						color: "rgba(255,255,255,0.6)",
					}}
				>
					<CrosshairsIcon width={16} height={16} />
				</Button>
			)}

			{selectedSystem !== null && (
				<div
					style={{
						position: "fixed",
						right: 16,
						top: 16,
						padding: "8px 16px",
						background: "rgba(2, 4, 8, 0.9)",
						border: "1px solid rgba(255,255,255,0.15)",
						backdropFilter: "blur(4px)",
						fontFamily: "Michroma, monospace",
						fontSize: "0.6rem",
						color: "rgba(255,255,255,0.4)",
						letterSpacing: "0.15em",
						textTransform: "uppercase",
					}}
				>
					<div>System #{String(selectedSystem).padStart(4, "0")}</div>
				</div>
			)}
		</div>
	)
}
