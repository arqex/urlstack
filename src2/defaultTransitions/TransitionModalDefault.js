import {Easing} from 'react-native'

export default {
	stack: function( indexes, layout ){
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
	},
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