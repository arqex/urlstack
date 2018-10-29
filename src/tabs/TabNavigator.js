import React from 'react'
import { View, StyleSheet, Animated, Easing } from 'react-native'
import TabTransitionDefault from './TabTransitionDefault'
import NavigatorBase from '../NavigatorBase'


export default class TabNavigator extends NavigatorBase {

	static defaultProps = {
		transition: TabTransitionDefault
	}

	render() {
		let {Screen, router, location, indexes, layout, drawer} = this.props
		
		return (
			<Screen content={ this.renderScreens( router, layout, drawer, indexes ) }
				router={router}
				location={location}
				indexes={indexes}
				layout={layout}
				drawer={drawer}
				router={router} />
		)
	}

	renderScreens( router, layout, drawer, indexes ){
		let tabs = this.props.tabs.stack.map( ({Screen, key, location},i) => {
			<Screen key={ key }
				location={ location }
				router={ router }
				layout={ layout }
				drawer={ drawer }
				indexes={ indexes[key] } />
		})

		return (
			<View>{ tabs }</View>
		)
	}

	getStackAndIndex( props ){
		let {stack, currentIndex } = props.tabs;
		return { stack, index: currentIndex }
	}
} 