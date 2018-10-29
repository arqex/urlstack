import {Easing} from 'react-native'

export default function TransitionNarrowDefault( indexes, layout ){
	let leftColumn = indexes.screen ? 400 : 0;

	return {
		styles: {
			width: {
				inputRange: [ -2, -1, 0, 1, 2, 3 ],
				outputRange: [ 0, 0, layout.width - leftColumn, 400, 0, 0]
			},
			
			left: {
				inputRange: [ -2, -1, 0, 1, 2 ],
				outputRange: [ layout.width, layout.width, leftColumn, 0, 0]
			},
	
			opacity: {
				inputRange: [ -2, -.5, 0, 1, 1.5, 2 ],
				outputRange: [ 0, 0, 1, 1, 0, 0]
			},
		},
		easing: Easing.linear,
		duration: 300
	}
}