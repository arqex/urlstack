import React, {Component} from 'react'
import { View, StyleSheet, Text } from 'react-native'

export default class ScreenWrapperWide extends Component {

	render(){
		let classes = [
			styles.container,
			this.props.moment === 'present' && styles.wide,
			this.props.moment === 'future' && styles.closed,
			this.props.moment === 'past' && styles.fixed
		]
		return (
			<View style={ classes }>
				<View style={ styles.header }>
					<Text>This is a header</Text>
				</View>
				<View style={ styles.screen }>
					{ this.props.children }
				</View>
			</View>
		)
	}
}

let styles = StyleSheet.create({
	container: {
		backgroundColor: '#eee',
		overflow: 'hidden'
	},
	header: {

	},
	fixed: {
		width: 400
	},
	closed: {
		width: 0
	},
	wide: {
		flex: 1,
		width: '100%',
		backgroundColor: 'red'
	}
})
