import {Component} from 'react'
import {Animated} from 'react-native'
import memoize from './memoize'

export default class NavigatorBase extends Component {
	constructor( props ){
		super( props );
		
		let {stack, currentIndex} = props.router

		this.state = {
			indexes: this.calculateIndexes( {}, stack, currentIndex ),
			layout: false
		}

		// memoize a couple of methods
		this.calculateIndexes = memoize( this.calculateIndexes.bind( this ) )
		this.updateRelativeIndexes = memoize( this.updateRelativeIndexes.bind( this ) )
	}

	updateLayout( e ){
		console.log('Updating layout')
		this.setState({ layout: e.nativeEvent.layout })
	}

	componentWillReceiveProps( nextProps, nextState ){
		let indexes = this.calculateIndexes( this.state.indexes, nextProps.router.stack, nextProps.router.currentIndex )
		if( indexes !== this.state.indexes ){
			this.setState({ indexes })
		}
	}

	componentDidUpdate(){
		let {stack, currentIndex} = this.props.router;
		
		if( this.currentRouterIndex !== currentIndex ){
			this.currentRouterIndex = currentIndex
			this.setState({
				indexes: this.updateRelativeIndexes( this.state.indexes, stack, currentIndex )
			})
		}
	}

	/**
	 * Calculate new indexes based on the previous one and the stack.
	 * If there are no changes in the indexes, returns false.
	 */
	calculateIndexes( oldIndexes, routerStack, routerActiveIndex ){
		let { stack, activeIndex } = this.getTabStackInfo( routerStack, routerActiveIndex );

		let count = stack.length
		let indexes = { ...oldIndexes }
		let unusedIndexes = { ...oldIndexes }
		let updated = false;

		stack.forEach( ({ Screen, key }, i) => {
			if( skipNext ) {
				skipNext = false;
				return;
			}

			let options = Screen.urlstackOptions || {}
			if( options.tabs ){
				// If the the screen is a tab one, the next in the stack is its children
				skipNext = true;
			}

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

		if( updated ){
			this.currentIndex = activeIndex
		}

		return updated && indexes
	}
	
	/**
	 * Updates the relative index and the transitions.
	 * Needs to be called when the activeIndex changes.
	 */
	updateRelativeIndexes( oldIndexes, stack, activeIndex ){
		let indexes =  { ...oldIndexes }
		let count = stack.length
		let {transition} = this.props

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

	/**
	 * This function translate the plain stack to one that removes inner tab
	 * screens. Whenever there is a tab screen in the stack, the next screen is its children
	 * and is not part of the main screen stack.
	 */
	getTabStackInfo( stack, activeIndex ) {
		let indexOffset = 0;
		let tabStack = [];
		let skipNext = false;

		stack.forEach( (item, i) => {
			if( skipNext ){
				skipNext = false;
				return;
			}
			
			let options = item.Screen.urlstackOptions || {}

			if( options.tabs ){
				skipNext = true;
				if( activeIndex > i ){
					indexOffset++;
				}
			}
			
			tabStack.push( item )
		})

		return {
			stack: tabStack,
			activeIndex: activeIndex - indexOffset
		}
	}
}