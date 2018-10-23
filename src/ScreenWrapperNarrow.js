import React, {Component} from 'react'
import { View, StyleSheet, Text } from 'react-native'

export default class ScreenWrapperNarrow extends Component {
	constructor(props){
		super(props)

		this.setAnimatedLayout( props.indexes, props.layout )
	}

	render(){
		let containerClass = [
			style.container,
			{transform: [{translate: this.left }] }
		]
		let screenClass = [
			styles.screen,
			{ opacity: this.opacity, transform: [{scale: this.scale }] }
		]

		return (
			<View style={ containerClass }>
				<View style={ screenClass }>
					{ this.props.children }
				</View>
			</View>
		)
	}

	setAnimatedLayout( indexes, layout ){
		this.left = indexes.transition.interpolate({
			inputRange: [ -2, -1, 0, 1 ],
			outputRange: [ layout.width, layout.width, 0, 0 ]
		})

		this.opacity = indexes.transition.interpolate({
			inputRange: [ -2, -.5, 0, 1, 1.5, 2 ],
			outputRange: [ 0, 0, 1, 1, 0, 0]
		})
		
		this.scale = indexes.transition.interpolate({
			inputRange: [  -1, 0, 1, 2 ],
			outputRange: [ 1, 1, .5, .5]
		})
	}
}

let styles = StyleSheet.create({
	container: {
		backgroundColor: '#eee',
		overflow: 'hidden',
		position: 'absolute',
		width: '100%', height: '100%',
		top: 0, left: 0
	}
})
