export type GalaxyParams = {
	seed: string
	numSystems: number
	radiusMin: number
	radiusMax: number
	width: number
	height: number
}

export type Galaxy = {
	seed: string
	numSystems: number
	r_xy: Float32Array
	r_edge: Uint8Array
	adjOffset: Int32Array
	adjList: Int32Array
	lanes: Int32Array
	laneCount: number
	radiusMin: number
	radiusMax: number
	width: number
	height: number
}
