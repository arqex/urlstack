import {Animated, Easing} from 'react-native'

export default {
	/**
	 * Calculate new indexes based on the previous one and the stack.
	 * If there are no changes in the indexes, returns false.
	 */
	calculateIndexes: function( oldIndexes, stack, activeIndex ){
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
	},

	/**
	 * Updates the relative index and the transitions.
	 * Needs to be called when the activeIndex changes.
	 */
	updateRelativeIndexes: function( oldIndexes, stack, activeIndex ){
		let updated = false;
		let indexes =  { ...oldIndexes }
		let count = stack.length

		stack.forEach( ({key}, i) => {
			let index = {
				screen: i,
				count: count,
				relative: activeIndex - i,
				transition: indexes[key].transition,
			}

			if( index.relative !== indexes[key].relative ){
				Animated.timing( index.transition, { toValue: index.relative, easing: Easing.linear, duration: 300 } ).start()
			}

			indexes[key] = index;
		})

		return indexes;
	}
}