import React, {Component} from 'react'
import { StyleSheet, Animated, View } from 'react-native'

export default class ModalWrapper extends Component {
	constructor(props){
		super(props)
	}

	render(){
		let { Drawer, router } = this.props

		return (
			<View>
				<Drawer router={ router } />
			</View>
		)
	}
}

let styles = StyleSheet.create({
	container: {
		backgroundColor: '#eee',
		overflow: 'hidden',
		position: 'absolute',
		width: '100%', height: '100%',
		top: 0, left: 0,
		zIndex:10
	}
})