import React, {Component} from 'react'
import { Animated, View, StyleSheet, Easing } from 'react-native'
import ScreenWrapperWide from './ScreenWrapperWide'
import utils from './utils'

export default class NavigatorWide extends Component {
	constructor( props ){
		super( props );
		
		let {stack, currentIndex} = props.router

		this.state = {
			indexes: utils.calculateIndexes( {}, stack, currentIndex ),
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
				<View style={ styles.stack }>
					{ this.renderScreens( router ) }
				</View>
				<View style={ styles.modal }>
				</View>
			</View>
		)
	}

	renderScreens( router ){
		console.log( router.stack )
		console.log( this.state.screenMoments )
		return router.stack.map( ({Screen, location, key}) => (
			<ScreenWrapperWide screen={ Screen }
				location={ location }
				router={ router }
				indexes={ this.state.indexes }
				key={ key }>
				<Screen router={ router } location={ location } indexes={ this.state.indexes } />
			</ScreenWrapperWide>
		))
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
