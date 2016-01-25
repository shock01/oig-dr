'use strict';
describe('comments', function() {
  var expect = chai.expect;
  var domRenderer;

  var /**Node*/ source;
  var /**Node*/ target;
  beforeEach(function() {
    domRenderer = new OIGDomRenderer();
    source = document.createElement('div');
    target = document.createElement('div');
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
    var targetComment = document.createComment('world');
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
      flags: OIGDomRenderer.IGNORE_COMMENT
    });
    expect(target.childNodes.length).to.equal(0);
  });

  it('should ignore source comments', function() {
    var sourceComment = document.createComment('hello');
    source.appendChild(sourceComment);
    this.result = domRenderer.render(source, target, {
      flags: OIGDomRenderer.IGNORE_COMMENT
    });
    expect(target.childNodes.length).to.equal(0);
  });

  it('should ignore target comments', function() {
    var targetComment = document.createComment('world');
    target.appendChild(targetComment);
    this.result = domRenderer.render(source, target, {
      flags: OIGDomRenderer.IGNORE_COMMENT
    });
    expect(target.childNodes.length).to.equal(0);
  });
});
