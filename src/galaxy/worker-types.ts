import type { Galaxy, GalaxyParams } from "./types"

export type GalaxyWorkerRequest = {
	type: "generate"
	params: GalaxyParams
}

export type GalaxyWorkerResponse =
	| { type: "progress"; label: string; pct: number }
	| { type: "done"; galaxy: Galaxy }
	| { type: "error"; message: string }
