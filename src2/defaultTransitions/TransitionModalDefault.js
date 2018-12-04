import {Easing} from 'react-native'

let stackAndDock = function( indexes, layout ){
	return {
		styles: {
			translateY: {
				inputRange: [ 0, 1 ],
				outputRange: [ -100, 0 ]
			},
			opacity: {
				inputRange: [ 0, 1 ],
				outputRange: [ 0, 1 ]
			}
		},
		easing: Easing.linear,
		duration: 300
	}
}

export default {
	stack: stackAndDock,
	dock: stackAndDock,
	modal: function( indexes, layout ) {
		return {
			styles: {
				translateY: {
					inputRange: [ 0, 1 ],
					outputRange: [ '100%', '0%' ]
				}
			},
			easing: Easing.linear,
			duration: 300
		}
	}
}