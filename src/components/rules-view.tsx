import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Button } from "@/components/ui/button"
import {
	getRulesHref,
	type RulesPage,
	resolveRulesLink,
	rulesPages,
} from "@/rules/content"

interface RulesViewProps {
	page: RulesPage
}

export function RulesView({ page }: RulesViewProps) {
	return (
		<div className="rules-shell min-h-screen bg-[radial-gradient(circle_at_top,_rgba(0,212,255,0.12),_transparent_32%),linear-gradient(180deg,_#08111b_0%,_#091827_48%,_#050b12_100%)] text-white">
			<div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 py-6 md:px-8 lg:flex-row lg:gap-12 lg:px-12">
				<aside className="lg:sticky lg:top-6 lg:h-fit lg:w-72 lg:self-start">
					<div className="overflow-hidden border border-white/10 bg-black/25 backdrop-blur">
						<div className="border-b border-white/10 px-5 py-4">
							<div className="text-[0.68rem] tracking-[0.28em] text-cyan-300/80 uppercase">
								Interstellar Nation Simulator
							</div>
							<h1 className="mt-2 text-2xl font-medium tracking-[0.08em] uppercase">
								Ruleset
							</h1>
						</div>
						<nav className="flex flex-col gap-1 p-3">
							{rulesPages.map((entry, index) => {
								const active = entry.slug === page.slug
								return (
									<a
										key={entry.sourceName}
										href={getRulesHref(entry.slug)}
										className={`block border px-4 py-3 transition-colors ${
											active
												? "border-cyan-300/40 bg-cyan-300/10 text-cyan-100"
												: "border-white/8 bg-white/[0.03] text-white/72 hover:border-white/16 hover:bg-white/[0.05] hover:text-white"
										}`}
									>
										<div className="text-[0.62rem] tracking-[0.22em] text-white/40 uppercase">
											{String(index).padStart(2, "0")}
										</div>
										<div className="mt-1 text-sm tracking-[0.08em] uppercase">
											{entry.title}
										</div>
									</a>
								)
							})}
						</nav>
						<div className="border-t border-white/10 p-3">
							<Button
								asChild
								variant="outline"
								className="w-full border-white/15 bg-transparent text-white hover:bg-white/8 hover:text-white"
							>
								<a href="#">Back To Simulator</a>
							</Button>
						</div>
					</div>
				</aside>

				<main className="min-w-0 flex-1">
					<div className="overflow-hidden border border-white/10 bg-black/20 shadow-[0_24px_100px_rgba(0,0,0,0.35)] backdrop-blur">
						<div className="border-b border-white/10 px-5 py-4 md:px-8 md:py-6">
							<div className="text-[0.68rem] tracking-[0.28em] text-cyan-300/80 uppercase">
								Reference
							</div>
							<h2 className="mt-2 text-3xl font-medium tracking-[0.08em] uppercase md:text-4xl">
								{page.title}
							</h2>
						</div>
						<article className="rules-prose px-5 py-6 md:px-8 md:py-8">
							<ReactMarkdown
								remarkPlugins={[remarkGfm]}
								components={{
									a: ({ href = "", ...props }) => (
										<a href={resolveRulesLink(href)} {...props} />
									),
								}}
							>
								{page.markdown}
							</ReactMarkdown>
						</article>
					</div>
				</main>
			</div>
		</div>
	)
}
