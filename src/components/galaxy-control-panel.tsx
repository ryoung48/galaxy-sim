import { useState } from "react"
import { CheckIcon } from "@/components/icons/CheckIcon"
import { CloseIcon } from "@/components/icons/CloseIcon"
import { ContentCopyIcon } from "@/components/icons/ContentCopyIcon"
import { CreationIcon } from "@/components/icons/CreationIcon"
import { DiceMultipleIcon } from "@/components/icons/DiceMultipleIcon"
import { PlayIcon } from "@/components/icons/PlayIcon"
import { SyncIcon } from "@/components/icons/SyncIcon"
import { Button } from "@/components/ui/button"
import { Field, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Sheet, SheetClose, SheetContent } from "@/components/ui/sheet"

interface Props {
	galaxyCode: string
	numSystems: number
	onSeedChange: (v: string) => void
	onGalaxyCodeChange: (v: string) => void
	onNumSystemsChange: (v: number) => void
	onGenerate: () => void
	isGenerating: boolean
	generationLabel: string
	generationProgress: number
	open: boolean
	onOpenChange: (open: boolean) => void
}

function randomSeed() {
	return Math.random().toString(36).slice(2, 8)
}

const panelStyle = {
	"--panel-bg": "rgba(6, 10, 16, 0.96)",
	"--panel-border": "rgba(255, 255, 255, 0.08)",
	"--panel-text": "rgba(255, 255, 255, 0.85)",
	"--panel-label": "rgba(255, 255, 255, 0.4)",
	"--panel-accent": "#00d4ff",
} as React.CSSProperties

export function GalaxyControlPanel({
	galaxyCode,
	numSystems,
	onSeedChange,
	onGalaxyCodeChange,
	onNumSystemsChange,
	onGenerate,
	isGenerating,
	generationLabel,
	generationProgress,
	open,
	onOpenChange,
}: Props) {
	const [copied, setCopied] = useState(false)

	return (
		<Sheet open={open} onOpenChange={onOpenChange} modal={false}>
			<SheetContent
				side="left"
				showCloseButton={false}
				className="flex flex-col border-0"
				style={{
					...panelStyle,
					width: 300,
					background: "var(--panel-bg)",
					borderRight: "1px solid var(--panel-border)",
				}}
			>
				{/* Header */}
				<div
					className="flex items-center gap-3 border-b shrink-0"
					style={{ borderColor: "var(--panel-border)", padding: "20px 12px" }}
				>
					<CreationIcon width={18} height={18} fill="var(--panel-accent)" />
					<span
						className="text-[0.75rem] tracking-[0.18em] flex-1"
						style={{
							fontFamily: "Michroma, monospace",
							color: "var(--panel-text)",
						}}
					>
						GALAXY GENESIS
					</span>
					<SheetClose asChild>
						<Button
							variant="ghost"
							size="icon-xs"
							className="shrink-0 border-0 bg-transparent hover:bg-transparent"
							style={{ color: "var(--panel-label)" }}
						>
							<CloseIcon width={14} height={14} />
						</Button>
					</SheetClose>
				</div>

				{/* Content */}
				<div
					className="flex-1 overflow-y-auto flex flex-col gap-8"
					style={{ padding: "28px 12px" }}
				>
					{/* System count */}
					<Field>
						<FieldLabel
							htmlFor="system-count"
							className="text-[0.6rem] tracking-[0.18em] uppercase font-mono"
							style={{ color: "var(--panel-label)" }}
						>
							System Count
						</FieldLabel>
						<Input
							id="system-count"
							type="number"
							min={100}
							max={1000000}
							step={100}
							value={numSystems}
							onChange={(e) => {
								const v = parseInt(e.target.value, 10)
								if (!isNaN(v) && v > 0) onNumSystemsChange(v)
							}}
							disabled={isGenerating}
							className="font-mono text-[0.82rem] h-10"
							style={{
								background: "rgba(255,255,255,0.04)",
								borderColor: "var(--panel-border)",
								color: "var(--panel-text)",
								paddingLeft: 12,
								paddingRight: 12,
							}}
						/>
					</Field>

					{/* Galaxy code */}
					<Field>
						<div className="flex items-center gap-2">
							<FieldLabel
								htmlFor="galaxy-code"
								className="text-[0.6rem] tracking-[0.18em] uppercase font-mono flex-1"
								style={{ color: "var(--panel-label)" }}
							>
								Galaxy Code
							</FieldLabel>
							<Button
								type="button"
								variant="outline"
								size="icon-xs"
								onClick={() => onSeedChange(randomSeed())}
								disabled={isGenerating}
								className="shrink-0 border transition-colors hover:bg-transparent"
								style={{
									borderColor: "rgba(255,255,255,0.15)",
									color: "rgba(255,255,255,0.6)",
									background: "transparent",
								}}
							>
								<DiceMultipleIcon width={14} height={14} />
							</Button>
							<Button
								type="button"
								variant="outline"
								size="icon-xs"
								onClick={() => {
									navigator.clipboard.writeText(galaxyCode)
									setCopied(true)
									setTimeout(() => setCopied(false), 1500)
								}}
								className="shrink-0 border transition-colors hover:bg-transparent"
								style={{
									borderColor: "rgba(255,255,255,0.15)",
									color: "rgba(255,255,255,0.6)",
									background: "transparent",
								}}
							>
								{copied ? (
									<CheckIcon width={14} height={14} />
								) : (
									<ContentCopyIcon width={14} height={14} />
								)}
							</Button>
						</div>
						<Input
							id="galaxy-code"
							value={galaxyCode}
							onChange={(e) => onGalaxyCodeChange(e.target.value)}
							disabled={isGenerating}
							className="font-mono text-[0.82rem] tracking-wide h-10"
							style={{
								background: "rgba(255,255,255,0.04)",
								borderColor: "var(--panel-border)",
								color: "var(--panel-text)",
								paddingLeft: 12,
								paddingRight: 12,
							}}
						/>
					</Field>

					{/* Generate button */}
					<Button
						onClick={onGenerate}
						disabled={isGenerating}
						className="w-full font-mono text-[0.7rem] tracking-[0.2em] uppercase flex items-center justify-center gap-2 h-11"
						style={{
							background: isGenerating
								? "rgba(0,212,255,0.08)"
								: "rgba(0,212,255,0.12)",
							border: `1px solid ${isGenerating ? "rgba(0,212,255,0.2)" : "rgba(0,212,255,0.35)"}`,
							color: isGenerating
								? "rgba(255,255,255,0.4)"
								: "var(--panel-accent)",
						}}
					>
						{isGenerating ? (
							<>
								<SyncIcon width={12} height={12} />
								Generating...
							</>
						) : (
							<>
								<PlayIcon width={12} height={12} />
								Generate
							</>
						)}
					</Button>

					{/* Progress */}
					<div className="space-y-2.5">
						<div className="flex justify-between">
							<span
								className="font-mono text-[0.68rem] tracking-[0.12em] uppercase"
								style={{ color: "var(--panel-label)" }}
							>
								{isGenerating ? generationLabel : "Ready"}
							</span>
							<span
								className="font-mono text-[0.68rem]"
								style={{ color: "var(--panel-label)" }}
							>
								{isGenerating ? `${Math.round(generationProgress)}%` : ""}
							</span>
						</div>
						<Progress
							value={generationProgress}
							className="h-[5px] rounded-sm"
							style={{
								background: "rgba(255,255,255,0.06)",
								color: "var(--panel-accent)",
							}}
						/>
					</div>
				</div>
			</SheetContent>
		</Sheet>
	)
}
