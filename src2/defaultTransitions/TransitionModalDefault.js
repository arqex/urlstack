import {Easing} from 'react-native'

export default function TransitionModalDefault( indexes, layout ){
	return {
		screenStyles: {
			translateY: {
				inputRange: [ 0, 1 ],
				outputRange: [ -100, 0 ]
			},
			opacity: {
				inputRange: [ 0, 1 ],
				outputRange: [ 0, 1 ]
			}
		},
		modalStyles: {
			translateY: {
				inputRange: [ 0, 1 ],
				outputRange: [ '100%', '0%' ]
			}
		},
		easing: Easing.linear,
		duration: 300
	}
}