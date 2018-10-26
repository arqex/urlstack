import React from 'react'
import { View, StyleSheet, Animated, Easing } from 'react-native'
import ScreenWrapperNarrow from './ScreenWrapperMobile'
import SideMenu from 'react-native-side-menu'
import NavigatorBase from './NavigatorBase'
import TransitionMobileDefault from './TransitionMobileDefault'

export default class NavigatorNarrow extends NavigatorBase {

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

		let screens = []
		let inTab = false;
		
		router.stack.forEach( (item, i) => {
			let {Screen, key} = item

			if( inTab ){
				inTab = false;
				return screens.push( this.renderTabs( inTab, item, layout, indexes[inTab.key], router ) );
			}

			let options = Screen.urlstackOptions || {}
			if( options.tabs ){
				// We'll render the screen in the next iteration
				inTab = item
				return;
			}

			screens.push( this.renderScreen( item, layout, indexes[key] ), router )
		})

		if( inTab ){
			screens.push( inTab, false, layout, indexes )
		}

		return screens;
	}

	renderScreen( {Screen, location, key}, layout, indexes, router ){
		return (
			<ScreenWrapperNarrow Screen={ Screen }
				location={ location }
				router={ router }
				indexes={ indexes[key] }
				layout={ layout }
				transition={ this.props.transition }
				key={ key }>
				<Screen router={ router }
					location={ location }
					indexes={ indexes[key] }
					layout={ layout }
					drawer={ this.getDrawer() } />
			</ScreenWrapperNarrow>
		)
	}

	renderTabs( parent, child, layout, indexes, router ){
		return (
			<ScreenWrapperNarrow Screen={ parent.Screen }
				location={ parent.location }
				router={ router }
				indexes={ indexes[parent.key] }
				layout={ layout }
				key={ parent.key }>
				<TabDirector parent={ parent }
					child={ child }
					layout={ layout }
					indexes={ indexes }
					router={ router } />
			</ScreenWrapperNarrow>
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
