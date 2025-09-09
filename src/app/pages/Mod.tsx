import { Footer, GeneratorList } from '../components/index.js'
import { useLocale, useTitle } from '../contexts/index.js'

interface Props {
	path: string
}
export function Mod(props: Props) {
	let mod: string = props.path.substring(1)

	const { locale } = useLocale()
	useTitle(locale('title.' + mod))

	return <main>
		<div class="legacy-container">
			<GeneratorList predicate={gen => gen.tags?.includes(mod)} />
		</div>
		<Footer donate={false} />
	</main>
}
