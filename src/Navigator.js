import React, {Component} from 'react'
import PropTypes from 'prop-types'
import createRouter from './Router'
import { Dimensions } from 'react-native'
import NavigatorMobile from './mobile/NavigatorMobile'
import NavigatorDesktop from './desktop/NavigatorDesktop'

export default class Navigator extends Component {
	constructor( props ){
		super( props )

		this.state = this.getDimensionData();
	}

	static propTypes = {
		transitionMobile: PropTypes.object,
		transitionDesktop: PropTypes.object,
	}

	static defaultProps = {
		transitionTime: 1000
	}

	render(){
		if( !this.router ) return null;
		
		let Component = this.state.isWide ? NavigatorDesktop : NavigatorMobile
		return <Component router={ this.router }
			transition={ this.state.isWide ? this.props.transitionDesktop : this.props.transitionMobile }
			DrawerComponent={ this.props.DrawerComponent }
		/>
	}

	startRouter( routes ){
		this.router = createRouter( routes );
		this.fu = () => this.forceUpdate();
		this.router.onChange( this.fu );
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
		this.startRouter(this.props.routes);
		this.listenToResize()
	}

	componentWillUnmount() {
		this.fu = () => {}
		Dimensions.removeEventListener( 'change', this.onResize )
	}
}
