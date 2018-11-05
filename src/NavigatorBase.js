import {Component} from 'react'
import {Animated} from 'react-native'
import memoize from './memoize'

export default class NavigatorBase extends Component {
	constructor( props ){
		super( props );
		
		let { stack, index } = this.getStackAndIndex(props)

		this.state = {
			indexes: this.calculateIndexes({}, stack, index ),
			layout: false
		}

		this.previousIndex = index;

		// memoize a couple of methods
		this.calculateIndexes = memoize( this.calculateIndexes.bind( this ) )
		this.updateRelativeIndexes = memoize( this.updateRelativeIndexes.bind( this ) )
	}

	updateLayout( e ){
		this.setState({ layout: e.nativeEvent.layout })
	}

	/*
	componentWillReceiveProps( nextProps ){
		let { stack, index } = this.getStackAndIndex(nextProps)
		let previous = this.getStackAndIndex( this.props )

		if (previous.index !== index || previous.stack !== stack) {
			this.setState({
				indexes: this.calculateIndexes(this.state.indexes, stack, previous.index)
			})
		}
	}
	*/

	componentDidUpdate() {
		let { stack, index } = this.getStackAndIndex(this.props)
		let indexes = this.calculateIndexes( this.state.indexes, stack, this.previousIndex )
		if( indexes !== this.state.indexes ){
			this.setState( { indexes } );
		}

		if (this.needRelativeUpdate) {
			this.needRelativeUpdate = false;
			this.setState({
				indexes: this.updateRelativeIndexes(indexes, stack, index)
			})
		}

		if( index !== this.previousIndex ){
			this.needRelativeUpdate = true;
			this.previousIndex = index;
			this.forceUpdate();
		}
	}

	/**
	 * Get the stack and index from the props
	 * It's overriden by TabNavigator
	 */
	getStackAndIndex( props ){
		let {stack, activeIndex } = props.router
		return { stack, index: activeIndex }
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

		return updated ? indexes : oldIndexes
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