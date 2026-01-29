import { useMemo } from 'preact/hooks'
import { Footer, GeneratorCard, ToolCard, ToolGroup } from '../components/index.js'
import { useLocale, useTitle } from '../contexts/index.js'
import { useAsync } from '../hooks/useAsync.js'
import { useMediaQuery } from '../hooks/useMediaQuery.js'
import { fetchModVersions } from '../services/DataFetcher.js'
import { Store } from '../Store.js'


const MIN_FAVORITES = 2
const MAX_FAVORITES = 5

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
					<PopularGenerators />
					<FavoriteGenerators />
					<Versions />
					<Tools />
				</> : /* desktop */ <>
					<div class="card-column">
						<PopularGenerators />
						<Versions />
					</div>
					{!smallScreen && <div class="card-column">
						<FavoriteGenerators />
						<Tools />
					</div>}
				</>}
			</div>
			<Footer />
		</div>
	</main>
}

function PopularGenerators() {
	const { locale } = useLocale()
	return <ToolGroup title={locale('generators.all')} link="/generators/">
		<ToolCard title={locale('title.lithostitched')} link="/lithostitched/" titleIcon="arrow_right" />
		<ToolCard title={locale('title.datapatched')} link="/datapatched/" titleIcon="arrow_right" />
		<ToolCard title={locale('title.wikiful')} link="/wikiful/" titleIcon="arrow_right" />
		<ToolCard title={locale('title.abridged')} link="/abridged/" titleIcon="arrow_right" />
		<ToolCard title={locale('title.trimmable_tools')} link="/trimmable_tools/" titleIcon="arrow_right" />
		<ToolCard title={locale('generator.pack_mcmeta')} link="/pack-mcmeta/"/>
	</ToolGroup>
}

function FavoriteGenerators() {
	const { locale } = useLocale()

	const favorites = useMemo(() => {
		const history: string[] = []
		for (const id of Store.getGeneratorHistory().reverse()) {
			if (!history.includes(id)) {
				history.push(id)
			}
		}
		return history.slice(0, MAX_FAVORITES)
	}, [])

	if (favorites.length < MIN_FAVORITES) return <></>

	return <ToolGroup title={locale('generators.recent')}>
		{favorites.map(f => <GeneratorCard minimal id={f} />)}
	</ToolGroup>
}

function Tools() {
	return <ToolGroup title='Links'>
		<ToolCard title="Lithostitched Wiki"
			link="https://github.com/Apollounknowndev/lithostitched/wiki"
			desc="Learn about Lithostitched's features" />
		<ToolCard title="Wikiful Wiki"
			link="https://github.com/Apollounknowndev/wikiful/wiki"
			desc="Learn about Wikiful's features" />
		<ToolCard title="Apollo's Modrinth" icon="modrinth"
			link="https://modrinth.com/user/Apollo"
			desc="Download Apollo's library mods" />
		<ToolCard title="Original Site" icon="home"
			link="https://misode.github.io/"
			desc="Non-modded generators" />
	</ToolGroup>
}

function Versions() {
	const { value: lithostitchedVersions } = useAsync(() => fetchModVersions('lithostitched'), [])
	const { value: datapatchedVersions } = useAsync(() => fetchModVersions('datapatched'), [])
	const { value: wikifulVersions } = useAsync(() => fetchModVersions('wikiful'), [])

	return <ToolGroup title={'Mod versions'}>
		{(lithostitchedVersions?.[0]) && <>
			<ToolCard title={lithostitchedVersions[0].version_number.split("-")[0]} link={`https://modrinth.com/mod/lithostitched/version/${lithostitchedVersions[0].version_number}`} desc={"Latest Lithostitched"} />
		</>}
		{(datapatchedVersions?.[0]) && <>
			<ToolCard title={datapatchedVersions[0].version_number.split("-")[0]} link={`https://modrinth.com/mod/datapatched/version/${datapatchedVersions[0].version_number}`} desc={"Latest Datapatched"} />
		</>}
		{(wikifulVersions?.[0]) && <>
			<ToolCard title={wikifulVersions[0].version_number.split("-")[0]} link={`https://modrinth.com/mod/wikiful/version/${wikifulVersions[0].version_number}`} desc={"Latest Wikiful"} />
		</>}
	</ToolGroup>
}
