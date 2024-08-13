import type { RouterOnChangeArgs } from 'preact-router'
import { Router } from 'preact-router'
import '../styles/global.css'
import '../styles/nodes.css'
import { Analytics } from './Analytics.js'
import { cleanUrl } from './Utils.js'
import { Header } from './components/index.js'
import { Generator, Home } from './pages/index.js'

export function App() {
	const changeRoute = (e: RouterOnChangeArgs) => {
		window.dispatchEvent(new CustomEvent('replacestate'))
		// Needs a timeout to ensure the title is set correctly
		setTimeout(() => Analytics.pageview(cleanUrl(e.url)))
	}

	return <>
		<Header />
		<Router onChange={changeRoute}>
			<Home path="/" />
			<Generator default />
		</Router>
	</>
}
