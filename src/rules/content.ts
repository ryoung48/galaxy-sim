import contentsMarkdown from "../../ruleset/00-contents.md?raw"
import worldStateMarkdown from "../../ruleset/01-world-state.md?raw"
import galaxySetupMarkdown from "../../ruleset/02-galaxy-setup.md?raw"
import phaseRulesMarkdown from "../../ruleset/03-phase-rules.md?raw"

export interface RulesPage {
	slug: string
	title: string
	sourceName: string
	markdown: string
}

export const rulesPages: RulesPage[] = [
	{
		slug: "",
		title: "Contents",
		sourceName: "00-contents.md",
		markdown: contentsMarkdown,
	},
	{
		slug: "world-state",
		title: "World State",
		sourceName: "01-world-state.md",
		markdown: worldStateMarkdown,
	},
	{
		slug: "galaxy-setup",
		title: "Galaxy Setup",
		sourceName: "02-galaxy-setup.md",
		markdown: galaxySetupMarkdown,
	},
	{
		slug: "phase-rules",
		title: "Phase Rules",
		sourceName: "03-phase-rules.md",
		markdown: phaseRulesMarkdown,
	},
]

const sourceNameToSlug = new Map(
	rulesPages.map((page) => [page.sourceName, page.slug] as const),
)

export function getRulesHref(slug = "") {
	return slug ? `#/rules/${slug}` : "#/rules"
}

export function getRulesPage(slug: string) {
	return rulesPages.find((page) => page.slug === slug) ?? null
}

export function resolveRulesLink(href: string) {
	if (!href.startsWith("./")) {
		return href
	}

	const sourceName = href.slice(2)
	const slug = sourceNameToSlug.get(sourceName)
	return slug === undefined ? href : getRulesHref(slug)
}
