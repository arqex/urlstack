export default function animatedStyles( transitionCreator, indexes, layout ){
	let transition = transitionCreator( indexes, layout )
	let styles = transition.styles || {}

	let animatedStyles = {}
	let transformStyles = []

	if( indexes.count ){
		animatedStyles.zIndex = indexes.count - Math.abs(indexes.relative)
	}

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

	return animatedStyles
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