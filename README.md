# urlstack 

[![Build Status](https://travis-ci.org/arqex/urlstack.svg?branch=master)](https://travis-ci.org/arqex/urlstack) [![npm version](https://badge.fury.io/js/urlstack.svg)](http://badge.fury.io/js/urlstack)

A web app router for mobile apps, based on URLs. Not conventional uh?

* For web apps is not conventional because is not centered in the browser history but in the way that mobile apps handle screens in a stack. There is a main screen stack, an index that point to the current screen and nested stacks for tab screens.
* For mobile apps is not conventional because the screens are defined using URLs. URLs are used to navigate and it's possible to define path paramters and make use of URLs parameters too.

Those weird features make this router great to develop universal applications that need to work in the web and mobile, like the ones created using react-native and react-native-web.

**This package is still in an early state of development and very unstable. It's not recommended to use it on production apps yet.**

## Installation
```
npm install urlstack
```

## Usage
Routes are defined in an object, with the format used by [urlhub](https://github.com/arqex/urlhub):
```js
var routes = [
	{ path: '/tabs', cb: 'Tabs', isTabs: true, children: [
		{ path: '/tab1', cb: 'Tab1' },
		{ path: '/tab2', cb: 'Tab2' },
		{ path: '/tab3', cb: 'Tab3', children: [
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
```

Then we can start the urlstack:
```js
var urlstack = require('urlstack')
var router = urlstack( routes, {strategy: 'push'} )

// We can start listening to URL changes
router.onChange( (stack, activeIndex) => {
	// stack contains all the items already mounted,
	// the activeIndex points at the route matched by the current URL in the stack
})

// Or use the router to navigate
router.navigate('/modal')

```

## Is urlstack useful for me?
Urlstack is intended to create navigators for applications that might be used in web and mobile apps. We probably don't want to use it directly if we are creating a react-native-web app, we would want a navigator component instead, like [react-urlstack](https://github.com/arqex/react-urlstack(https://github.com) that uses urlstack internally.

If we are creating a navigator itself, then relying on a well tested universal router like urlstack sounds like a great idea!

## How does it work?
I recommend reading the [readme file of urlhub](https://github.com/arqex/urlhub/blob/master/readme.md) to understand the route structure and the location objects. There are a couple of additions to the route items:

* `isTabs`: When `true`, the children are not part of the main stack and navigating through them is made in an secondary stack.
* `isModal`: When `true`, showing that screen is not affecting the rest of the stack.

### Understanding stack and indexes

To be continued...

---

* [Changelog](CHANGELOG.md)
* [MIT Licensed](LICENSE)
