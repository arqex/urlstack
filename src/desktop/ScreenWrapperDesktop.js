import React from 'react'
import { StyleSheet, Animated } from 'react-native'
import ScreenWrapper from '../ScreenWrapper'

export default class ScreenWrapperWide extends ScreenWrapper {
	render(){
		let containerClasses = [
			styles.container,
			this.animatedStyles
		]

		let screenClasses = [
			styles.screen
		]

		return (
			<Animated.View style={ containerClasses }>
				<Animated.View style={ screenClasses }>
					{ this.props.children }
				</Animated.View>
			</Animated.View>
		)
	}
}

let styles = StyleSheet.create({
	container: {
		backgroundColor: '#eee',
		overflow: 'hidden',
		position: 'absolute',
		top: 0, height: '100%'
	},
	screen: {
		width: '100%',
		maxWidth: 800,
		marginLeft: 'auto',
		marginRight: 'auto'
	},
})
