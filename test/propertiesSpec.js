describe('Properties', function() {
  // @see https://github.com/Raynos/react/blob/dom-property-config/src/browser/ui/dom/DefaultDOMPropertyConfig.js
  'use strict';
  var expect = chai.expect;
  var domRenderer = new OIGDomRenderer();

  var /**Node*/ source;
  var /**Node*/ target;

  describe('input element', function() {

    var properties;

    beforeEach(function() {
      source = document.createElement('input');
      target = document.createElement('input');
    })
    // properties set on the sourceTarget should be preserved
    domRenderer.inputProperties.forEach(function(descriptor) {
      var name = descriptor.name,
        value = descriptor.boolean ? true : 'value';

      it('should preserve property: ' + descriptor.name, function() {
        target[name] = value;
        if (!descriptor.scriptOnly) {
          source.setAttribute(descriptor.name.toLowerCase(), value);
        }
        var result = domRenderer.render(target, source);
        expect(result[name]).to.equal(value);
      });

      it('should preserve property when nested: ' + descriptor.name, function() {
        target[name] = value;
        if (!descriptor.scriptOnly) {
          source.setAttribute(descriptor.name.toLowerCase(), value);
        }
        var parentTarget = document.createElement('div');
        parentTarget.appendChild(target);
        var parentSource = document.createElement('div');
        parentSource.appendChild(source);
        var result = domRenderer.render(parentTarget, parentSource);
        expect(result[name]).to.equal(value);
      });
    });
  });
});
