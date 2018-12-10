var routes = [
	{ path: '/tabs', cb: 'Tabs', isTabs: true, children: [
		{ path: '/tab1', cb: 'Tab1' },
		{ path: '/tab2', cb: 'Tab2' },
		{ path: '/tab3', cb: 'Tab3', children: [
			{ path: '/:id', cb: 'PersonDetails', children: [
				{ path: '/modal', cb: 'Modal', isModal: true },
				{ path: '/moreInfo', cb: 'PersonMoreInfo' },
			]}
		]}
	]},
	{ path: '/list', cb: 'PersonList', children: [
		{path: '/:id', cb: 'PersonDetails', children: [
			{path: '/moreInfo', cb: 'PersonMoreInfo' }
		]}
	]},
	{ path: '/simpleScreen', cb: 'Simple screen' },
	{ path: '/modal', cb: 'Modal', isModal: true },
	{ path: '/*', cb: 'Welcome' }
];

function createRouter(){
	var r = urlstack( routes )
	r.start()
	return r
}

var router = createRouter()
describe( 'Router start and stop', function(){
  it('Stopped router shouldn´t call the listeners', function( done ){
		var router = createRouter()
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
})