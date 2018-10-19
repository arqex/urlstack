import React from 'react'
import { View, StyleSheet } from 'react-native'
import ScreenWrapperWide from './ScreenWrapperWide'

export default class NavigatorWide extends Component {
	render(){
		let { router, DrawerComponent } = this.props;

		return (
			<View style={ styles.container }>
				<View style={ styles.drawer }>
					<DrawerComponent router={ router } />
				</View>
				<View style={ styles.stack }>
					{ this.renderScreens( router.stack, router.currentIndex ) }
				</View>
				<View style={ styles.modal }>
				</View>
			</View>
		)
	}

	renderScreens( stack, currentIndex ){
		return stack.map( ({screen, location, key}) => (
			<ScreenWrapperWide screen={ screen } location={ location } router={ this.props.router } key={ key }>
				<screen router={ router } location={ location } />
			</ScreenWrapperWide>
		))
	}
}

let styles = StyleSheet.create({
	container: {},
	drawer: {},
	stack: {},
	modal: {}
})