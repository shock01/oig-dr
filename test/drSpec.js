// TODO diff with Comment nodes
// TODO HTMLElement properties which cannot be set by document object model
// TODO performance using documentFragment when there is no source node
// TODO element namespaces (SVG)
// TODO maintain / preserve handlers (removeall / replace might break javascript handlers)
describe('OIGDomRenderer', function() {
  'use strict';
  var expect = chai.expect;
  var domRenderer;

  function addElements(node, nodeName, count, start) {
    for (var i = 0; i < count; i++) {
      var span = node.ownerDocument.createElement(nodeName);
      span.setAttribute('id', 'span_' + (typeof start === 'number' ? start + '_' + i : i));
      node.appendChild(span);
    }
  }

  var /**Node*/ source;
  var /**Node*/ target;
  beforeEach(function() {
    domRenderer = new OIGDomRenderer();
    source = document.createElement('div');
    target = document.createElement('div');
  });

  beforeEach(function() {
    console.groupCollapsed(this.currentTest.title);
  });

  afterEach(function() {
    console.log('source outerHTML');
    console.debug(source.outerHTML);
    console.log('target outerHTML');
    console.debug(target.outerHTML);
    console.groupEnd();
  });

  it('should return the same element when first element is textnode', function() {
    source.appendChild(document.createElement('div'));
    var textNode = document.createTextNode('test');
    textNode.nodeValue = '123';
    source.firstChild.appendChild(textNode);
    source.firstChild.appendChild(document.createElement('div'));
    var result = domRenderer.render(source, target);
    expect(target).to.equal(result);
  });
  it('should return the same element', function() {
    var result = domRenderer.render(source, target);
    expect(target).to.equal(result);
  });
  it('should return the same element when source is passed as text', function() {
    var result = domRenderer.render(source.outerHTML, target);
    expect(target).to.equal(result);
  });
  it('should add attribute', function() {
    source.setAttribute('test', 'test');
    var result = domRenderer.render(source, target);
    expect(target.isEqualNode(source)).to.equal(true);
  });
  it('should remove attribute', function() {
    target.setAttribute('test', 'test');
    var result = domRenderer.render(source, target);
    expect(target.isEqualNode(source)).to.equal(true);
  });
  it('should change attribute', function() {
    source.setAttribute('test', 'test1');
    target.setAttribute('test', 'test2');
    var result = domRenderer.render(source, target);
    expect(target.isEqualNode(source)).to.equal(true);
  });
  it('should add the text', function() {
    source.textContent = 'hello';
    var result = domRenderer.render(source, target);
    expect(target.isEqualNode(source)).to.equal(true);
  });
  it('should remove the text', function() {
    target.textContent = 'hello';
    var result = domRenderer.render(source, target);
    expect(target.isEqualNode(source)).to.equal(true);
  });
  it('should change the text', function() {
    source.textContent = 'hello';
    target.textContent = 'goodbye';
    var result = domRenderer.render(source, target);
    expect(target.isEqualNode(source)).to.equal(true);
  });
  it('should add childNode', function() {
    source.appendChild(document.createElement('span'));
    var result = domRenderer.render(source, target);
    expect(target.isEqualNode(source)).to.equal(true);
  });
  it('should remove childNode', function() {
    target.appendChild(document.createElement('span'));
    var result = domRenderer.render(source, target);
    expect(target.isEqualNode(source)).to.equal(true);
  });
  it('should update attribute of childNode', function() {
    var child = document.createElement('span');
    child.setAttribute("test", "test");
    source.appendChild(child);
    target.appendChild(document.createElement('span'));
    var result = domRenderer.render(source, target);
    expect(target.isEqualNode(source)).to.equal(true);
  });
  it('should add all nodes for one level nested structure', function() {
    addElements(source, 'span', 5);
    var result = domRenderer.render(source, target);
    expect(target.isEqualNode(source)).to.equal(true);
  });
  it('should remove all nodes for one level nested structure ', function() {
    addElements(target, 'span', 5);
    var result = domRenderer.render(source, target);
    expect(target.isEqualNode(source)).to.equal(true);
  });
  it('should update all nodes for one level nested structure', function() {
    addElements(target, 'span', 5);
    addElements(source, 'span', 5, 10);
    var result = domRenderer.render(source, target);
    expect(target.isEqualNode(source)).to.equal(true);
  });
  it('should add all new nodes for one level nested structure ', function() {
    addElements(source, 'span', 5);
    addElements(target, 'span', 1);
    target.appendChild(document.createElement('span'));
    var result = domRenderer.render(source, target);
    expect(target.isEqualNode(source)).to.equal(true);
  });
  it('should replace all new nodes for one level nested structure ', function() {
    addElements(source, 'span', 5);
    addElements(target, 'div', 5);
    target.appendChild(document.createElement('span'));
    var result = domRenderer.render(source, target);
    expect(target.isEqualNode(source)).to.equal(true);
  });
  it('should return same structure for two level nested structure ', function() {
    addElements(source, 'span', 2, 1);
    addElements(source.firstChild, 'span', 1, 2);
    var result = domRenderer.render(source, target);
    expect(target.isEqualNode(source)).to.equal(true);
  });
  it('should return same structure when changing attribute for two level nested structure', function() {
    addElements(source, 'span', 2, 1);
    addElements(source.firstChild, 'span', 1, 2);
    source.firstChild.firstChild.setAttribute('la', 'la');
    var result = domRenderer.render(source, target);
    expect(target.isEqualNode(source)).to.equal(true);
  });
  it('should return same structure for nested structure ', function() {
    source.innerHTML = '<div id="1_0"><div id="2_0"><div id="3_0"></div></div></div>';
    target.innerHTML = '<div id="1_0"></div><div id="2_0"></div>';
    var result = domRenderer.render(source, target);
    expect(target.isEqualNode(source)).to.equal(true);
  });
  it('should return same structure when changing attribute for nested structure ', function() {
    addElements(source, 'span', 2, 1);
    addElements(source.firstChild, 'span', 1, 2);
    source.firstChild.firstChild.setAttribute('la', 'la');
    var result = domRenderer.render(source, target);
    expect(target.isEqualNode(source)).to.equal(true);
  });
  it('should return same element when using namespaces', function() {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    source.appendChild(document.importNode(svg, true));
    var result = domRenderer.render(source, target);
    expect(target.isEqualNode(source)).to.equal(true);
  });
  // this fails because it breaks on UnknownHTMLElement (IE 11)
  xit('should return same element when namespaces differ', function() {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    source.appendChild(document.importNode(svg, true));
    // svg no namespace
    target.appendChild(document.createElement('svg'));
    var result = domRenderer.render(source, target);
    expect(target.isEqualNode(source)).to.equal(true);
  });
  it('should return same attributes when using namespaces', function() {
    var child = document.createElement('div');
    source.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', 'http://www.w3.org/1999/xlink');
    child.setAttributeNS('http://www.w3.org/1999/xlink', 'href', 'dooh')
    source.appendChild(child);
    var result = domRenderer.render(source, target);
    expect(target.isEqualNode(source)).to.equal(true);
  });
});
