import React, {Component} from 'react'
import createRouter from './Router'
import { Dimensions } from 'react-native'
import NavigatorNarrow from './NavigatorNarrow'
import NavigatorWide from './NavigatorWide'

export default class Navigator extends Component {
	constructor( props ){
		super( props )

		this.state = this.getDimensionData();
		this.startRouter( props.routes );
		this.listenToResize();
	}

	render(){
		let Component = this.state.isWide ? NavigatorWide : NavigatorNarrow
		return <Component router={ this.router } />
	}

	startRouter( routes ){
		this.router = createRouter( routes );
		this.router.onChange( () => this.forceUpdate() );
		this.router.start();
	}

	listenToResize(){
		this.onResize = () => this.setState( this.getDimensionData() );
		Dimensions.addEventListener( 'change', this.onResize() );
	}

	getDimensionData(){
		let { width, height } = Dimensions.get('window')

		return {
			width, height,
			isWide : width > 799
		}
	}

	componentWillUnmount() {
		Dimensions.removeEventListener( 'change', this.onResize )
	}
}