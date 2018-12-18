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
	{ path: '/modal', cb: 'Modal', isModal: true, children: [
		{ path: '/child', cb: 'Modal child' }
	] },
	{ path: '/modalWithBackground', cb: 'Modal width background', isModal: true, backgroundRoute: '/list/12' },
	{ path: '/*', cb: 'Welcome' } 
];

if( typeof global !== 'undefined' ){
  module.exports = routes;
}
else {
  window.routes = routes;
}