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
		
		return router.stack.map( ({Screen, location, key}, i) => (
			<ScreenWrapperNarrow Screen={ Screen }
				location={ location }
				router={ router }
				indexes={ indexes[key] }
				layout={ layout }
				key={ key }>
				<Screen router={ router }
					location={ location }
					indexes={ indexes[key] }
					layout={ layout }
					drawer={ this.getDrawer() } />
			</ScreenWrapperNarrow>
		))
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
