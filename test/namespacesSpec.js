'use strict';
describe('namespaces', function() {
  var expect = chai.expect;
  var domRenderer;

  var /**Node*/ source;
  var /**Node*/ target;
  beforeEach(function() {
    domRenderer = new OIGDomRenderer();
    source = document.createElement('div');
    target = document.createElement('div');
    source.ownerDocument.documentElement.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', 'http://www.w3.org/1999/xlink');
    target.ownerDocument.documentElement.setAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink', 'http://www.w3.org/1999/xlink');
  });
  it('should return same element when using namespaces', function() {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    source.appendChild(document.importNode(svg, true));
    this.result = domRenderer.render(source, target);
    expect(this.result.isEqualNode(source)).to.equal(true);
  });
  it('should return same element when namespaces differ', function() {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    source.appendChild(document.importNode(svg, true));
    // svg no namespace
    target.appendChild(document.createElement('svg'));
    this.result = domRenderer.render(source, target);
    expect(this.result.isEqualNode(source)).to.equal(true);
  });
  it('should add the namespace when target is missing namespaceURI', function() {
    source.ownerDocument.documentElement.removeAttributeNS('http://www.w3.org/2000/xmlns/', 'xmlns:xlink');
    source.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', 'dooh');
    target.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', 'yeah');
    this.result = domRenderer.render(source, target);
    expect(this.result.isEqualNode(source)).to.equal(true);
  });
  it('should update a namespaced attributes', function() {
    source.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', 'dooh');
    target.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', 'yeah');
    this.result = domRenderer.render(source, target);
    expect(this.result.isEqualNode(source)).to.equal(true);
  });
});
