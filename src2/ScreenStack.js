import React, {Component} from 'react'
import {Animated, View, StyleSheet} from 'react-native'
import memoize from './utils/memoize'
import ScreenWrapper from './ScreenWrapper'
import animatedStyles from './utils/animatedStyles'

export default class ScreenStack extends Component {
	constructor( props ){
		super( props );
		
		let { stack, index } = props

		this.state = {
			indexes: this.calculateIndexes({}, stack, index ),
			layout: false
		}

		this.previousIndex = index;

		// memoize a couple of methods
		this.calculateIndexes = memoize( this.calculateIndexes.bind( this ) )
		this.updateRelativeIndexes = memoize( this.updateRelativeIndexes.bind( this ) )
	}

	render(){
		let { stack, router } = this.props
		let containerStyles = [
			styles.container,
			this.animatedStyles
		]

		return (
			<Animated.View style={containerStyles}>
				<View style={styles.stack} onLayout={ e => this.updateLayout(e) }>
					{ this.renderScreens(router, stack) }
				</View>
			</Animated.View>
		)
	}
	
	renderScreens( router, stack ){
		let { layout, indexes } = this.state
		
		// Wait for the layout to be drawn
		if( !layout ) return;

		let screens = [];
		stack.forEach(item => {
			let { Screen, key, location } = item

			if( !indexes[key] ) {
				// We are probably rebuilding indexes after navigating
				return;
			}

			screens.push(
				<ScreenWrapper item={ item }
					ScreenStack={ ScreenStack }
					router={ router }
					indexes={ indexes[item.key] }
					layout={ layout }
					transition={ this.props.screenTransition }
					key={ key } />
			)
		})
		return screens;
	}

	updateLayout( e ){
		this.setState({ layout: e.nativeEvent.layout })
		this.animatedStyles = animatedStyles(this.props.stackTransition, this.props.stackIndexes, e.nativeEvent.layout )
	}

	componentDidUpdate() {
		let { stack, index, stackTransition,  } = this.props
		let indexes = this.calculateIndexes( this.state.indexes, stack, this.previousIndex )

		// Check if the indexes has changed
		if( indexes !== this.state.indexes ){
			this.setState( { indexes } );
		}
		
		// If the flag needRelativeUpdate is up, we need to update the relative
		// indexes to start the animations
		if (this.needRelativeUpdate) {
			this.needRelativeUpdate = false;
			this.setState({
				indexes: this.updateRelativeIndexes(indexes, stack, index)
			})
		}

		// If the pointer to the current screen has changed we need to start
		// the animations at the next tick, so raise the flag needRelativeUpdate
		if( index !== this.previousIndex ){
			this.needRelativeUpdate = true;
			this.previousIndex = index;
			this.forceUpdate();
		}
	}

	/**
	 * Calculate new indexes based on the previous one and the stack.
	 * If there are no changes in the indexes, returns oldIndexes.
	 */
	calculateIndexes( oldIndexes, stack, activeIndex ){
		let count = stack.length
		let indexes = { ...oldIndexes }
		let unusedIndexes = { ...oldIndexes }
		let updated = false;

		stack.forEach( ({ Screen, key }, i) => {
			if( unusedIndexes[key] ){
				return delete unusedIndexes[key]
			}

			updated = true;

			indexes[ key ] = {
				screen: i,
				count: count,
				relative: activeIndex - i,
				transition: new Animated.Value( activeIndex - i ),
			}
		})

		// Delete tranistions not used
		Object.keys( unusedIndexes ).forEach( key => {
			delete indexes[key]
			updated = true;
		})

		console.log( updated )

		return updated ? indexes : oldIndexes
	}
	
	/**
	 * Updates the relative index and the transitions.
	 * Needs to be called when the activeIndex changes.
	 */
	updateRelativeIndexes( oldIndexes, stack, activeIndex ){
		let indexes =  { ...oldIndexes }
		let count = stack.length
		let transition = this.props.screenTransition

		stack.forEach( ({key}, i) => {
			let index = {
				screen: i,
				count: count,
				relative: activeIndex - i,
				transition: indexes[key].transition,
			}

			if( index.relative !== indexes[key].relative ){
				Animated.timing( index.transition, {
					toValue: index.relative,
					easing: transition.easing,
					duration: transition.duration || 300,
					useNativeDriver: true,
				}).start()
			}

			indexes[key] = index;
		})

		return indexes;
	}
}

let styles = StyleSheet.create({
	container: {
		backgroundColor: '#fff',
		flex: 1
	},
	drawer: {},
	stack: {
		height: '100%', width: '100%'
	}
})