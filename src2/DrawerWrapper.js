import React, {Component} from 'react'
import { StyleSheet, Animated, View } from 'react-native'
import animatedStyles from './utils/animatedStyles'
import Interactable from 'react-interactable'

export default class DrawerWrapper extends Component {
	constructor(props){
		super(props)
		this.drawerWidth = 300;
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

		let snapPoints = [
			{ x: 0 }, {x: this.drawerWidth}
		];

		return (
			<Animated.View style={ containerStyles }>
				<View style={ overlayStyles }></View>
				<Interactable.View dragEnabled={ collapsible } horizontalOnly={ true } snapPoints={ snapPoints }>
					<View style={ drawerStyles }>
						<View style={ styles.drawerBg } />
						<Drawer router={ router } onLayout={ e => this.updateLayout(e) } />
						<View style={ styles.dragHandle } />
					</View>
				</Interactable.View>
			</Animated.View>
		)
	}
	
	updateLayout( e ){
		let {layout} = e.nativeEvent.layout;

		this.animatedStyles = animatedStyles(this.props.transition, this.props.indexes, layout );
		this.drawerWidth = layout.width;
		this.forceUpdate();
	}
}

let styles = StyleSheet.create({
	container: {
    position: 'absolute',
		top: 0, bottom: 0, left: 0,
		width: '100%',
    flexDirection: 'row-reverse',
		transform: [{ translateX: '-100%'}],
		zIndex: 2000,
		backgroundColor: '#e0e0e0',
	},
	collapsibleDrawer: {
		
	},
	drawer: {
    left: 0,
    width: '100%',
    flex: 1,
		backgroundColor: '#e0e0e0',
		position: 'relative',
		zIndex: 20000
	},
	drawerBg: {
		backgroundColor: 'blue',
		width: 4000,
		position: 'absolute',
		top: 0, bottom: 0, right: 0
	},
	dragHandle: {
		width: 40,
		top: 0, bottom: 0, right: -20,
		backgroundColor: 'green',
		position: 'absolute',
		zIndex: 10
	},
	overlay: {
		backgroundColor: 'red',
		height: '100%',
		width: '100%',
		position: 'absolute',
		left: '100%',
		zIndex: -1
	},
	collapsibleOverlay: {
	}
})