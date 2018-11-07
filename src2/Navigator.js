import React, {Component} from 'react'
import PropTypes from 'prop-types'
import createRouter from '../src/Router'
import { Dimensions, View, StyleSheet, Animated } from 'react-native'
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
		let { width, height, indexes } = this.state
		
		let transition = this.getCurrentTransition( transitions, width, height )
		let modalTransition = this.getModalTransitions( transition )
		let { stack, index } = this.getScreenStack( router.stack, router.activeIndex )

		return (
			<View style={ styles.container }>
				<DrawerWrapper router={ router }
					collapsible={ transition.collapsibleDrawer }
					Drawer={ DrawerComponent } />
				<ScreenStack router={ router }
					screenTransition={ transition }
					stackTransition={ modalTransition.stack }
					stackIndexes={ indexes.stack }
					stack={ stack }
					index={ index } />
				<ModalWrapper router={ router }
					transition={ modalTransition.modal }
					indexes={ indexes.modal }
					layout={ {width, height} } />
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

	getModalTransitions( transition ){
		let t = transition
		if( !t ){
			let { transitions } = this.props
			let { width, height } = this.state
			t = this.getCurrentTransition( transitions, width, height )
		}
		return t.modalTransition || TransitionModalDefault
	}

	// Takes the modal screens out of the stack
	getScreenStack( routerStack, routerIndex ){
		let stack = routerStack.slice();
		let index = routerIndex;
		let lastIndex = routerStack.length - 1;
		let last = stack[ lastIndex ]
		let options = last.Screen.urlstackOptions || {}

		if( options.modal ){
			stack.pop()
			if( index === lastIndex ){
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
		this.showingModal = this.detectModal();
		this.updateModalIndexes( this.showingModal )
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

	componentDidUpdate(){
		let showModal = this.detectModal()
		if( this.showingModal !== showModal ){
			this.showingModal = showModal;
			this.updateModalIndexes( showModal );
		}
	}

	detectModal(){
		let item = this.router.stack[ this.router.activeIndex ]
		return item && item.isModal
	}

	updateModalIndexes( showModal ){
		let {indexes} = this.state

		if( !indexes ){
			indexes = {
				modal: {showing: !!showModal, transition: new Animated.Value( showModal ? 1 : 0) },
				stack: {showing: !showModal, transition: new Animated.Value( showModal ? 0 : 1) }
			}
		}
		else {
			let {width, height} = this.state
			let transitions = this.getModalTransitions()
			let modalTransition = transitions.modal( indexes.modal, {width, height} )
			let stackTransition = transitions.stack( indexes.stack, {width, height} )

			indexes = {
				modal: {showing: !!showModal, transition: indexes.modal.transition },
				stack: {showing: !showModal, transition: indexes.stack.transition }
			}

			Animated.timing( indexes.modal.transition, {
				toValue: showModal ? 1 : 0,
				easing: modalTransition.easing,
				duration: modalTransition.duration || 300,
				useNativeDriver: true
			}).start()

			Animated.timing( indexes.stack.transition, {
				toValue: showModal ? 0 : 1,
				easing: stackTransition.easing,
				duration: stackTransition.duration || 300,
				useNativeDriver: true
			}).start()
		}

		this.setState({indexes})
	}
}

let styles = StyleSheet.create({
	container: {
		flex: 1,
		flexDirection: 'row'
	}
})