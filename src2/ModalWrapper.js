import React, {Component} from 'react'
import { StyleSheet, Animated, View, Text } from 'react-native'
import animatedStyles from './utils/animatedStyles'


export default class ModalWrapper extends Component {
	constructor(props){
		super(props)
		this.setAnimatedLayout( props.indexes, props.layout )
	}

	render(){
		let containerStyles = [
			styles.container,
			this.animatedStyles
		]

		let item = this.getScreenItem( this.props.item )
		let content = item ? <item.Screen /> : <View></View>;

		return (
			<Animated.View style={ containerStyles }>
				{ content }
			</Animated.View>
		)
	}

	getScreenItem( item ){
		if( item && item !== this.item ){
			this.item = item;
		}
		return this.item;
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
		let { showing } = nextProps.indexes;
		let { layout, indexes } = this.props;

		return (
			width !== layout.width ||
			showing !== indexes.showing
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