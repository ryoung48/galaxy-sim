export type ScaledRng = () => number

export function makeScaledRng(seed: string): ScaledRng {
	const n = parseInt(seed, 36)
	let s = (Math.abs(Math.floor(n * 9301 + 49297)) % 2147483646) + 1
	return () => {
		s = (s * 16807) % 2147483647
		return (s - 1) / 2147483646
	}
}
