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
	}

	static defaultProps = {
		transitionTime: 1000
	}

	render(){
		let Component = this.state.isWide ? NavigatorWide : NavigatorNarrow
		return <Component router={ this.router }
			DrawerComponent={ this.props.DrawerComponent }
			transitionTime={ this.props.transitionTime }
		/>
	}

	startRouter( routes ){
		this.router = createRouter( routes );
		this.fu = () => {};
		this.router.onChange( () => this.fu() );
		this.router.start();
	}

	listenToResize(){
		this.onResize = () => this.setState( this.getDimensionData() );
		Dimensions.addEventListener( 'change', this.onResize );
	}

	getDimensionData(){
		let { width, height } = Dimensions.get('window')

		return {
			width, height,
			isWide : width > 799
		}
	}
	componentDidMount() {
		this.fu = () => this.forceUpdate();
		this.listenToResize()
	}

	componentWillUnmount() {
		this.fu = () => {}
		Dimensions.removeEventListener( 'change', this.onResize )
	}
}
