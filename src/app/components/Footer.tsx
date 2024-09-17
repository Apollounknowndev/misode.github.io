import { useLocale } from '../contexts/index.js'
import { Octicon } from './index.js'

interface Props {
	donate?: boolean,
}
export function Footer({ donate }: Props) {
	const { locale } = useLocale()

	return <footer>
		<p>
			<span>{locale('developed_by')} <a href="https://github.com/misode" target="_blank" rel="noreferrer">Misode</a></span>
			<span>{', modified by'} <a href="https://github.com/apollounknowndev" target="_blank" rel="noreferrer">Apollo</a></span>
		</p>
		{donate !== false && <p class="donate">
			{Octicon.heart}
			<a href="https://ko-fi.com/misode" target="_blank" rel="noreferrer">{'Donate to Misode'}</a>
		</p>}
		<p>
			{Octicon.mark_github}
			<span>{locale('source_code_on')} <a href="https://github.com/apollounknowndev/misode.github.io/tree/lithostitched" target="_blank" rel="noreferrer">{locale('github')}</a></span>
		</p>
	</footer>
}
