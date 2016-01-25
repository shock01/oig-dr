'use strict';
/**
* ignoreText will not work when appended to DOM because then the normalize method will not work
*/
describe('children', function() {
  var expect = chai.expect;
  var domRenderer;

  var /**Node*/ source;
  var /**Node*/ target;
  beforeEach(function() {
    domRenderer = new OIGDomRenderer();
    source = document.createElement('div');
    target = document.createElement('div');
  });
  it('should preserve text in elements', function() {
    var element = document.createElement('span');
    element.textContent = 'test';
    source.appendChild(element);
    this.result = domRenderer.render(source, target, {
      ignoreText: true
    });
    expect(target.isEqualNode(source)).to.equal(true);
  });
});
