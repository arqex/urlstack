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
	{ path: '/simpleScreen', cb: 'PersonMoreInfo' },
	{ path: '/modal', cb: 'Modal', isModal: true },
	{ path: '*', cb: 'Welcome' }
];

function createRouter(){
	var r = urlstack( routes )
	r.start()
	return r
}

var router = createRouter()
describe( 'First test suite', function(){
  it('First test', function(){
		var router = createRouter()
		router.push('/tabs')
		console.log( window.location.href )
    expect(true).toBe(true)
  })
})