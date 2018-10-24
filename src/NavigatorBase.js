import {Component} from 'react'
import {Animated} from 'react-native'

export default class NavigatorBase extends Component {
	constructor( props ){
		super( props );
		
		let {stack, currentIndex} = props.router

		this.state = {
			indexes: this.calculateIndexes( {}, stack, currentIndex ),
			layout: false
		}

		this.currentIndex = currentIndex
	}

	updateLayout( e ){
		console.log('Updating layout')
		this.setState({ layout: e.nativeEvent.layout })
	}

	componentWillReceiveProps( nextProps ){
		let indexes = this.calculateIndexes( this.state.indexes, nextProps.router.stack, this.currentIndex )
		if( indexes ){
			this.setState({ indexes })
		}
	}

	componentDidUpdate(){
		let {stack, currentIndex} = this.props.router;
		
		if( this.currentIndex !== currentIndex ){
			this.currentIndex = currentIndex
			this.setState({
				indexes: this.updateRelativeIndexes( this.state.indexes, stack, currentIndex )
			})
		}
	}

	/**
	 * Calculate new indexes based on the previous one and the stack.
	 * If there are no changes in the indexes, returns false.
	 */
	calculateIndexes( oldIndexes, stack, activeIndex ){
		let count = stack.length
		let indexes = { ...oldIndexes }
		let unusedIndexes = { ...oldIndexes }
		let updated = false;

		stack.forEach( ({key}, i) => {
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
}