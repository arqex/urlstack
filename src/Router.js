import urlhub from 'urlhub'
import strategy from 'urlhub/hashStrategy'

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
		let currentStack = router.stack;
		let candidateStack = location.matches.map( Screen => ({Screen, location}) );
		let nextStack = [];
		let i = 0;
		let sameRoot = true;

		while( currentStack[i] || candidateStack[i] ){
			if( sameRoot && currentStack[i] && candidateStack[i] ){
				if( currentStack[i].Screen === candidateStack[i].Screen ){
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
