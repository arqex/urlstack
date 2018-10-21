import React, {Component} from 'react'
import { View, StyleSheet } from 'react-native'
import ScreenWrapperNarrow from './ScreenWrapperNarrow'
import SideMenu from 'react-native-side-menu'

export default class NavigatorNarrow extends Component {
	render(){
		let { router, DrawerComponent } = this.props;

		let content = (
			<View style={ styles.container }>
				<View style={ styles.stack }>
					{ this.renderScreenWrapper( router ) }
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

	renderScreenWrapper( router ){
		let { stack, currentIndex } = router;
		let { Screen, location } = stack[ currentIndex ];

		return (
			<ScreenWrapperNarrow Screen={ Screen }
				location={ location }
				router={ router }
				drawer={ this.getDrawer() }>
				{ this.renderScreens( router ) }
			</ScreenWrapperNarrow>
		)
	}

	renderScreens( router ){
		return router.stack.map( ({Screen, location, key}, i) => (
			<Screen key={ key }
				router={ router }
				location={ location }
				isActive={ router.currentIndex === i }
				drawer={ this.getDrawer() }
				key={ key } />
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
		backgroundColor: '#fff'
	},
	drawer: {},
	stack: {},
	modal: {}
})

const emptyDrawer = {
	open: () => { },
	close: () => { },
	toggle: () => { },
}
