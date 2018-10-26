import React from 'react'
import ScreenWrapper from './ScreenWrapper'
import TransitionNarrowDefault from './TransitionMobileDefault'
import NavigatorTab from './NavigatorTab'

export default class TabDirector extends Component {
	let {Screen, location, } = this.props.parent
	let content = (
		<NavigatorTab stack={ this.state.stack } activeIndex={ this.state.activeIndex } />
	)

	render(){
		return(
			<Screen content={ content }
				location={}
		)
	}
}
export default class ScreenWrapperNarrow extends ScreenWrapper {
	static defaultProps = {
		transition: TransitionNarrowDefault
	}

	render(){
		let containerClass = [
			styles.container,
			this.animatedStyles
		]

		return (
			<Animated.View style={ containerClass }>
				{ this.props.children }
			</Animated.View>
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
