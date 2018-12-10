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
	let router = urlhub.create({strategy})

	// callbacks registered for be called on route changes
	let callbacks = [];

	let stackRouter = {
		// The actual urlhub router
		router: router,

		// The stack of screens in place, with nested tabs [{Screen, route, isTabs, isModal, key}]
		stack: [],

		// The current screen in the view port
		activeIndex: -1,

		// What to do when the URL changes
		onChange: function( handler ){
			callbacks.push( handler )
		},
	};

	// Set routes and our callback that will generate the stacks
	router.setRoutes( routes );
	router.onChange( createRouteChanger( stackRouter, routes, callbacks ) );

	// Some extra methods from urlhub
	['start', 'stop', 'onBeforeChange', 'push', 'replace'].forEach( method => {
		stackRouter[method] = function(){
			return this.router[method].apply( this.router, arguments );
		}
	});

	return stackRouter;
}

// Helper to translate urlhub's location changes to the model {stack, index}
function createRouteChanger( router, routes, callbacks ){

	// Get the hierarchy of absolute routes
	let routeData = getRouteData( routes );
	
	let onChange = location => {
		// Create a nested stack based on the current location
		let nestedStack = createNestedStack( location, routeData );

		// Merge the nested stack with the one currently held by the router
		let { stack, index } = mergeStacks( router.stack, nestedStack, routeData )
		
		// Update attributes of the router
		router.location = location
		router.stack = stack
		router.activeIndex = index

		// Call user's callbacks
		callbacks.forEach( clbk => clbk(location) )
	}

	return onChange
}

function createNestedStack( location, routeData ) {
	let { matchIds } = location
	let inTab = false
	let stack = []

	matchIds.forEach( route => {
		let data = routeData[route];

		if (inTab) {
			// If we are in a tab we won't push this route to the main stack, but to the tab one
			inTab.tabs.stack.push( createStackItem( route, location, data ) )

			// Get out the stack
			inTab = false;
			return;
		}

		let item = createStackItem( route, location, data );

		if (item.isTabs) {
			item.tabs = { index: 0, stack: [] };
			inTab = item;
		}

		stack.push(item);
	})

	return stack
}

function createStackItem ( route, location, routeData ){
	return {
		Screen: routeData.cb,
		route: route,
		isTabs: !!routeData.isTabs,
		isModal: !!routeData.isModal,
		location: location,
		key: generateKey()
	}
}

function mergeStacks( currentStack, candidateStack, routeData ){
	let nextStack = []
	let i = 0
	let sameRoot = true
	let current = currentStack[0]
	let candidate = candidateStack[0]

	while ( current || candidate ) {
		if (sameRoot && current && candidate) {
			if (current.Screen === candidate.Screen) {
				nextStack.push( mergeItems( current, candidate, routeData ) )
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

function mergeItems( current, candidate, routeData ){
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

/**
 * Transform the route definition for urlhub to an object where the keys are the absolute
 * path of every route, this way we don't need to navigate through childrens to get
 * the information of a router given its path.
 * 
 * @param {*} routes The route object for urlhub
 * @param {*} parentRoute The path of the parent route to get the absolute path of children
 */
function getRouteData( routes, parentRoute = '' ){
	let h = {}

	routes.forEach( r => {
		let route = parentRoute + r.path;
		h[route] = r;
		if( r.children ){
			let childrenData = getRouteData( r.children, route );
			h = { ...h, ...childrenData }
		}
	})

	return h
}

/**
 * Generate a random key to identify a route
 */
function generateKey() {
	let number = Math.floor( Math.random() * 100000 )
	// Make sure it starts with a letter - j is first letter of my name :)
	return 'j' + number.toString(36);
}
