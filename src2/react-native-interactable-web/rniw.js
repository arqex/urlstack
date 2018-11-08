import React, {Component} from 'react'
import PropTypes from 'prop-types'
import { Animated, PanResponder } from 'react-native'

export default class InteractableView extends Component {
	constructor( props ){
		super( props )

		this.state = {
			pan: new Animated.ValueXY()
		}

		this._pr = this.createPanResponder( props )
	}

	propTypes = {
		snapPoints: PropTypes.array,
		frictionAreas: PropTypes.array,
		horizontalOnly: PropTypes.bool,
		verticalOnly: PropTypes.bool
	}

	defaultProps = {
		snapPoints: [],
		frictionAreas: []
	}

	render(){
		let {x,y} = this.state.pan
		let position = { transform: [
			{translateX: x}, {translateY: y}
		]}
		
		return (
			<Animated.View style={ position } {...this._pr.panHandlers }>
				{ this.props.children }
			</Animated.View>
		)
	}

	createPanResponder( props ){
		let {x,y} = this.state.pan

		let eventPan = {dx: x, dy: y};
		if(props.horizontalOnly){
			delete eventPan.dy
		}
		if(props.verticalOnly){
			delete eventPan.dx
		}

		let getFrictionFactor = this.calculateFrictionFn( props.frictionAreas );
		
		return PanResponder.create({
			onMoveShouldSetResponderCapture: () => true,
			onMoveShouldSetPanResponderCapture: () => true,
	
			onPanResponderGrant: (e, gestureState) => {
				let pan = this.state.pan
				this.state.pan.setOffset({x: pan.x._value, y: pan.y._value});
				this.state.pan.setValue({x: 0, y: 0});
			},
	
			onPanResponderMove: Animated.event([ null, eventPan ]),
	
			onPanResponderRelease: (e, {vx, vy}) => {
				// Flatten the offset to avoid erratic behavior
				this.state.pan.flattenOffset();

				let pan = this.state.pan

				if( this.props.snapPoints ){
					let {horizontalOnly, verticalOnly} = this.props
					let calculateX = verticalOnly ? 0 : 1
					let calculateY = horizontalOnly ? 0 : 1
					let snapPoint = this.getClosestPoint( pan.x._value, pan.y._value, calculateX, calculateY )

					Animated.spring( pan, {
						toValue: snapPoint,
						velocity: {x: vx, y: vy},
						stiffness: 100,
						damping: 10,
						mass: 1
					}).start()

					console.log( {x: pan.x._value, y: pan.y._value}, snapPoint, {vx, vy} )
				}

			}
		})
	}

	getClosestPoint( x, y, calculateX, calculateY ){
		let snaps = this.props.snapPoints
		let i = snaps.length - 1 
		let closest = snaps[i]
		let distance = this.calculatePointDistance( x, y, closest, calculateX, calculateY )

		while( i-- > 0 ){
			let d = this.calculatePointDistance(x, y, snaps[i], calculateX, calculateY)
			if( d < distance ){
				distance = d
				closest = snaps[i]
			}
		}
		
		return closest;
	}

	calculateFrictionFn( friction ){
		let condition = []
		if( friction.influenceArea ){}
	}

	calculatePointDistance( x0, y0, {x,y}, calculateX, calculateY){
		return Math.pow(x0 - (x || 0), 2) * calculateX + Math.pow(y0 - (y || 0 ), 2) * calculateY
	}
}

const areaComparators = {
	top: (value) => (position) => position.y < value,
	right: (value) => (position) => position.x > value,
	bottom: (value) => (position) => position.y > value,
	left: (value) => (position) => position.x < value,
}