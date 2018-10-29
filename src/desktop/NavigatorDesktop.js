import React from 'react'
import { View, StyleSheet } from 'react-native'
import ScreenWrapperDesktop from './ScreenWrapperDesktop'
import NavigatorBase from '../NavigatorBase'
import TransitionDesktopDefault from './TransitionDesktopDefault'

export default class NavigatorWide extends NavigatorBase {

	static defaultProps = {
		transition: TransitionDesktopDefault
	}

	render(){
		let { router, DrawerComponent } = this.props;

		return (
			<View style={ styles.container }>
				<View style={ styles.drawer }>
					<DrawerComponent router={ router } />
				</View>
				<View style={ styles.stack } onLayout={ e => this.updateLayout(e) }>
					{ this.renderScreens( router ) }
				</View>
				<View style={ styles.modal }>
				</View>
			</View>
		)
	}

	renderScreens( router ){
		// console.log( router.stack )
		// console.log( this.state.indexes )
		let { layout, indexes } = this.state

		// Wait for the layout to be drawn
		if( !layout ) return;

		return router.stack.map( ({Screen, location, key}) => (
			<ScreenWrapperDesktop screen={ Screen }
				location={ location }
				router={ router }
				indexes={ indexes[key] }
				layout={ layout }
				transition={ this.props.transition }
				key={ key }>
				<Screen router={ router }
					location={ location }
					indexes={ indexes[key] }
					layout={ layout } />
			</ScreenWrapperDesktop>
		))
	}
}

let styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'row'
	},
	drawer: {},
	stack: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'stretch'
	},
	modal: {}
})
