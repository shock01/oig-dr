/* globals console,loadFixture,isHeadless */
'use strict';
describe('fixtures', function() {
  var expect = chai.expect;
  var domRenderer;

  beforeEach(function() {
    domRenderer = new OIGDomRenderer();
  });

  function test(title, setUp) {
    [true, false].forEach(function(deep) {
      it(title + ', deep:' + deep, function(done) {
        setUp()
          .then(function(fixture) {
            var sourceElement = fixture.sourceElement();
            var targetElement = fixture.targetElement();
            var result = domRenderer.render(sourceElement, targetElement, {
              deep: deep
            });
            if (!isHeadless) {
              console.info(sourceElement.outerHTML);
              console.debug(result.outerHTML);
            }
            expect(result.isEqualNode(sourceElement)).to.equal(true);
            done();
          })
          .catch(function(e) {
            done(e);
          });
      });
    });
  }
  test('it should return the same structure for fixtures/svg', function() {
    return loadFixture({
      source: 'fixtures/svg/source.svg',
      target: 'fixtures/svg/target.svg',
      contentType: 'text/xml'
    });
  });
});
