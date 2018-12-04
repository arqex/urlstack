import {Easing} from 'react-native'

export default function TransitionMobileDefault( indexes, layout ){
	return {
		styles: {
			left: {
				inputRange: [ -2, -1, 0, 1 ],
				outputRange: [ layout.width, layout.width, 0, 0 ]
			},
			opacity: {
				inputRange: [ -2, -1, 0, .8, 1 ],
				outputRange: [ 0, 1, 1, 0, 0]
			},
			scale: {
				inputRange: [ -1, 0, 1, 2 ],
				outputRange: [ 1, 1, .5, .5]
			},
		},
		easing: Easing.linear,
		duration: 300,
		collapsibleDrawer: true
	}
}