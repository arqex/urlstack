import React, {Component} from 'react'
import { View, StyleSheet, Text, Animated } from 'react-native'

export default class ScreenWrapperWide extends Component {
	constructor(props){
		super(props)

		this.setAnimatedLayout( props.indexes, props.layout )
	}

	render(){
		let {indexes, layout} = this.props;

		let containerClasses = [
			styles.container,
			{ width: this.width, left: this.left }
		]

		let screenClasses = [
			styles.screen,
			{ opacity: this.opacity }
		]

		console.log( layout )

		return (
			<Animated.View style={ containerClasses }>
				<Animated.View style={ screenClasses }>
					{ this.props.children }
				</Animated.View>
			</Animated.View>
		)
	}
	
	setAnimatedLayout( indexes, layout ){
		let leftColumn = indexes.screen ? 400 : 0;
		this.width = indexes.transition.interpolate({
			inputRange: [ -2, -1, 0, 1, 2, 3 ],
			outputRange: [ 0, 0, layout.width - leftColumn, 400, 0, 0]
		})
		
		this.left = indexes.transition.interpolate({
			inputRange: [ -2, -1, 0, 1, 2 ],
			outputRange: [ layout.width, layout.width, leftColumn, 0, 0]
		})

		this.opacity = indexes.transition.interpolate({
			inputRange: [ -2, -.5, 0, 1, 1.5, 2 ],
			outputRange: [ 0, 0, 1, 1, 0, 0]
		})
	}

	componentWillReceiveProps( nextProps ){
		if( this.hasLayoutChanged( nextProps ) ){
			this.setAnimatedLayout( nextProps.indexes, nextProps.layout );
		}
	}

	hasLayoutChanged( nextProps ){
		let { width } = nextProps.layout;
		let { screen, relative } = nextProps.indexes;
		let { layout, indexes } = this.props;

		return (
			width !== layout.width ||
			screen !== indexes.screen ||
			relative !== indexes.relative
		)
	}
}

let styles = StyleSheet.create({
	container: {
		backgroundColor: '#eee',
		overflow: 'hidden',
		position: 'absolute',
		top: 0, height: '100%'
	},
	screen: {
		width: '100%',
		maxWidth: 800,
		marginLeft: 'auto',
		marginRight: 'auto'
	},
})
