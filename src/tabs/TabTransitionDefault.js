import { Easing } from 'react-native'

export default function TabTransitionDefault(indexes, layout) {
	return {
		styles: {
			left: {
				inputRange: [-2, -1, 0, 1],
				outputRange: [layout.width, layout.width, 0, 0]
			},
			opacity: {
				inputRange: [-2, -1, 0, .8, 1],
				outputRange: [0, 1, 1, 0, 0]
			},
		},
		easing: Easing.linear,
		duration: 300
	}
}