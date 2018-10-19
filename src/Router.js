import urlhub from 'urlhub'
import strategy from 'urlhub/pushStrategy'

export default function create( routes ){
	let stackRouter = {
		// The actual urlhub router
		router: urlhub.create({strategy}),

		// The stack of screens in place: [{screen, location, key}]
		stack: [],

		// The current screen in the view port
		currentIndex: -1,

		// What to do when the URL changes
		onChange: function( handler ){
			return this.router.onChange( createRouteChanger( this, handler ) )
		},

		// Intercepting routes, return false to stop navigating to some route
		onBeforeChange: function( handler ){
			return this.router.onBeforeChange( handler );
		},

		// Start listening to url changes
		start: function(){
			return this.router.start();
		}
	};

	stackRouter.router.setRoutes( routes );
	stackRouter.router.onChange( createRouteChanger( stackRouter, () => {} ) );

	return stackRouter;
}


// Helper to translate urlhub's location changes to the model {stack, index}
function createRouteChanger( router, handler ){
	let onChange = location => {
		let currentStack = router.stack;
		let candidateStack = location.map( screen => ({screen, location}) );
		let nextStack = [];

		let sameRoot = true;

		while( currentStack[i] || candidateStack[i] ){
			if( sameRoot && currentStack[i] && candidateStack[i] ){
				if( currentStack[i].screen === candidateStack[i].screen ){
					nextStack.push( { ...candidateStack[i], key: currentStack[i].key } )
				}
				else {
					sameRoot = false;
					nextStack.push( { ...candidateStack[i], key: generateKey() } )
				}
			}
			else if( sameRoot && currentStack[i] ){
				nextStack.push( { ...currentStack[i] } );
			}
			else if( candidateStack[i] ){
				nextStack.push( { ...candidateStack[i], key: generateKey() })
			}
			// else if( currentStack[i] ) do nothing because is not the same root

			i++;
		}

		router.stack = nextStack;
		router.currentIndex = candidateStack.length - 1;
		router.location = location;

		return handler( location );
	}

	return onChange;
}

function generateKey() {
	let number = Math.floor( Math.random() * 100000 )
	// Make sure it starts with a letter - j is first letter of my name :)
	return 'j' + number.toString(36);
}