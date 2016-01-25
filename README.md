# oig-dr

[![Build Status](https://travis-ci.org/shock01/oig-dr.svg?branch=master)](https://travis-ci.org/shock01/oig-dr)
[![Coverage Status](https://coveralls.io/repos/github/shock01/oig-dr/badge.svg?branch=master&unique)](https://coveralls.io/github/shock01/oig-dr?branch=master)


## Info

> OIG DomRenderer updates a target DOMElement with the contents of a DOMElement or HTMLString
> Uses isEqualNode extensively so will work (most probably) with IE9+
> Is namespace aware so can also be used to render SVG Content or other namespace aware elements.

OIG DOMRenderer takes an optional options argument with the following properties
- **ignoreComments** (default false) - Will remove any comments while rendering from target and skips comments from source
- **deep** (default true) - When set to true equality of nodes is tested on the element itself and not on it's complete subtree. Each child in the subtree will be parsed again to be able to maintain properties/handlers on elements that have not changed from target to source. If uniqueness of elements is not required it's better to use deep:false for performance reasons
- **useFragment** (default true) - When set to true will use documentFragments to append multiple childs at once to limit browser repaints/reflows
- **ignoreText** (default false) - When set will ignore comments and textNode but will set text when node contains no element nodes. Uses .children instead of .childNodes which is much faster

## To run

- use: npm run test-server to start a server on localhost:3000 that will run the mocha spec
- use: npm test to run headless tests using mocha-phantomjs

## Rendering Performance / Example

- Changes an SVG into the glorious SVG tiger
- Uses morphdom large fixture as comparison

- use npm run test-server
- open browser http://localhost:3000/performance.html

## API
```
interface Options
property boolean ignoreComments default false
property boolean deep default true
property boolean useFragment default false
property boolean ignoreText default false
interface OIGDomRenderer
void render(source: element|string, target:element, options?: Options)
```

## Example
```
var domRenderer = new OIGDomRenderer();
var targetElement = document.createElement('div');
domRenderer.render(targetElement, '<div id="123"><span>hello world!</div>');
// this should change the targetElement to : '<div id="123"><span>hello world!</div>'
```

## Example ignoring comments in source
```
var domRenderer = new OIGDomRenderer();
var targetElement = document.createElement('div');
domRenderer.render(targetElement, '<div id="123"><!--test--><span>hello world!</div>', {ignoreComment: true});
// this should change the targetElement to : '<div id="123"><span>hello world!</div>'
```

## Example ignoring comments in target
```
var domRenderer = new OIGDomRenderer();
var targetElement = document.createElement('div');
targetElement.appendChild(document.createTextNode('a comment'));
domRenderer.render(targetElement, '<div id="123"><span>hello world!</div>', {ignoreComment: true});
// this should change the targetElement to : '<div id="123"><span>hello world!</div>'
```




```
