import React, {Component} from 'react'
import { StyleSheet, Animated, View } from 'react-native'

export default class DrawerWrapper extends Component {
	constructor(props){
		super(props)
	}

	render(){
		let { Drawer, router, collapsible } = this.props
		let containerStyles = [
			styles.container,
			collapsible && styles.collapsibleDrawer
		]
		let drawerStyles = [
			styles.drawer
		]		
		let overlayStyles = [
			styles.overlay,
			collapsible && styles.collapsibleOverlay
		]

		return (
			<View styles={ containerStyles }>
				<View styles={ drawerStyles }>
					<Drawer router={ router } />
				</View>
				<View style={ overlayStyles }></View>
			</View>
		)
	}
}

let styles = StyleSheet.create({
	container: {
		backgroundColor: '#eee',
		zIndex: 10
	},
	collapsibleDrawer: {
		display: 'none',
		position: 'absolute',
	},
	drawer: {

	},
	overlay: {
		backgroundColor: 'red'
	},
	collapsibleOverlay: {
		display: 'none'
	}
})