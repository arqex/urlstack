import React from 'react'
import { StyleSheet, Animated } from 'react-native'
import ScreenWrapper from '../ScreenWrapper'

export default class TabScreenWrapper extends ScreenWrapper {
	render() {
		let {width, height} = this.props.layout;
		let containerClass = [
			styles.container,
			this.animatedStyles,
			{ width, height }
		]

		return (
			<Animated.View style={containerClass}>
				{this.props.children}
			</Animated.View>
		)
	}
}

let styles = StyleSheet.create({
	container: {
		backgroundColor: '#eee',
		overflow: 'hidden',
		position: 'absolute',
		width: '100%', height: '100%',
		top: 0, left: 0,
		zIndex: 10
	}
})
