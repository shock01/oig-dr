'use strict';

describe('selector', function() {
  var expect = chai.expect;
  var domRenderer;

  var /**Node*/ source;
  var /**Node*/ target;
  beforeEach(function() {
    domRenderer = new OIGDomRenderer();
    source = document.createElement('div');
    target = document.createElement('div');
  });

  it('should only change the element that matched the selector source and target selector', function() {
    source.innerHTML = '<div class="section"><h1>a node</h1></div>';
    target.innerHTML = '<div><span><div class="section"></div></span></div>';
    var expected = '<div><span><div class="section"><h1>a node</h1></div></span></div>';
    domRenderer.render(source, target, {
      sourceSelector: '.section',
      targetSelector: '.section'
    });
    target.normalize();
    expect(target.innerHTML).to.equal(expected);
  });

  it('should only change the element that matched the sourceSelector selector', function() {
    source.innerHTML = '<div class="section"><h1>a node</h1></div>';
    target.innerHTML = '<div><span><div class="section"></div></span></div>';
    this.result = domRenderer.render(source, target, {
      sourceSelector: '.section'
    });
    expect(this.result.outerHTML).to.equal(source.innerHTML);
  });

  it('should only change the element that matched the targetSelector selector', function() {
    source.innerHTML = '<p>Test</p>';
    target.innerHTML = '<div><span><div class="section"></div></span></div>';
    var expected = '<div><span><div><p>Test</p></div></span></div>';
    this.result = domRenderer.render(source, target, {
      targetSelector: '.section'
    });
    expect(target.innerHTML).to.equal(expected);
  });
});
