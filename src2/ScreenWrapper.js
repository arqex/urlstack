import React, {Component} from 'react'
import { StyleSheet, Animated } from 'react-native'
import TransitionTabDefault from './defaultTransitions/TransitionTabDefault'
import animatedStyles from './utils/animatedStyles'

export default class ScreenWrapper extends Component {
	constructor(props){
		super(props)

		this.setAnimatedLayout( props.indexes, props.layout )
	}

	render(){
		let containerStyles = [
			styles.container,
			this.animatedStyles
		]

		return (
			<Animated.View style={ containerStyles }>
				{ this.renderScreen() }
			</Animated.View>
		)
	}

	renderScreen(){
		let { item, ScreenStack, router, transition, indexes, layout } = this.props;
		let { Screen, location } = item;

		if( item.isTabs ){
			return (
				<Screen router={router}
					location={location}
					indexes={indexes}
					layout={layout} >
					<ScreenStack router={ router }
						transition={ transition.tabTransition || TransitionTabDefault }
						stack={ item.tabs.stack }
						index={ item.tabs.index } />
				</Screen>
			)
		}

		return (
			<Screen router={router}
				location={location}
				indexes={indexes}
				layout={layout} />
		)
	}
	
	setAnimatedLayout( indexes, layout ){
		this.animatedStyles = animatedStyles( this.props.transition, indexes, layout )
	}

	componentWillReceiveProps( nextProps ){
		if( this.hasLayoutChanged( nextProps ) ){
			this.setAnimatedLayout( nextProps.indexes, nextProps.layout );
		}
	}

	hasLayoutChanged( nextProps ){
		if( !nextProps.indexes ) return;
		
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
		width: '100%', height: '100%',
		top: 0, left: 0,
		zIndex:10
	}
})