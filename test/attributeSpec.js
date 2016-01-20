describe('attributes', function() {
  'use strict';
  var expect = chai.expect;
  var domRenderer;

  var /**Node*/ source;
  var /**Node*/ target;
  beforeEach(function() {
    domRenderer = new OIGDomRenderer();
    source = this.source = document.createElement('div');
    target = this.target = document.createElement('div');
  });
  it('should add attribute', function() {
    console.log('before', target.outerHTML)
    source.setAttribute('test', 'test');
    this.result = domRenderer.render(source, target);
    expect(target.isEqualNode(source)).to.equal(true);
  });
  it('should remove attribute', function() {
    target.setAttribute('test', 'test');
    this.result = domRenderer.render(source, target);
    expect(target.isEqualNode(source)).to.equal(true);
  });
  it('should change attribute', function() {
    source.setAttribute('test', 'test1');
    target.setAttribute('test', 'test2');
    this.result = domRenderer.render(source, target);
    expect(target.isEqualNode(source)).to.equal(true);
  });
  it('should update attribute of childNode', function() {
    var child = document.createElement('span');
    child.setAttribute("test", "test");
    source.appendChild(child);
    target.appendChild(document.createElement('span'));
    this.result = domRenderer.render(source, target);
    expect(target.isEqualNode(source)).to.equal(true);
  });
  it('should return same structure when changing attribute for nested structure ', function() {
    addElements(source, 'span', 2, 1);
    addElements(source.firstChild, 'span', 1, 2);
    source.firstChild.firstChild.setAttribute('la', 'la');
    this.result = domRenderer.render(source, target);
    expect(target.isEqualNode(source)).to.equal(true);
  });
  it('should return same attributes when using namespaces', function() {
    var child = document.createElement('div');
    child.setAttributeNS('http://www.w3.org/1999/xlink', 'xlink:href', 'dooh')
    source.appendChild(child);
    this.result = domRenderer.render(source, target);
    expect(target.isEqualNode(source)).to.equal(true);
  });
});
