//////////////
// Route definition in routedata.js
//////////////

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

function tryLocations( router, done, states ){
	var i = 0;
	router.onChange( () => {
		var expected = states[i];
		if( !expected ) return;

		if( expected.mainStack ){
			tryLocationList( router.stack, expected.mainStack )
		}
		if( expected.modal ){
			tryLocationList( router.modal.stack, expected.modal )
		}
		if( expected.tabs ){
			tryLocationList( router.stack[0].tabs.stack, expected.tabs )
		}

		i++;
		if( i < states.length ){
			router.push( states[i].route )
		}
		else {
			done()
		}
	})
	
	router.push( states[i].route )
}

function tryLocationList( stack, locations ){
	locations.forEach( (location, i) => {
		if( !stack[i] ) return;

		['params', 'pathname', 'query', 'search', 'hash'].forEach( attr => {
			location[attr] && expect( location[attr] ).toEqual( stack[i].location[attr] );
		});
		['Screen', 'route', 'path'].forEach( attr => {
			location[attr] && expect( location[attr] ).toEqual( stack[i][attr] );
		});
	})
}

describe('Check locations', function(){
	it('all past routes should receive the new location', function( done ){
		let router = createRouter('/list')

		tryLocations( router, done, [
			{route: '/list/13', mainStack: [
				{ Screen: 'List screen', route: '/list', path: '/list', params: {id: '13'}, pathname: '/list/13'},
				{ Screen: 'List item', route: '/list/:id', path: '/list/13', params: {id: '13'}, pathname: '/list/13'},
			]},
			{route: '/list/13/moreInfo', mainStack: [
				{ Screen: 'List screen', route: '/list', path: '/list', params: {id: '13'}, pathname: '/list/13/moreInfo'},
				{ Screen: 'List item', route: '/list/:id', path: '/list/13', params: {id: '13'}, pathname: '/list/13/moreInfo'},
				{ Screen: 'List item moreinfo', route: '/list/:id/moreInfo', path: '/list/13/moreInfo', params: {id: '13'}, pathname: '/list/13/moreInfo'},
			]}
		])
	})

	
	it('future routes must not get updated locations', function( done ){
		let router = createRouter('/simpleScreen')

		tryLocations( router, done, [
			{route: '/list/13/moreInfo?foo=bar', mainStack: [
				{ Screen: 'List screen', route: '/list', path: '/list', params: {id: '13'}, pathname: '/list/13/moreInfo', query:{ foo: 'bar'}},
				{ Screen: 'List item', route: '/list/:id', path: '/list/13', params: {id: '13'}, pathname: '/list/13/moreInfo', query:{ foo: 'bar'}},
				{ Screen: 'List item moreinfo', route: '/list/:id/moreInfo', path: '/list/13/moreInfo', params: {id: '13'}, pathname: '/list/13/moreInfo', query:{ foo: 'bar'}},
			]},
			{route: '/list/13', mainStack: [
				{ Screen: 'List screen', route: '/list', path: '/list', params: {id: '13'}, pathname: '/list/13', query: {}},
				{ Screen: 'List item', route: '/list/:id', path: '/list/13', params: {id: '13'}, pathname: '/list/13', query: {}},
				{ Screen: 'List item moreinfo', route: '/list/:id/moreInfo', path: '/list/13/moreInfo', params: {id: '13'}, pathname: '/list/13/moreInfo', query:{ foo: 'bar'}},
			]},
			{route: '/list', mainStack: [
				{ Screen: 'List screen', route: '/list', path: '/list', params: {}, pathname: '/list', query: {}},
				{ Screen: 'List item', route: '/list/:id', path: '/list/13', params: {id: '13'}, pathname: '/list/13', query: {}},
				{ Screen: 'List item moreinfo', route: '/list/:id/moreInfo', path: '/list/13/moreInfo', params: {id: '13'}, pathname: '/list/13/moreInfo', query:{ foo: 'bar'}},
			]},
		])
	})
	
	it('modal navigation must not affect locations in the main stack', function(done){
		
		let router = createRouter('/list/13/moreInfo')
		tryLocations( router, done, [
			{route: '/list/13/moreInfo?foo=bar', mainStack: [
				{ Screen: 'List screen', route: '/list', path: '/list', params: {id: '13'}, pathname: '/list/13/moreInfo', query:{ foo: 'bar'}},
				{ Screen: 'List item', route: '/list/:id', path: '/list/13', params: {id: '13'}, pathname: '/list/13/moreInfo', query:{ foo: 'bar'}},
				{ Screen: 'List item moreinfo', route: '/list/:id/moreInfo', path: '/list/13/moreInfo', params: {id: '13'}, pathname: '/list/13/moreInfo', query:{ foo: 'bar'}},
			]},
			{
				route: '/modal',
				mainStack: [
					{ Screen: 'List screen', route: '/list', path: '/list', params: {id: '13'}, pathname: '/list/13/moreInfo', query:{ foo: 'bar'}},
					{ Screen: 'List item', route: '/list/:id', path: '/list/13', params: {id: '13'}, pathname: '/list/13/moreInfo', query:{ foo: 'bar'}},
					{ Screen: 'List item moreinfo', route: '/list/:id/moreInfo', path: '/list/13/moreInfo', params: {id: '13'}, pathname: '/list/13/moreInfo', query:{ foo: 'bar'}},
				],
				modal: [
					{ Screen: 'Modal', route: '/modal', params: {}, pathname: '/modal', query: {} }
				]}
			}
		])
	})
})