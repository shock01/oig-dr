describe('structure', function() {
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

  function test(title, setUp) {
    it(title + ', deep:true(default)', function() {
      setUp();
      this.result = domRenderer.render(source, target);
      expect(target.isEqualNode(source)).to.equal(true);
    })
    it(title + ', deep:false', function() {
      setUp();
      this.result = domRenderer.render(source, target, {
        deep: false
      });
      expect(target.isEqualNode(source)).to.equal(true);
    })
  }
  it('should return the same element', function() {
    domRenderer.render(source, target);
    expect(target.isEqualNode(source)).to.equal(true);
  });
  it('should return the same element when source is passed as text', function() {
    this.result = domRenderer.render(source.outerHTML, target);
    expect(target.isEqualNode(source)).to.equal(true);
  });
  it('should return the same element when source element has different nodeName', function() {
    this.source = document.createElement('span');
    this.result = domRenderer.render(source, target);
    expect(target.isEqualNode(source)).to.equal(true);
  });
  // deep and non-deep tests
  test('should return the same element when first element is textnode', function() {
    source.appendChild(document.createElement('div'));
    var textNode = document.createTextNode('test');
    textNode.nodeValue = '123';
    source.firstChild.appendChild(textNode);
  });
  test('should add the text', function() {
    source.textContent = 'hello';
  });
  test('should remove the text', function() {
    target.textContent = 'hello';
  });
  test('should change the text', function() {
    source.textContent = 'hello';
    target.textContent = 'goodbye';
  });
  test('should add childNode', function() {
    source.appendChild(document.createElement('span'));
  });
  test('should remove childNode', function() {
    target.appendChild(document.createElement('span'));
  });
  test('should add all nodes for one level nested structure', function() {
    addElements(source, 'span', 5);
  });
  test('should remove all nodes for one level nested structure ', function() {
    addElements(target, 'span', 5);
  });
  test('should update all nodes for one level nested structure', function() {
    addElements(target, 'span', 5);
    addElements(source, 'span', 5, 10);
  });
  test('should add all new nodes for one level nested structure ', function() {
    addElements(source, 'span', 5);
    addElements(target, 'span', 1);
    target.appendChild(document.createElement('span'));
  });
  test('should replace all new nodes for one level nested structure ', function() {
    addElements(source, 'span', 5);
    addElements(target, 'div', 5);
    target.appendChild(document.createElement('span'));
  });
  test('should return same structure for two level nested structure ', function() {
    addElements(source, 'span', 2, 1);
    addElements(source.firstChild, 'span', 1, 2);
  });
  test('should return same structure for nested structure ', function() {
    source.innerHTML = '<div id="1_0"><div id="2_0"><div id="3_0"></div></div></div>';
    target.innerHTML = '<div id="1_0"></div><div id="2_0"></div>';
  });
});
