import { ToolCard, ToolGroup } from '../components/index.js'
import { useLocale, useTitle } from '../contexts/index.js'

interface Props {
	path?: string,
}
export function Home({}: Props) {
	const { locale } = useLocale()
	useTitle(locale('title.home'))

	return <main>
		<div class="legacy-container">
		<ToolGroup title={locale('generator.available') }>

			<ToolCard title={locale('generator.lithostitched.worldgen_modifier')} link="/lithostitched/worldgen-modifier/" titleIcon="arrow_right" />
			<ToolCard title={locale('generator.lithostitched.structure')} link="/lithostitched/structure/" titleIcon="arrow_right" />
			<ToolCard title={locale('generator.biolith.biome_placement')} link="/biolith/biome-placement/" titleIcon="arrow_right" />
			<ToolCard title={locale('generator.expedition.planet_type')} link="/expedition/planet-type/" titleIcon="arrow_right" />
			
		</ToolGroup>
		</div>
	</main>
}
