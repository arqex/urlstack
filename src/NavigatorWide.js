import React, {Component} from 'react'
import { View, StyleSheet } from 'react-native'
import ScreenWrapperWide from './ScreenWrapperWide'
import utils from './utils'

export default class NavigatorWide extends Component {
	constructor( props ){
		super( props );
		
		let {stack, currentIndex} = props.router

		this.state = {
			indexes: utils.calculateIndexes( {}, stack, currentIndex ),
			layout: false
		}

		this.currentIndex = currentIndex
	}

	render(){
		let { router, DrawerComponent } = this.props;

		return (
			<View style={ styles.container }>
				<View style={ styles.drawer }>
					<DrawerComponent router={ router } />
				</View>
				<View style={ styles.stack } onLayout={ e => this.updateLayout(e) }>
					{ this.renderScreens( router ) }
				</View>
				<View style={ styles.modal }>
				</View>
			</View>
		)
	}

	renderScreens( router ){
		// console.log( router.stack )
		// console.log( this.state.indexes )

		// Wait for the layout to be drawn
		if( !this.state.layout ) return;

		return router.stack.map( ({Screen, location, key}) => (
			<ScreenWrapperWide screen={ Screen }
				location={ location }
				router={ router }
				indexes={ this.state.indexes[key] }
				layout={ this.state.layout }
				key={ key }>
				<Screen router={ router }
					location={ location }
					indexes={ this.state.indexes[key] }
					layout={ layout } />
			</ScreenWrapperWide>
		))
	}

	updateLayout( e ){
		console.log('Updating layout')
		this.setState({ layout: e.nativeEvent.layout })
	}

	componentWillReceiveProps( nextProps ){
		let indexes = utils.calculateIndexes( this.state.indexes, nextProps.router.stack, this.currentIndex )
		if( indexes ){
			this.setState({ indexes })
		}
	}

	componentDidUpdate(){
		let {stack, currentIndex} = this.props.router;
		
		if( this.currentIndex !== currentIndex ){
			this.currentIndex = currentIndex
			this.setState({
				indexes: utils.updateRelativeIndexes( this.state.indexes, stack, currentIndex )
			})
		}
	}
}

let styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'row'
	},
	drawer: {},
	stack: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'stretch'
	},
	modal: {}
})
