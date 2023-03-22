import { For, Index, JSX, Show } from "solid-js";

import {
	gridUnitSize,
	SegmentClipPath,
	CellSelectionIndicator,
} from "./segment";
import { ChitComponent } from "../chit";
import {
	Command,
	isProgram,
	isProgramInstance,
	Program,
	ProgramComponent,
} from "../program";
import { getChitConfig, getProgramConfig, getTexture } from "game/game";
import { Targets } from "./targets";
import { useDataBattle } from "../store";
import { UploadZone } from "../level";

interface GridProps extends JSX.HTMLAttributes<HTMLDivElement> {}
export const Grid = (gridProps: GridProps) => {
	// const [p, gridProps] = splitProps(props, []);
	const [dataBattle] = useDataBattle();

	const selectedChitPosition = () => {
		const selectedChit = dataBattle.selection?.chit;
		if (!selectedChit) return null;
		return isProgram(selectedChit)
			? isProgramInstance(selectedChit)
				? selectedChit.slug[0]
				: null
			: selectedChit.pos;
	};

	const programSelection = (): null | {
		program: Program;
		command: Command | null;
	} => {
		if (
			!dataBattle.selection ||
			!isProgramInstance(dataBattle.selection.chit) ||
			dataBattle.selection.chit.slug.length === 0 // for when program deletes itself
		)
			return null;
		return {
			program: dataBattle.selection.chit,
			command: dataBattle.selection.command,
		};
	};

	return (
		<div {...gridProps}>
			<svg
				width={dataBattle.width * gridUnitSize}
				height={dataBattle.height * gridUnitSize}
			>
				<Index each={dataBattle.solid}>
					{(isSolid, sectorIndex) => (
						<Show when={isSolid()} keyed>
							<image
								x={
									(sectorIndex % dataBattle.width) *
									gridUnitSize
								}
								y={
									Math.floor(sectorIndex / dataBattle.width) *
									gridUnitSize
								}
								href={getTexture(dataBattle.style[sectorIndex])}
							/>
						</Show>
					)}
				</Index>

				<For each={dataBattle.chits}>
					{(chit) => <ChitComponent chit={chit} />}
				</For>

				<SegmentClipPath />

				<For each={dataBattle.programs}>
					{(program) => <ProgramComponent program={program} />}
				</For>

				<For each={dataBattle.uploadZones}>
					{(uploadZone) => <UploadZoneComponent {...uploadZone} />}
				</For>

				<Show when={selectedChitPosition()} keyed>
					{(position) => (
						<CellSelectionIndicator
							column={position.column}
							row={position.row}
						/>
					)}
				</Show>

				<Show when={programSelection()} keyed>
					{Targets}
				</Show>
			</svg>
		</div>
	);
};

const UploadZoneComponent = (p: UploadZone) => {
	const program = () =>
		p.programId
			? { team: p.team, slug: [p.pos], ...getProgramConfig(p.programId)! }
			: null;

	return (
		<g>
			<ChitComponent
				chit={{
					pos: p.pos,
					...getChitConfig("nightfall:upload_zone")!,
				}}
			/>
			<Show when={program()} keyed>
				{(program) => (
					<g opacity={0.65}>
						<ProgramComponent program={program} />;
					</g>
				)}
			</Show>
		</g>
	);
};
