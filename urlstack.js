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
		
		// Route cache to generate new routes
		_nestedStack: [],

		modal: { active: false, stack: [], activeIndex: -1 },

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
		let { stack, index } = mergeStacks( router._nestedStack || [], nestedStack, routeData );
		setStacksAndIndexes( router, splitStack( stack ), index, routeData )

		// Update attributes of the router
		router.location = location
		router._nestedStack = stack

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
			item.tabs = { activeIndex: 0, stack: [] };
			inTab = item;
		}

		stack.push(item);
	})

	if( inTab ){
		// This means that the last screen in the hierarchy was a tab wrapper
		// We need to fill the tab stack at least with one ticket
		var tab = routeData[ matchIds[matchIds.length - 1] ]
		var child = getFirstTab( tab )
		var route = location.pathname + child.path
		inTab.tabs.stack.push( createStackItem(route, location, routeData[route]) )
	}

	return stack
}

function splitStack( nestedStack ){
	let allStacks = []
	let currentStack = []
	nestedStack.forEach( item => {
		if( item.isModal ){
			allStacks.push( currentStack );
			currentStack = [ item ]
		}
		else {
			currentStack.push( item )
		}
	})
	if( currentStack.length ){
		allStacks.push( currentStack )
	}
	return allStacks;
}

function setStacksAndIndexes( router, stacks, targetIndex, routeData ){
	if( !stacks[0].length ){
		// If the first element is empty means that we are in a modal
		if( !router.stack.length ){
			// if the currentstack is empty we need to get the default screen
			let bgRoute = routeData[ stacks[1][0].route ].backgroundRoute || '/*'
			let location = router.router.match( bgRoute )
			let {stack, index} = mergeStacks( [], createNestedStack( location, routeData ), routeData);
			router.stack = stack
			router.activeIndex = index
		}
		// otherwise we need to preserve the current stack
	}
	else {
		router.stack = stacks[0]
		router.activeIndex = Math.max( 0, Math.min( targetIndex, stacks[0].length - 1 ) )
		if( router.modal ){
			router.modal.active = false
		}
	}

	if( stacks.length > 1 ){
		if( !router.modal ){
			router.modal = { stack: [], activeIndex: 0 }
		}
		router.modal.active = targetIndex >= 0;
		setStacksAndIndexes( router.modal, stacks.slice(1), targetIndex - stacks[0].length, routeData )
	}
}


function createStackItem ( route, location, routeData ){
	return {
		Screen: routeData.cb,
		route: route,
		isTabs: !!routeData.isTabs,
		isModal: !!routeData.isModal,
		location: location,
		path: getRoutePath( route, location.pathname ),
		key: generateKey()
	}
}

function getRoutePath( route, pathname ){
	let routeParts = route.split('/');
	let pathParts = pathname.split('/');
	let routePath = [];

	routeParts.forEach( (p, i) => {
		routePath.push( pathParts[i] || p )
	})

	return routePath.join('/');
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
				if( current.path !== candidate.path ){
					// If the paths are not the same, some parameter might have changed
					// discard the rest of the current stack. We already have reused the id
					sameRoot = false
				}
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
		let tabOrder = routeData[ current.route ].children
		let toAdd = candidate.tabs.stack[0]
		let tabStack = current.tabs.stack.slice()
		let i = 0
		let added = false
		tabOrder.forEach( tab => {
			if( added ) return;

			let route = current.route + tab.path;
			let currentTab = tabStack[i]
			if( toAdd.route === route ){
				if( currentTab && currentTab.route === route ){
					toAdd.key = currentTab.key
					tabStack[i] = toAdd
				}
				else {
					tabStack.splice( i, 0, toAdd )
				}
				added = true;
			}
			else if( currentTab && currentTab.route === route ){
				i++;
			}
		})

		item.tabs = {
			stack: tabStack,
			activeIndex: i 
		}
	}
	return item;
}

function getFirstTab( tabScreen ){
	let i = 0;
	let child;

	while( i < tabScreen.children.length ){
		child = tabScreen.children[i]
		if( !child.isTabs && !child.isModal ){
			return child;
		}
	}
	
	console.warn('Urlstack: Hit a tabs URL without any children: ' + tabScreen.path )
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
