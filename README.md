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
	{ path: '/modalWithBackground', cb: 'Modal width background', isModal: true, backgroundRoute: '/list/12' },
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
Urlstack is intended to create navigators for applications that might be used in web and mobile phones. You probably don't want to use it directly if we are creating a react-native-web app, it's a better idea to use a navigator component instead, like [react-urlstack](https://github.com/arqex/react-urlstack) that uses urlstack internally.

If you are creating a navigator itself, then relying on a well tested universal router like urlstack sounds like a great idea!

## How does it work?
Navigating with urlstack is more or less restricted by the way the routes are defined. As a starting point let's take the [route definition above](#usage) and show what happens when we navigate.

### Basic navigation through the stack
Imagine we start in the route `/list`, our router object will have 2 properties that will define the current stack and index

```js
router.stack // [ data for route /list ]
router.activeIndex // 0
```

Our stack will have 1 element, the first route data for `/list`, and the `activeIndex` will be pointing to the only route in the stack. If you are interested in what data is stored for every item in the stack you can have a look at the [stack item definition](#stack-item-data).

If we navigate to a child route we are adding screens to the stack. Let's `router.navigate('/list/10')`, and see how our router properties have changed:

```js
router.stack // [ /list, /list/10 ]
router.activeIndex // 1
```

We can continue navigating in the stack by `router.navigate('/list/10/moreInfo')`:
```js
router.stack // [ /list, /list/10, /list/10/moreInfo ]
router.activeIndex // 2
```

As we can see, the `activeIndex` is always pointing to the last location we navigated to. So far we just have been adding routes to the stack, but what happens if we `router.navigate('/list/10')` again?:
```js
router.stack // [ /list, /list/10, /list/10/moreInfo ]
router.activeIndex // 1
```

The route `/list/10/moreInfo` didn't get out of the stack, we just get an update in the `activeIndex`. This ability of not unmounting routes will allow our application to generate nice animations for route transitions, without drastically see our components dissapear from the screen.

This stack behavior has not unmounted any screen yet because we have been navigating in one branch of the route definition, but if we get a bit out of the hierarchy using `router.navigate('/list/12')` we get:
```js
router.stack // [ /list, /list/12  ]
router.activeIndex // 1
```

We got rid of `/list/10/moreInfo` because it wasn't a child of `/list/12`. We can see even a bigger unmounting of routes if we do `router.navigate('/simpleScreen')`:
```js
router.stack // [ /simpleScreen ]
router.activeIndex // 0
```

### Stack item data
The attribute `stack` in the router contains all what's needed to render our app contents. Let's start our router with `/list/32/moreInfo?foo=bar`, our `stack` will have 3 routes mounted and our `activeIndex` will be pointing to the last of them. The data stored in one of those routes is the following:
```js
console.log( router.stack[2] )
{
	Screen: "List item moreinfo", // This is how we defined `cb` for /list/:id/moreInfo
	isModal: false, // it's not a modal screen
	isTabs: false, // it's not a tab screen
	key: "j1su0", // A random genereated key
	location: {
		matches: ["List screen", "List item", "List item moreinfo"],
		matchIds: ["/list", "/list/:id", "/list/:id/moreinfo"],
		pathname: "/list/32/moreInfo",
		search: "?foo=bar",
		query: {foo: "bar"},
		params: {id: "32"},
		hash: ""
	}
	path: "/list/32/moreInfo"
	route: "/list/:id/moreInfo"
}
```

Important parts of this object:
* `Screen` is the `cb` attribute defined in the route. It is usually a calback function that render the content, or a React component, or whatever we want get whenever we hit the current route.
* `key` is an identifier. It won't change while the route is mounted in the stack.
* `location` the current route parsed. It matches the result of parsing the current URL in the browser only if the route position in the `stack` is lower or equals than the `activeIndex`. For screens placed after the `activeIndex`, the location object will contain the data of the route that mounted the screen.

Tab routes have another attribute called `tabs` that contains information for a second navigation system:
```js
{
	//...all the properties above
	tabs: {
		activeIndex: 0,
		stack: [ {/*some route data*/} ]
	}
}
```

We didn't talk about tab navigation yet, it will make more sense after reading the following section.

### Tab navigation
When we use tabs in an app we want to show different contents without leaving the current screen, the one showing the tabs. Navigating among tabs really doesn't affect to the main stack. Let's see what we have if we do `router.navigate('/tabs/tab2')`:
```js
// We only have one screen in the stack
router.stack // [ /tabs ]
router.activeIndex // 0

// The tab screen is in a different place
let tabs = router.stack[0].tabs
tabs.stack // [ /tab1, /tab2, /tab3 ]
router.activeIndex // 1
```

The `tabs` property of a route has the same attributes than the router to make us easier to remember them. However the `stack` is not really a stack, it's rather an array, fully loaded, where we can move forward and back. If we call `router.navigate('/tabs/tab1')` we get the following result:
```js
// We only have one screen in the stack
router.stack // [ /tabs ]
router.activeIndex // 0

// The tab screen is in a different place
let tabs = router.stack[0].tabs
tabs.stack // [ /tab1, /tab2, /tab3 ]
router.activeIndex // 0
```

The stack is a simple list of screens that respects the order of the route definition that will make easier any transition animation between tab contents.

If we navigate to a child route of a tab one, that route affects again to the main stack. Let's call `router.navigate('/tabs/tab3/ef36a0')` and we will get:
```js
router.stack // [ /tabs, /tabs/tab3/ef36a0 ]
router.activeIndex // 1

// The tab screen is in a different place
let tabs = router.stack[0].tabs
tabs.stack // [ /tab1, /tab2, /tab3 ]
router.activeIndex // 2
```

It looks counterintuitive but it makes sense if we think about a mobile app that has a tab screen and in one tab there is a list of items that we can tap to see details. When we tap on an item, we move away from the tabs and continue to see the item details info.

In the route objects within a tab stack there is only one that have the `location` up to date, the one that is pointed by the tab's `activeIndex`. Any other route in there will keep the location object they received when they were mounted.

Tabs screen are just containers for other screens. Even if we can navigate to the route of the tab container, like `/tabs` it makes not much sense to show the tabs and no content, so urlstack will load the first tab automatically.

### Modals
Another common way of showing information that urlstack handles is the usage of modals. Modals are a way of showing content in top of the current screen. A modal shouldn't mess with the main stack, but modal screens should also have their own URL to be referenced, that's why we need to handle them inside of urlstack.

Let's start the examples using the route `/tabs/tab3/ef36a0` and then call `router.navigate('/modal')`. What happened inside of our router?
```js
// Our main stack
router.stack // [ /tabs, /tabs/tab3/ef36a0 ]
router.activeIndex // 1

// We are using tabs, so we have also some route information there
let tabs = router.stack[0].tabs
tabs.stack // [ /tab3 ]
router.activeIndex // 0

// And the modal data is in another place too
let modal = router.modal
modal.active // true
modal.stack // [ /modal ]
modal.activeIndex // 0
```

Modals have their own stack (a real one, not like the tabs), they can have children routes and we can navigate inside the modals. We can even have modals inside modals, but do we really want that?

If we close the modal, we are get just seeing the main stack again. We achieve that by `router.navigate('/tabs/tab3/ef36a0') and our route data will remain very similar:
```js
let modal = router.modal
modal.active // false <<<<<<<<<<<<<< this is the only change

// Our main stack
router.stack // [ /tabs, /tabs/tab3/ef36a0 ]
router.activeIndex // 1

// We are using tabs, so we have also some route information there
let tabs = router.stack[0].tabs
tabs.stack // [ /tab3 ]
router.activeIndex // 0

// And the rest of the modal data stays the same
modal.stack // [ /modal ]
modal.activeIndex // 0
```

Modals are used to show temporary information and we always finish up closing them, and that takes us to one question... what if we start the router with a modal url and we close it? What do we see in these cases?

Urlstack allow to define a default route be loaded in the main stack along with the modal route, this way we are sure about what the user will see when the modal get closed. If we start the router with `/modalWithBackground`, in the definition we can see `backgroundRoute: '/list/12'`, so that route will be loaded in this case. (Note that if we already had a stack loaded, that won't be replaced by the `backgroundRoute`).
```js
// Our main stack
router.stack // [ /list/12 ]
router.activeIndex // 0

// Our modal stack
let modal = router.modal
modal.active // true
modal.stack // [ /modalWithBackground ]
modal.activeIndex // 0
```

If we don't define a `backgroundRoute` urlstack will load the default route in the main stack. We always need some content for when the modal gets closed. If we start the router in `/modal`:
```js
// Our main stack
router.stack // [ /* ]
router.activeIndex // 0

// Our modal stack
let modal = router.modal
modal.active // true
modal.stack // [ /modal ]
modal.activeIndex // 0
```

One last thing about modal routes: they can be children of others. It's something that at a first sight makes not much sense, but it allows to access to the URL parameters of the parent. Let's load `/tabs/tab3/ef36a0/modal`:
```js
// Our main stack
router.stack // [ /tabs, /tabs/tab3/ef36a0 ]
router.activeIndex // 1

// We are using tabs, so we have also some route information there
let tabs = router.stack[0].tabs
tabs.stack // [ /tab1, /tab2, /tab3 ]
router.activeIndex // 2

// And the modal data is in another place too
let modal = router.modal
modal.active // true 
modal.stack // [ /tabs/tab3/ef36a0/modal ]
modal.activeIndex // 0

// We have access to the URL parameters from the modal screen
modal.stack[0].location.params // {id: "ef36a0"}
```

Looks like an edge case, but it's not difficult to want to edit the details of that tab screen inside of a modal.

---

* [Changelog](CHANGELOG.md)
* [MIT Licensed](LICENSE)
