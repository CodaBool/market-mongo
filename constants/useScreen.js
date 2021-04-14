import React, { useState, useEffect } from 'react';

export default function useScreen() {
	const [screenType, setScreenType] = useState(getScreenType());

	const resizeEvent = () => {
		setScreenType(getScreenType())
	}

	useEffect(() => {
		window.addEventListener('resize', resizeEvent);
		return () => {
			window.removeEventListener('resize', resizeEvent);
		};
	}, [])

	return screenType;
}

const getScreenType = () => {
	let screenType = null;

	if (typeof window !== 'undefined') {
		if (window.matchMedia('(max-width: 575px)').matches) {
			screenType = 'xsmall';
		} else if (window.matchMedia('(max-width: 768px)').matches) {
			screenType = 'small';
		} else if (window.matchMedia('(max-width: 991px)').matches) {
			screenType = 'medium';
		} else if (window.matchMedia('(max-width: 1199px)').matches) {
			screenType = 'large';
		} else {
			screenType = 'xlarge';
		}
	}

	return screenType;
}