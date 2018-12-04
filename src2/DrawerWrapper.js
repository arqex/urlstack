import React, {Component} from 'react'
import { StyleSheet, Animated, View } from 'react-native'
import animatedStyles from './utils/animatedStyles'
import Interactable from 'react-interactable'

export default class DrawerWrapper extends Component {
	constructor(props){
		super(props)
	}

	render(){
		let { Drawer, router, collapsible } = this.props
		let containerStyles = [
			styles.container,
			collapsible && styles.collapsibleDrawer,
			this.animatedStyles
		]
		let drawerStyles = [
			styles.drawer
		]		
		let overlayStyles = [
			styles.overlay,
			collapsible && styles.collapsibleOverlay
		]

		return (
			<Animated.View style={ containerStyles } onLayout={ e => this.updateLayout(e) }>
				<Interactable.View styles={ drawerStyles }>
					<Drawer router={ router } />
				</Interactable.View>
				<View style={ overlayStyles }></View>
			</Animated.View>
		)
	}
	
	updateLayout( e ){
		this.animatedStyles = animatedStyles(this.props.transition, this.props.indexes, e.nativeEvent.layout )
		this.forceUpdate();
	}
}

let styles = StyleSheet.create({
	container: {
		backgroundColor: '#fff',
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