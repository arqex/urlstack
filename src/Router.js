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

		// The stack of screens in place: [{Screen, location, key}]
		stack: [],

		// The current screen in the view port
		currentIndex: -1,

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
		let { linearStack, linearIndex } = createLinearStack( router, location )
		let { stack, activeIndex } = transformLinearStack( linearStack, linearIndex )
		
		router.location = location
		router.linearStack = linearStack
		router.stack = stack
		router.activeIndex = activeIndex

		return handler( location )
	}

	return onChange
}

function createLinearStack( router, location ){
	let currentStack = router.linearStack;
	let candidateStack = location.matches.map(Screen => ({ Screen, location }));
	let nextStack = [];
	let i = 0;
	let sameRoot = true;

	while (currentStack[i] || candidateStack[i]) {
		if (sameRoot && currentStack[i] && candidateStack[i]) {
			if (currentStack[i].Screen === candidateStack[i].Screen) {
				nextStack.push({ ...candidateStack[i], key: currentStack[i].key })
			}
			else {
				sameRoot = false;
				// isTabs and isModal is set when transforming the linear stack
				nextStack.push({ ...candidateStack[i], key: generateKey(), isTabs: false, isModal: false })
			}
		}
		else if (sameRoot && currentStack[i]) {
			nextStack.push({ ...currentStack[i] });
		}
		else if (candidateStack[i]) {
			nextStack.push({ ...candidateStack[i], key: generateKey(), isTabs: false, isModal: false })
		}
		// else if( currentStack[i] ) do nothing because is not the same root

		i++;
	}

	return {
		linearStack: nextStack,
		linearIndex: candidateStack.length - 1
	}
}

function transformLinearStack( linearStack, linearIndex ){
	let inTab = false
	let stack = []
	let indexOffset = 0
	linearStack.forEach( (item, i) => {
		if( inTab ){
			stack.push( addToTabStack( inTab, item ) )
			if( i < linearIndex ){
				indexOffset++
			}
		}

		let { Screen } = item
		let options = Screen.urlstackOptions || {}

		if( options.tabs ){
			item.isTabs = true
			if( !item.tabs ){
				item.tabs = {
					stack: [],
					activeIndex: -1
				}
			}

			inTab = item
			return; // We add the item in the next iteration
		}

		if( options.modal ){
			item.isModal = true
		}

		stack.push( item )
	})

	return {
		stack: stack,
		activeIndex: linearIndex - indexOffset
	}
}

function addToTabStack( item, tab ){
	let {stack, activeIndex} = item.tabs

	let foundIndex = false
	let i = stack.length;
	while( i-- > 0 && foundIndex === false ){
		if( stack[i].Screen === tab.Screen ){
			foundIndex = i
		}
	}

	if( foundIndex !== false && foundIndex === activeIndex ){
		// No change
		return item;
	}

	let nextItem = { ...item };
	if( foundIndex === false ){
		let nextStack = stack.slice()
		nextStack.push( tab );
		nextItem.tabs = {
			stack: nextStack,
			activeIndex: nextStack.length -1
		}
	}
	else {
		nextItem = {
			stack: item.stack,
			activeIndex: foundIndex
		}
	}

	return nextItem;
}

function generateKey() {
	let number = Math.floor( Math.random() * 100000 )
	// Make sure it starts with a letter - j is first letter of my name :)
	return 'j' + number.toString(36);
}
