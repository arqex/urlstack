import React from 'react'
import { StyleSheet, Animated } from 'react-native'
import ScreenWrapper from './ScreenWrapper'
import TransitionNarrowDefault from './TransitionMobileDefault'

export default class ScreenWrapperNarrow extends ScreenWrapper {
	static defaultProps = {
		transition: TransitionNarrowDefault
	}

	render(){
		let containerClass = [
			styles.container,
			this.animatedStyles
		]

		return (
			<Animated.View style={ containerClass }>
				{ this.props.children }
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
		zIndex:10
	}
})
