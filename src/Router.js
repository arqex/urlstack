import urlhub from 'urlhub'
import strategy from 'urlhub/hashStrategy'

// A wrapper around urlhub to better manage a stack
// Changes in the current routes will be stacking the screens,
// if going back the screens don't get unmounted, there is an index
// that points to the current active route
//
// The route also handles tab screens. Navegating in a tab screen doesn't
// update the main stack, but the children inside the tab screen

// If we imagine a linear stack of routes like this:
// /a ---> /a/tab ---> /a/tab/2 ---> /a/tab/2/details ( activeIndex: 2 )
// [0]     [1]         [2]           [3]

// But the real stack that handles the tab screens would be like this:
//
//   [0]     [1]         [2]
//   /a ---> /a/tab ---> /a/tab/2/details (activeIndex: 1)
//              |
//              V
// [/a/tab/1, /a/tab/2, /a/tab/3 ] (activeTabIndex: 1)
// [0]        [1]       [2]
//
// So there is a new stack for every tab

export default function create( routes ){
	let stackRouter = {
		// The actual urlhub router
		router: urlhub.create({strategy}),

		// The stack of screens in place, with nested tabs [{Screen, route, isTabs, isModal, key}]
		stack: [],

		// The current screen in the view port
		activeIndex: -1,

		// What to do when the URL changes
		onChange: function( handler ){
			return this.router.onChange( createRouteChanger( this, handler ) )
		},

		// Start listening to url changes
		start: function(){
			return this.router.start();
		}
	};

	stackRouter.router.setRoutes( routes );
	stackRouter.router.onChange( createRouteChanger( stackRouter, () => {} ) );

	// Somem extra methods from urlhub
	['onBeforeChange', 'push', 'replace'].forEach( method => {
		stackRouter[method] = function(){
			return this.router[method].apply( this.router, arguments );
		}
	})

	return stackRouter;
}


// Helper to translate urlhub's location changes to the model {stack, index}
function createRouteChanger( router, handler ){
	let onChange = location => {
		let nestedStack = createNestedStack( location );
		let { stack, index } = mergeStacks( router.stack, nestedStack )
		
		router.location = location
		router.stack = stack
		router.activeIndex = index

		return handler( location )
	}

	return onChange
}

function createNestedStack(location) {
	let { matches, matchIds} = location
	let inTab = false
	let stack = []

	matches.forEach((screen, i) => {
		if (inTab) {
			inTab.tabs = {
				index: 0,
				stack: [{ Screen: screen, route: matchIds[i], key: generateKey() }]
			}
			inTab = false;
			return;
		}

		let options = Screen.urlstackOptions || {}
		let item = {
			Screen: screen,
			route: matchIds[i],
			isTabs: !!options.tabs,
			isModal: !!options.modal,
			location: location,
			key: generateKey()
		}

		if (screen.tabs) {
			item.tabs = [];
		}

		stack.push(item)
	})

	return stack
}


function mergeStacks( currentStack, candidateStack ){
	let nextStack = []
	let i = 0
	let sameRoot = true
	let current = currentStack[0]
	let candidate = candidateStack[0]

	while ( current || candidate ) {
		if (sameRoot && current && candidate) {
			if (currentStack[i].Screen === candidate.Screen) {
				nextStack.push( mergeItems( current, candidate ) )
			}
			else {
				sameRoot = false;
				nextStack.push( candidate )
			}
		}
		else if (sameRoot && currentStack[i]) {
			nextStack.push( current );
		}
		else if (candidate) {
			nextStack.push( candidate )
		}
		// else if( current ) do nothing because is not the same root

		i++;
		current = currentStack[i]
		candidate = candidateStack[i]
	}

	return {
		stack: nextStack,
		index: candidateStack.length - 1
	}
}

function mergeItems( current, candidate ){
	let item = { ...candidate, key: current.key }
	if( item.tabs ){
		item.tabs = mergeTabs( current.tabs, candidate.tabs[0] )
	}
	return item;
}

function mergeTabs( currentTabs, candidate ){
	let i = currentTabs.length
	let stack = currentTabs.slice()
	while( i-- > 0 ){
		if( currentTabs[i].route === candidate.route ){
			// Screen found in the current screen, just update the index
			return { stack, index: i }
		}
	}

	stack.push( candidate )
	return { stack, index: stack.length - 1 }
}

function generateKey() {
	let number = Math.floor( Math.random() * 100000 )
	// Make sure it starts with a letter - j is first letter of my name :)
	return 'j' + number.toString(36);
}
