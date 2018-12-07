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
			return this.router.onChange( createRouteChanger( this, handler, routes ) )
		},

		// Start listening to url changes
		start: function(){
			return this.router.start();
		}
	};

	stackRouter.router.setRoutes( routes );
	// stackRouter.router.onChange( createRouteChanger( stackRouter, () => {}, routes ) );

	// Somem extra methods from urlhub
	['onBeforeChange', 'push', 'replace'].forEach( method => {
		stackRouter[method] = function(){
			return this.router[method].apply( this.router, arguments );
		}
	})

	return stackRouter;
}


// Helper to translate urlhub's location changes to the model {stack, index}
function createRouteChanger( router, handler, routes ){
	let routeHierarchy = getHierarchy( routes );
	
	let onChange = location => {
		let nestedStack = createNestedStack( location, routeHierarchy );
		let { stack, index } = mergeStacks( router.stack, nestedStack, routeHierarchy )
		
		router.location = location
		router.stack = stack
		router.activeIndex = index

		return handler( location )
	}

	return onChange
}

function createNestedStack( location, routeHierarchy ) {
	let { matches, matchIds} = location
	let inTab = false
	let stack = []

	matches.forEach((screen, i) => {
		if (inTab) {
			let tabStack = inTab.tabs.stack
			inTab.tabs.index = getTabIndex(matchIds[i], tabStack)
			tabStack[ inTab.tabs.index ].location = location 
			inTab = false;
			return;
		}

		let options = screen.urlstackOptions || {}
		let item = {
			Screen: screen,
			route: matchIds[i],
			isTabs: !!options.tabs,
			isModal: !!options.modal,
			location: location,
			key: generateKey()
		}

		if (item.isTabs) {
			item.tabs = { index: 0, stack: createTabStack( routeHierarchy[item.route], routeHierarchy ) };
			inTab = item;
		}

		stack.push(item)
	})

	return stack
}

function createTabStack( tabs, routeHierarchy ){
	let stack = [];
	for( let route in tabs ){
		let options = tabs[route].urlstackOptions || {};
		let item = {
			Screen: tabs[route],
			route: route,
			location: false, // Location will be set when mounted
			isTabs: !!options.tabs,
			isModal: !!options.modal,
			key: generateKey()
		}

		if( item.isTabs ){
			item.tabs = { index: 0, stack: createTabStack(routeHierarchy[item.route], routeHierarchy) };
		}

		stack.push( item )
	}
	
	return stack;
}

function getTabIndex( route, tabs ){
	let i = tabs.length
	while( i-- > 0 ){
		if( tabs[i].route === route ){
			return i;
		}
	}
	console.warn('Tab index not found for route: ' + route )
	return 0;
}


function mergeStacks( currentStack, candidateStack, routeHierarchy ){
	let nextStack = []
	let i = 0
	let sameRoot = true
	let current = currentStack[0]
	let candidate = candidateStack[0]

	while ( current || candidate ) {
		if (sameRoot && current && candidate) {
			if (current.Screen === candidate.Screen) {
				nextStack.push( mergeItems( current, candidate, routeHierarchy ) )
			}
			else {
				sameRoot = false;
				nextStack.push( candidate )
			}
		}
		else if (sameRoot && current) {
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

function mergeItems( current, candidate, routeHierarchy ){
	let item = { ...candidate, key: current.key }
	if( item.tabs ){
		let nextIndex = candidate.tabs.index;
		item.tabs = {
			index: nextIndex,
			stack: current.tabs.stack.slice()
		}
		item.tabs.stack[ nextIndex ].location = candidate.tabs.stack[ nextIndex ].location;
	}
	return item;
}

function getHierarchy( routes, parentRoute = '' ){
	let h = {}

	routes.forEach( r => {
		let route = parentRoute + r.path;

		if( !r.children ) return (h[route] = false);

		let children = getHierarchy(r.children, r.path)
		h[route] = cleanChildrenHierarchy( route, r.children );
		h = { ...h, ...children }
	})

	return h
}

function cleanChildrenHierarchy( parentRoute, routes ){
	let hierarchy = {}
	routes.forEach( r => {
		hierarchy[ parentRoute + r.path ] = r.cb
	})
	return hierarchy
}

function generateKey() {
	let number = Math.floor( Math.random() * 100000 )
	// Make sure it starts with a letter - j is first letter of my name :)
	return 'j' + number.toString(36);
}
