# oig-dr

[![Build Status](https://travis-ci.org/shock01/oig-dr.svg?branch=master)](https://travis-ci.org/shock01/oig-dr)
[![Coverage Status](https://coveralls.io/repos/github/shock01/oig-dr/badge.svg?branch=master&unique123)](https://coveralls.io/github/shock01/oig-dr?branch=master)


## Info

> OIG DomRenderer updates a target DOMElement with the contents of a DOMElement or HTMLString
> Uses isEqualNode extensively so will work (most probably) with IE9+
> Is namespace aware so can also be used to render SVG Content or other namespace aware elements.

OIG DOMRenderer takes an optional options argument with the following properties
- **sourceSelector** - CSS Selector to specify the root sourceElement
- **targetSelector** - CSS Selector to specify the root targetElement

- **flags** number

## flags
- OIGDomRenderer.IGNORE_COMMENT - will not parse comments from sourceElement and will remove comments from targetElement
- OIGDomRenderer.IGNORE_TEXT - will not parse comments and will not parse elements for textNodes. Only direct textContent will be added to targetElement
- OIGDomRenderer.USE_FRAGMENT - will use documentFragments for appending new elements to the targetElement or it's children
##

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
property number flags
interface OIGDomRenderer
void render(source: element|string, target:element, options?: Options)
```

## Example
```
var domRenderer = new OIGDomRenderer();
var targetElement = document.createElement('div');
domRenderer.render('<div id="123"><span>hello world!</div>', targetElement);
// this should change the targetElement to : '<div id="123"><span>hello world!</div>'
```

## Example ignoring comments in source
```
var domRenderer = new OIGDomRenderer();
var targetElement = document.createElement('div');
domRenderer.render('<div id="123"><!--test--><span>hello world!</div>', targetElement, {flags: OIGDomRenderer.IGNORE_TEXT});
// this should change the targetElement to : '<div id="123"><span>hello world!</div>'
```

## Example ignoring comments in source and using document fragment
```
var domRenderer = new OIGDomRenderer();
var targetElement = document.createElement('div');
domRenderer.render('<div id="123"><!--test--><span>hello world!</div>', targetElement, {flags: OIGDomRenderer.IGNORE_TEXT | OIGDomRenderer.USE_FRAGMENT});
// this should change the targetElement to : '<div id="123"><span>hello world!</div>'
```

## Example ignoring comments in target
```
var domRenderer = new OIGDomRenderer();
var targetElement = document.createElement('div');
targetElement.appendChild(document.createTextNode('a comment'));
domRenderer.render('<div id="123"><span>hello world!</div>', targetElement, {flags: OIGDomRenderer.IGNORE_COMMENT});
// this should change the targetElement to : '<div id="123"><span>hello world!</div>'
```


## Example using target and sourceSelector
```
var domRenderer = new OIGDomRenderer();
var targetElement = document.createElement('div');
target.innerHTML = '<div class="container"><div class="content"></div></div><footer>some footer</footer>';

domRenderer.render('<div class="content"><span>hello world!</div>', targetElement, {
  sourceSelector: '.content',
  targetSelector: '.content'
  });
// this should change the targetElement to : '<div class="container"><div class="content"><span>hello world!</div></div><footer>some footer</footer>'
```

## Example doing a partial SVG update with namespaced attribute
```
<svg xmlns:xlink="http://www.w3.org/1999/xlink">
  <use/>
</svg>

var domRenderer = new OIGDomRenderer();
var targetElement = document.querySelector('svg');
var source = '<use xlink:href="#test">';

domRenderer.render(source, targetElement, {
  targetSelector: 'use'
  });
// this should change the targetElement to :
<svg xmlns:xlink="http://www.w3.org/1999/xlink">
  <use xlink:href="#test"/>
</svg>

```
