import React from 'react'
import { View, StyleSheet, Animated, Easing } from 'react-native'
import TabScreenWrapper from './TabScreenWrapper'
import TabTransitionDefault from './TabTransitionDefault'
import EmptyTab from './EmptyTab'
import NavigatorBase from '../NavigatorBase'


export default class TabNavigator extends NavigatorBase {

	static defaultProps = {
		transition: TabTransitionDefault
	}

	render() {
		let {Screen, router, location, indexes, layout, drawer} = this.props
		
		return (
			<Screen content={ this.renderScreens( router, drawer, indexes ) }
				router={router}
				location={location}
				indexes={indexes}
				layout={layout}
				drawer={drawer}
				router={router} />
		)
	}

	renderScreens( router, drawer ){
		let {layout, indexes} = this.state
		let tabs

		if (layout) {
			tabs = this.props.tabs.stack.map(({ Screen, key, location }, i) => {
				let Content = location ? Screen : EmptyTab;
				return (
					<TabScreenWrapper Screen={Screen}
						location={location}
						router={router}
						indexes={indexes[key]}
						layout={layout}
						transition={this.props.transition}
						key={key}>
						<Content location={location}
							router={router}
							layout={layout}
							drawer={drawer}
							indexes={indexes[key]} />
					</TabScreenWrapper>
				)
			})
		}

		return (
			<View style={ styles.container } onLayout={ e => this.updateLayout(e) } ref="view">
				{ tabs }
			</View>
		)
	}

	getStackAndIndex( props ){
		let { stack, index } = props.tabs;
		return { stack, index: index }
	}
} 

let styles = StyleSheet.create({
	container: {
		height: '100%'
	}
})