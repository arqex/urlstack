import {Component} from 'react'

export default class ScreenWrapper extends Component {
	constructor(props){
		super(props)

		this.setAnimatedLayout( props.indexes, props.layout )
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


let transformKeys = {};
[	'perspective', 'rotate', 'rotateX', 'rotateY', 'rotateZ', 
	'scale', 'scaleX', 'scaleY', 'translateX', 'translateY',
	'skewX', 'skewY'
].forEach( key => transformKeys[key] = 1 )

let styleKeys = {};
[ 'left', 'right', 'top', 'bottom',
	'width', 'height', 'opacity', 'backgroundColor'
].forEach( key => styleKeys[key] = 1 )
