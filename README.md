# oig-dr

[![Build Status](https://travis-ci.org/shock01/oig-dr.svg?branch=master)](https://travis-ci.org/shock01/oig-dr)

## Info

OIG DomRenderer updates a target DOMElement with the contents of a DOMElement or HTMLString

Uses DOMTreeWalker and isEqualNode extensively so will work (most probably) with IE9+

Is namespace aware so can also be used to render SVG Content or other namespace aware elements.

The first element (container element) should be of the same nodeType and nodeName (eg. both HTMLDivElements)


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
interface OIGDomRenderer

void render(source: element|string, target:element)
```

## Example
```
var domRenderer = new OIGDomRenderer();
var targetElement = document.createElement('div');
domRenderer.render(targetElement, '<div id="123"><span>hello world!</div>');
// this should change the targetElement to : '<div id="123"><span>hello world!</div>'
```




```
