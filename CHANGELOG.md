# v0.6.0
* Tabs stack are now always prefilled even if some tabs has not been visited
* Adds visited attribute to the tab items

# v0.5.1
* Node strategy is set checking the document object instead the window one, in order to make it work in react-native.

# v0.5.0
* Urlstack now working in node environments (react-native).
* Added tests for node environment.

# v0.4.0
* Location objects are working ok, tests added for it.

# v0.3.0
* Modal stacks are working now
* Modal stacks can be recursive
* All stacks have the format `{stack, activeIndex}`
* Added more tets

# v0.2.0
* Future screens are unmounted now when the current screen don't share the pathname with the preview one.
* Adds routePath to the stack item.
* Fixes merge of routes.
* Adds tests.
* First version of the readme.
* Adds build.

# v0.1.1
* Fixes router exports

# v0.1.0
* First public version. Even if the code for the navigator is still in here, it will be a stack router.