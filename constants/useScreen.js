import { useState, useEffect } from 'react'

export default function useScreen() {
	const [screenType, setScreenType] = useState('medium')

	useEffect(() => {
		setScreenType(getSize())
		window.addEventListener('resize', () => setScreenType(getSize()))
		return () => {
			window.removeEventListener('resize', () => setScreenType(getSize()))
		}
	}, [])

	return screenType || 'medium'
}

function getSize() {
	if (typeof window === 'undefined') return null
	if (window.matchMedia('(max-width: 575px)').matches) {
		return 'xsmall'
	} else if (window.matchMedia('(max-width: 768px)').matches) {
		return 'small'
	} else if (window.matchMedia('(max-width: 991px)').matches) {
		return 'medium'
	} else if (window.matchMedia('(max-width: 1199px)').matches) {
		return 'large'
	} else {
		return 'xlarge'
	}
}