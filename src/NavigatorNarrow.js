import React from 'react'
import { View, StyleSheet } from 'react-native'
import ScreenWrapperNarrow from './ScreenWrapperNarrow'
import SideMenu from 'react-native-side-menu'

export default class NavigatorNarrow extends Component {
	render(){
		let { router, DrawerComponent } = this.props;

		return (
			<View style={ styles.container }>
				<SideMenu menu={ <View key="menu" /> }>
					<DrawerComponent router={ router } />
				</SideMenu>

				<View style={ styles.stack }>
					{ this.renderScreenWrapper( router ) }
					{ this.renderScreens( router.stack, router.currentIndex ) }
				</View>
				<View style={ styles.modal }>
				</View>
			</View>
		)
	}

	renderScreenWrapper( router ){
		let { stack, currentIndex } = router;
		let { screen, location } = stack[ currentIndex ];

		return (
			<ScreenWrapperNarrow screen={ screen } location={ location } router={ router }>
				{ this.renderScreens( stack, currentIndex ) }
			</ScreenWrapperNarrow>
		)
	}

	renderScreens( stack, currentIndex ){
		return stack.map( ({screen, location, key}, i) => (
			<screen key={ key }
				router={ router }
				location={ location }
				isActive={ currentIndex === i }
				key={ key } />
		))
	}
}

let styles = StyleSheet.create({
	container: {},
	drawer: {},
	stack: {},
	modal: {}
})