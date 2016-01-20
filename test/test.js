
function addElements(node, nodeName, count, start) {
  for (var i = 0; i < count; i++) {
    var span = node.ownerDocument.createElement(nodeName);
    span.setAttribute('id', 'span_' + (typeof start === 'number' ? start + '_' + i : i));
    node.appendChild(span);
  }
}


// do not run headless
if (!(window.outerWidth === 0 && window.outerHeight === 0)) {
  beforeEach(function() {
    console.groupCollapsed(this.currentTest.title);
  });

  afterEach(function() {
    if (this.currentTest.ctx.target) {
      console.log('source', this.currentTest.ctx.source.outerHTML);
    }

    if (this.currentTest.ctx.target) {
      console.log('result', this.currentTest.ctx.target.outerHTML);
    }
    console.groupEnd();
  });
}
