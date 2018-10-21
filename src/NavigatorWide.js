import React, {Component} from 'react'
import { Animated, View, StyleSheet, Easing } from 'react-native'
import ScreenWrapperWide from './ScreenWrapperWide'

export default class NavigatorWide extends Component {
	constructor( props ){
		super( props );
		
		let {stack, currentIndex} = props.router

		this.currentIndex = currentIndex

		this.setTransitions( stack, currentIndex )
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
		return router.stack.map( ({Screen, location, key}) => (
			<ScreenWrapperWide screen={ Screen }
				location={ location }
				router={ router }
				transition={ this.transitions[key] }
				key={ key }>
				<Screen router={ router } location={ location } />
			</ScreenWrapperWide>
		))
	}

	componentWillReceiveProps( nextProps ){
		let { stack } = nextProps.router;
		this.setTransitions( stack, this.currentIndex )
	}

	componentDidUpdate(){
		let {stack, currentIndex} = this.props.router;
		if( this.currentIndex !== currentIndex){
			this.currentIndex = currentIndex
			this.updateTransitions( stack, currentIndex )
		}
	}

	setTransitions( stack, currentIndex ){
		if( !this.transitions ){
			this.transitions = {}
		}

		// Track what transitions are not used anymore
		let oldTransitions = { ...this.transitions }

		stack.forEach( ({ key }, i) => {
			if( this.transitions[key] ){
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
		Object.keys(oldTransitions).forEach( key => {
			delete this.transitions[key]
		})
	}

	updateTransitions( stack, currentIndex ){
		
		stack.forEach( ({key}, i) => {
			let t = this.transitions[key]
			if( currentIndex === i && t._value !== 100 ){
				Animated.timing( t, { toValue: 100, easing: Easing.linear, duration: 1000 })
			}
			else if (currentIndex < i && t._value !== 200) {
				Animated.timing(t, { toValue: 200, easing: Easing.linear, duration: 1000 })
			}
			else if( currentIndex > i && t._value !== 0 ) {
				Animated.timing(t, { toValue: 0, easing: Easing.linear, duration: 1000 })
			}
		})

		console.log( this.transitions )
	}
}

let styles = StyleSheet.create({
	container: {
		flexDirection: 'row'
	},
	drawer: {},
	stack: {
		flexDirection: 'row'
	},
	modal: {}
})
