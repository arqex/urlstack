import React, {Component} from 'react'
import { View, StyleSheet, Animated, Easing } from 'react-native'
import ScreenWrapperNarrow from './ScreenWrapperNarrow'
import SideMenu from 'react-native-side-menu'
import utils from './utils'

export default class NavigatorNarrow extends Component {
	constructor(props) {
		super(props);

		let { stack, currentIndex } = props.router
		
		this.state = {
			indexes: utils.calculateIndexes( {}, stack, currentIndex ),
			layout: false
		}

		this.currentIndex = currentIndex
	}

	render(){
		let { router, DrawerComponent } = this.props;

		let content = (
			<View style={ styles.container }>
				<View style={styles.stack} onLayout={ e => this.updateLayout(e) }>
					{ this.renderScreens(router) }
				</View>
				<View style={ styles.modal }>
				</View>
			</View>
		)

		if( DrawerComponent ){
			return (
				<SideMenu ref="drawer" menu={ <DrawerComponent router={ router } /> }>
					{ content }
				</SideMenu>
			)
		}

		return content;
	}

	renderScreens( router ){
		
		// Wait for the layout to be drawn
		if( !this.state.layout ) return;
		
		return router.stack.map( ({Screen, location, key}, i) => (
			<ScreenWrapperNarrow Screen={ Screen }
				location={ location }
				router={ router }
				indexes={ this.state.indexes[key] }
				layout={ this.state.layout }
				key={ key }>
				<Screen router={ router }
					location={ location }
					indexes={ this.state.indexes[key] }
					layout={ layout }
					drawer={ this.getDrawer() } />
			</ScreenWrapperNarrow>
		))
	}
	
	updateLayout( e ){
		console.log('Updating layout')
		this.setState({ layout: e.nativeEvent.layout })
	}

	getDrawer(){
		if( this.drawer ){
			return this.drawer;
		}

		let {drawer} = this.refs;
		if( drawer ){
			this.drawer = {
				open: () => drawer.openMenu( true ),
				close: () => drawer.openMenu( false ),
				toggle: () => drawer.openMenu( !drawer.isOpen )
			}

			return this.drawer;
		}
		return emptyDrawer;
	}
	componentWillReceiveProps(nextProps) {
		let { stack } = nextProps.router;
		this.setTransitions(stack, this.currentIndex)
	}

	componentDidUpdate() {
		let { stack, currentIndex } = this.props.router;
		if (this.currentIndex !== currentIndex) {
			this.currentIndex = currentIndex
			this.updateTransitions(stack, currentIndex)
		}
	}

	setTransitions(stack, currentIndex) {
		if (!this.transitions) {
			this.transitions = {}
		}

		// Track what transitions are not used anymore
		let oldTransitions = { ...this.transitions }

		stack.forEach(({ key }, i) => {
			if (this.transitions[key]) {
				return delete oldTransitions[key]
			}

			let value = 0;
			if (currentIndex === i) {
				value = 100;
			}
			else if (i < currentIndex) {
				value = 200;
			}
			this.transitions[key] = new Animated.Value(value)
		})

		// Delete tranistions not used
		Object.keys(oldTransitions).forEach(key => {
			delete this.transitions[key]
		})
	}

	updateTransitions(stack, currentIndex) {

		stack.forEach(({ key }, i) => {
			let t = this.transitions[key]
			if (currentIndex === i && t._value !== 100) {
				Animated.timing(t, { toValue: 100, easing: Easing.linear, duration: 1000 })
			}
			else if (currentIndex < i && t._value !== 200) {
				Animated.timing(t, { toValue: 200, easing: Easing.linear, duration: 1000 })
			}
			else if (currentIndex > i && t._value !== 0) {
				Animated.timing(t, { toValue: 0, easing: Easing.linear, duration: 1000 })
			}
		})

		console.log(this.transitions)
	}
}

let styles = StyleSheet.create({
	container: {
		backgroundColor: '#fff'
	},
	drawer: {},
	stack: {},
	modal: {}
})

const emptyDrawer = {
	open: () => { },
	close: () => { },
	toggle: () => { },
}
