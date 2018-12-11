//////////////
// Route definition
//////////////
var routes = [
	{ path: '/tabs', cb: 'Tabs', isTabs: true, children: [
		{ path: '/tab1', cb: 'Tab 1' },
		{ path: '/tab2', cb: 'Tab 2' },
		{ path: '/tab3', cb: 'Tab 3', children: [
			{ path: '/:id', cb: 'Tab 3 details', children: [
				{ path: '/modal', cb: 'Tab Modal', isModal: true },
				{ path: '/moreInfo', cb: 'Tab 3 moreinfo' },
			]}
		]}
	]},
	{ path: '/list', cb: 'List screen', children: [
		{path: '/:id', cb: 'List item', children: [
			{path: '/moreInfo', cb: 'List item moreinfo' }
		]}
	]},
	{ path: '/simpleScreen', cb: 'Simple screen' },
	{ path: '/modal', cb: 'Modal', isModal: true },
	{ path: '/*', cb: 'Welcome' }
];

//////////////////
// HELPERS
/////////////////
var r;
function createRouter( initialRoute ){
	r && r.stop();
	r = urlstack( routes );
	r.push( initialRoute );
	r.start();
	return r;
}

function tryStacks( router, done, states ){
	var i = 0;
	router.onChange( () => {
		var expected = states[i];
		if( !expected ) return;

		expect( router.stack.length ).toBe( expected.length );
		expect( router.activeIndex ).toBe( expected.activeIndex );
		expect( router.stack[ router.activeIndex ].Screen ).toBe( expected.screen );

		i++;
		if( i < states.length ){
			router.push( states[i].route )
		}
		else {
			done()
		}
	});
	router.push( states[i].route )
}


/////////////
// TEST CASES
/////////////
describe( 'Router start and stop', function(){
  it('Stopped router shouldn´t call the listeners', function( done ){
		var router = createRouter('/tabs')
		var callCount = 0

		
		// Urlhub push method is asynchronous, let add a listener to the change event
		router.onChange( () => {
			var stack = router.stack;
			expect( stack.length ).toBe( 1 )
			expect( stack[0].Screen ).toBe('Simple screen')

			callCount++;

			router.stop();

			router.push('/modal');
			setTimeout( () => {
				// the listener had to be called just once, because we stopped the router
				expect(callCount).toBe(1);
				done()
			}, 50 )
		})
		
		router.push('/simpleScreen');
	})
	
	it('Default route is defined with /*', function( done ){
		var router = createRouter('/nonExistent')
		
		expect( router.stack.length ).toBe( 1 )
		expect( router.stack[0].Screen ).toBe('Welcome')

		tryStacks( router, done, [
			{ route: '/simpleScreen', length: 1, activeIndex: 0, screen: 'Simple screen' },
			{ route: '/somethingUnknown', length: 1, activeIndex: 0, screen: 'Welcome' }
		]);
	})
})


describe( 'Stack tests', function() {
	it('Start router returns a initial stack with one screen', function(){
		var router = createRouter( '/list' );
		var stack = router.stack
		
		expect( stack.length ).toBe( 1 )
		expect( router.activeIndex ).toBe( 0 )
		expect( stack[0].Screen ).toBe('List screen')
	})

	it('Pushing routes should keep screens if we are in the same stack', function( done ){
		var router = createRouter('/list')

		tryStacks( router, done, [
			{ route: '/list/12', length: 2, activeIndex: 1, screen: 'List item' },
			{ route: '/list/12/moreInfo', length: 3, activeIndex: 2, screen: 'List item moreinfo'},
			{ route: '/list/12', length: 3, activeIndex: 1, screen: 'List item' },
			{ route: '/list/13', length: 2, activeIndex: 1, screen: 'List item' },
			{ route: '/list/13/moreInfo', length: 3, activeIndex: 2, screen: 'List item moreinfo'} ,
			{ route: '/list', length: 3, activeIndex: 0, screen: 'List screen'} 
		]);
	})

	it('Creating the router with a child URL should mount the full stack', function() {
		var router = createRouter('/list/10/moreInfo')
		expect( router.stack.length ).toBe( 3 );
		expect( router.activeIndex ).toBe( 2 );
		expect( router.stack[0].Screen ).toBe( 'List screen' );
		expect( router.stack[1].Screen ).toBe( 'List item' );
		expect( router.stack[2].Screen ).toBe( 'List item moreinfo' );
	})

	it('Pushing routes with different roots should unmount the stacks', function( done ){
		var router = createRouter('/unknown')

		tryStacks( router, done, [
			{ route: '/list/9', length: 2, activeIndex: 1, screen: 'List item' },
			{ route: '/simpleScreen', length: 1, activeIndex: 0, screen: 'Simple screen' },
			{ route: '/list/13/moreInfo', length: 3, activeIndex: 2, screen: 'List item moreinfo'}
		])
	})
})


describe('Tab stack tests', function(){
	it('Loading the main tab URL should load the first tab', function(){
		var router = createRouter('/tabs')
		var mainStack = router.stack;
		var stackItem = mainStack[ router.activeIndex ]
		expect( mainStack.length ).toBe( 1 )
		expect( stackItem.Screen ).toBe('Tabs')
		expect( stackItem.tabs.stack.length ).toBe( 1 )
		expect( stackItem.tabs.stack[ stackItem.tabs.index ].Screen  ).toBe('Tab 1')
	})
	
	it('Loading a tab that is not the first should only load that tab', function(){
		var router = createRouter('/tabs/tab2')
		var mainStack = router.stack;
		var stackItem = mainStack[ router.activeIndex ]
		expect( mainStack.length ).toBe( 1 )
		expect( stackItem.Screen ).toBe('Tabs')
		expect( stackItem.tabs.stack.length ).toBe( 1 )
		expect( stackItem.tabs.stack[ stackItem.tabs.index ].Screen  ).toBe('Tab 2')
	})
})
