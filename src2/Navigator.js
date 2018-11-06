import React, {Component} from 'react'
import PropTypes from 'prop-types'
import createRouter from '../Router'
import { Dimensions } from 'react-native'
import ScreenStack from './ScreenStack'
import ModalWrapper from './ModalWrapper'
import DrawerWrapper from './DrawerWrapper'
import TransitionDesktopDefault from './defaultTransitions/TransitionDesktopDefault'
import TransitionMobileDefault from './defaultTransitions/TransitionMobileDefault'
import TransitionModalDefault from './defaultTransitions/TransitionModalDefault'
import memoize from './utils/memoize'

export default class Navigator extends Component {
	constructor( props ){
		super( props )

		this.state = this.getDimensionData();
		this.getCurrentTransition = memoize( this.getCurrentTransition )
		this.getScreenStack = memoize( this.getScreenStack )
	}

	static propTypes = {
		transitions: PropTypes.object
	}

	static defaultProps = {
		transitions: {
			0: TransitionMobileDefault,
			800: TransitionDesktopDefault
		}
	}

	render(){
		let router = this.router;
		if( !router ) return null;
		
		let { DrawerComponent, transitions } = this.props
		let { width, height } = this.state
		
		let transition = this.getCurrentTransition( transitions, width, height )
		let { stack, index } = this.getScreenStack( router.stack, router.activeIndex )

		return (
			<View>
				<DrawerWrapper router={ router } collapsible={ transition.collapsibleDrawer } DrawerComponent={ DrawerComponent } />
				<ScreenStack router={ router } transition={ transition } stack={ stack } index={ index } />
				<ModalWrapper router={ router } transition={ transition.modalTransition || TransitionModalDefault } />
			</View>
		)
	}

	getCurrentTransition( transitions, width, height ){
		let breakPoints = Object.keys( transitions )
		let i = breakPoints.length
		
		while( i-- > 0 ){
			if( width >= parseInt( breakPoints[i]) ){
				return transitions[ breakPoints[i] ]
			}
		}

		return transitions[ breakPoints[0] ]
	}

	getScreenStack( routerStack, routerIndex ){
		let stack = routerStack.slice();
		let index = routerIndex;
		let lastIndex = routerStack.length - 1;
		let last = stack[ lastIndex ]
		let options = last.Screen.urlstackOptions || {}

		if( options.modal ){
			stack.pop()
			if( index === last ){
				index--;
			}
		}

		return {stack, index}
	}

	startRouter( routes ){
		this.router = createRouter( routes );
		this.fu = () => this.forceUpdate();
		this.router.onChange( () => this.fu() );
		this.router.start();
	}

	listenToResize(){
		this.onResize = () => this.setState( this.getDimensionData() );
		Dimensions.addEventListener( 'change', this.onResize );
	}

	getDimensionData(){
		let { width, height } = Dimensions.get('window')
		return { width, height }
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
