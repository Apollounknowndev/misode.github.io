import { Card, Footer, GeneratorCard, ToolCard, ToolGroup } from '../components/index.js'
import { useLocale, useTitle } from '../contexts/index.js'
import { useAsync } from '../hooks/useAsync.js'
import { useMediaQuery } from '../hooks/useMediaQuery.js'
import { fetchModVersions } from '../services/DataFetcher.js'

interface Props {
	path?: string,
}
export function Home({}: Props) {
	const { locale } = useLocale()
	useTitle(locale('title.home'))

	const smallScreen = useMediaQuery('(max-width: 580px)')

	return <main>
		<div class="legacy-container">
			<div class="card-group">
				{smallScreen ? /* mobile */ <>
					<AvailableGenerators />
					<WhatsNew />
					<Versions />
					<Tools />
				</> : /* desktop */ <>
					<div class="card-column">
						<AvailableGenerators />
						<Versions />
					</div>
					{!smallScreen && <div class="card-column">
						<WhatsNew />
						<Tools />
					</div>}
				</>}
			</div>
			<Footer />
		</div>
	</main>
}

function AvailableGenerators() {
	const { locale } = useLocale()
	return <ToolGroup title={locale('generators.all')} link="/generators/">
		<GeneratorCard minimal id="lithostitched/worldgen_modifier" />
		<GeneratorCard minimal id="worldgen/configured_feature" />
		<GeneratorCard minimal id="worldgen/placed_feature" />
		<GeneratorCard minimal id="worldgen/structure" />
		<GeneratorCard minimal id="worldgen/template_pool" />
		<GeneratorCard minimal id="worldgen/processor_list" />
		<GeneratorCard minimal id="worldgen/density_function" />
	</ToolGroup>
}

function Tools() {
	return <ToolGroup title='Links'>
		<ToolCard title="Wiki"
			link="https://github.com/Apollounknowndev/lithostitched/wiki"
			desc="Learn about Lithostitched's features" />
		<ToolCard title="Modrinth Page" icon="modrinth"
			link="https://modrinth.com/mod/lithostitched"
			desc="Download Lithostitched" />
		<ToolCard title="Original Site" icon="home"
			link="https://misode.github.io/"
			desc="Non-Lithostitched generators" />
	</ToolGroup>
}

function Versions() {
	const { locale } = useLocale()

	const { value: versions } = useAsync(fetchModVersions, [])

	return <ToolGroup title={'Lithostitched versions'} link="https://modrinth.com/mod/lithostitched/versions" titleIcon="arrow_right">
		{(versions?.[0]) && <>
			<ToolCard title={versions[0].version_number} link={`https://modrinth.com/mod/lithostitched/version/${versions[0].version_number}`} desc={locale('versions.latest_release')} />
		</>}
	</ToolGroup>
}

function WhatsNew() {
	const { locale } = useLocale()

	return <ToolGroup title={locale('whats_new')} link="" titleIcon="megaphone">
		<Card>🚧 Still under construction! 🚧</Card>
	</ToolGroup>
}
