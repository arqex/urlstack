import React from 'react'
import { View, StyleSheet, Animated, Easing } from 'react-native'
import ScreenWrapperNarrow from './ScreenWrapperMobile'
import SideMenu from 'react-native-side-menu'
import NavigatorBase from '../NavigatorBase'
import TransitionMobileDefault from './TransitionMobileDefault'
import TabNavigator from '../tabs/TabNavigator'

export default class NavigatorMobile extends NavigatorBase {

	static defaultProps = {
		transition: TransitionMobileDefault
	}

	render(){
		let { router, DrawerComponent } = this.props;

		let content = (
			<View style={ styles.container }>
				<View style={styles.stack} onLayout={ e => this.updateLayout(e) }>
					{ this.renderScreens(router) }
				</View>
				<View style={ styles.modal }>
				</View>
			</View>
		)

		if( DrawerComponent ){
			return (
				<SideMenu ref="drawer" menu={ <DrawerComponent router={ router } /> }>
					{ content }
				</SideMenu>
			)
		}

		return content;
	}

	renderScreens( router ){
		let { layout, indexes } = this.state
		
		// Wait for the layout to be drawn
		if( !layout ) return;
		
		return router.stack.map( (item, i) => {
			let {key} = item
			return this.renderScreenAndWrapper( item, layout, indexes[key], router )
		})
	}

	renderScreenAndWrapper( item, layout, indexes, router ){
		let { Screen, location, key } = item
		return (
			<ScreenWrapperNarrow Screen={ Screen }
				location={ location }
				router={ router }
				indexes={ indexes }
				layout={ layout }
				transition={ this.props.transition }
				key={ key }>
					{ this.renderScreen( item, layout, indexes, router ) }
			</ScreenWrapperNarrow>
		)
	}

	renderScreen( item, layout, indexes, router ){
		let drawer = this.getDrawer();

		let { Screen, location, tabs } = item

		if( item.isTabs ){
			return (
				<TabNavigator Screen={ Screen }
					router={ router }
					location={ location }
					tabs={ tabs }
					indexes={ indexes }
					layout={ layout }
					drawer={ drawer }
					router={ router } />
			)
		}

		return (
			<Screen router={router}
				location={location}
				indexes={indexes}
				layout={layout}
				drawer={ drawer } />
		)
	}

	getDrawer(){
		if( this.drawer ){
			return this.drawer;
		}

		let {drawer} = this.refs;
		if( drawer ){
			this.drawer = {
				open: () => drawer.openMenu( true ),
				close: () => drawer.openMenu( false ),
				toggle: () => drawer.openMenu( !drawer.isOpen )
			}

			return this.drawer;
		}
		return emptyDrawer;
	}
}

let styles = StyleSheet.create({
	container: {
		backgroundColor: '#fff',
		flex: 1
	},
	drawer: {},
	stack: {
		height: '100%', width: '100%'
	},
	modal: {}
})

const emptyDrawer = {
	open: () => { },
	close: () => { },
	toggle: () => { },
}
