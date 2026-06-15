import { useEffect, useState } from "react"
import { GalaxyView } from "@/components/galaxy-view"
import { RulesView } from "@/components/rules-view"
import { Button } from "@/components/ui/button"
import { getRulesPage } from "@/rules/content"

function getCurrentHash() {
	return window.location.hash || "#"
}

function getRouteFromHash(hash: string) {
	const normalized = hash.startsWith("#") ? hash.slice(1) : hash
	const [path] = normalized.split("?", 1)

	if (!path || path === "/") {
		return { kind: "simulator" as const }
	}

	if (path === "/rules") {
		return { kind: "rules" as const, slug: "" }
	}

	if (path.startsWith("/rules/")) {
		return { kind: "rules" as const, slug: path.slice("/rules/".length) }
	}

	return { kind: "not-found" as const }
}

function App() {
	const [hash, setHash] = useState(getCurrentHash)
	const route = getRouteFromHash(hash)
	const rulesPage =
		route.kind === "rules"
			? (getRulesPage(route.slug) ?? getRulesPage(""))
			: null

	useEffect(() => {
		const handleHashChange = () => setHash(getCurrentHash())
		window.addEventListener("hashchange", handleHashChange)
		return () => window.removeEventListener("hashchange", handleHashChange)
	}, [])

	useEffect(() => {
		const isDocsMode = route.kind === "rules"
		document.documentElement.classList.toggle("docs-mode", isDocsMode)
		document.body.classList.toggle("docs-mode", isDocsMode)
		return () => {
			document.documentElement.classList.remove("docs-mode")
			document.body.classList.remove("docs-mode")
		}
	}, [route.kind])

	if (route.kind === "rules" && rulesPage) {
		return <RulesView page={rulesPage} />
	}

	if (route.kind === "not-found") {
		window.location.hash = "#"
		return null
	}

	return (
		<>
			<GalaxyView />
			<div className="fixed right-3 top-3 z-[200]">
				<Button
					asChild
					variant="outline"
					className="border-white/10 bg-[rgba(6,10,16,0.9)] text-white/80 hover:bg-[rgba(8,14,22,0.95)] hover:text-white"
				>
					<a href="#/rules">Open Ruleset</a>
				</Button>
			</div>
		</>
	)
}

export default App
