import React, {Component} from 'react'
import { StyleSheet, Animated } from 'react-native'
import TransitionTabDefault from './defaultTransitions/TransitionTabDefault'

export default class ScreenWrapper extends Component {
	constructor(props){
		super(props)

		this.setAnimatedLayout( props.indexes, props.layout )
	}

	render(){
		let containerClass = [
			styles.container,
			this.animatedStyles
		]

		return (
			<Animated.View style={ containerClass }>
				{ this.renderScreen() }
			</Animated.View>
		)
	}

	renderScreen(){
		let { item, ScreenStack, router, transition } = this.props;
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
		let transition = this.props.transition( indexes, layout )
		let styles = transition.styles || {}

		let animatedStyles = {
			zIndex: indexes.count - Math.abs(indexes.relative)
		}
		let transformStyles = []

		Object.keys( styles ).forEach( key => {
			if( styleKeys[key] ){
				animatedStyles[ key ] = indexes.transition.interpolate( styles[key] )
			}
			if( transformKeys[key] ){
				transformStyles.push({
					[key]: indexes.transition.interpolate( styles[key] )
				})
			}
		})

		if( transformStyles.length ){
			animatedStyles.transform = transformStyles
		}

		this.animatedStyles = animatedStyles;
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


let transformKeys = {};
[	'perspective', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 
	'scale', 'scaleX', 'scaleY', 'translateX', 'translateY',
	'skewX', 'skewY'
].forEach( key => transformKeys[key] = 1 )

let styleKeys = {};
[ 'left', 'right', 'top', 'bottom',
	'width', 'height', 'opacity', 'backgroundColor'
].forEach( key => styleKeys[key] = 1 )