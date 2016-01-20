describe('comments', function() {
  'use strict';
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
  it('should add comments', function() {
    var comment = document.createComment('test');
    source.appendChild(comment);
    this.result = domRenderer.render(source, target);
    expect(target.isEqualNode(source)).to.equal(true);
  });
  it('should remove comments', function() {
    var comment = document.createComment('test');
    target.appendChild(comment);
    this.result = domRenderer.render(source, target);
    expect(target.isEqualNode(source)).to.equal(true);
  });
  it('should change comments', function() {
    var sourceComment = document.createComment('hello');
    var targetComment = document.createComment('world')
    source.appendChild(sourceComment);
    target.appendChild(targetComment);
    this.result = domRenderer.render(source, target);
    expect(target.isEqualNode(source)).to.equal(true);
  });
  it('should ignore comments', function() {
    var sourceComment = document.createComment('hello');
    var targetComment = document.createComment('world');
    source.appendChild(sourceComment);
    target.appendChild(targetComment);
    this.result = domRenderer.render(source, target, {
      ignoreComments: true
    });
    expect(target.childNodes.length).to.equal(0);
  });
});
