import { generateGalaxy } from "./generate"
import type { GalaxyWorkerRequest, GalaxyWorkerResponse } from "./worker-types"

type WorkerScope = typeof self & {
	onmessage: ((event: MessageEvent<GalaxyWorkerRequest>) => void) | null
	postMessage: (message: GalaxyWorkerResponse, transfer: Transferable[]) => void
}

const ctx = self as WorkerScope

ctx.onmessage = (event: MessageEvent<GalaxyWorkerRequest>) => {
	const { type, params } = event.data

	if (type === "generate") {
		try {
			const progressCb = (label: string, pct: number) => {
				const msg: GalaxyWorkerResponse = { type: "progress", label, pct }
				self.postMessage(msg)
			}

			progressCb("Initializing...", 0)

			const galaxy = generateGalaxy(params, progressCb)

			const transferList: Transferable[] = [
				galaxy.r_xy.buffer,
				galaxy.r_edge.buffer,
				galaxy.adjOffset.buffer,
				galaxy.adjList.buffer,
				galaxy.lanes.buffer,
			]

			const doneMsg: GalaxyWorkerResponse = { type: "done", galaxy }
			ctx.postMessage(doneMsg, transferList)
		} catch (error) {
			const errorMsg: GalaxyWorkerResponse = {
				type: "error",
				message: error instanceof Error ? error.message : "Unknown error",
			}
			self.postMessage(errorMsg)
		}
	}
}
