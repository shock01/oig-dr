/* globals tmpl,console,Benchmark,Promise,OIGDomRenderer,fixtures,loadFixture,morphdom*/
document.addEventListener('DOMContentLoaded', function() {
  'use strict';
  var results = document.getElementById('results');
  var target = document.getElementById('target');
  var progress = document.getElementById('progress');
  var index = /index=(\d+)/.test(document.location.search) ? parseInt(RegExp.$1, 10) : -1;
  var suite = new Benchmark.Suite('OIGDomRenderer Benchmark');

  function render() {
    results.innerHTML = tmpl('results_tmpl', {
      data: suite
    });
  }

  function verify(benchmark, left, right) {
    if (!left.isEqualNode(right)) {
      console.groupCollapsed(benchmark.name);
      console.debug(left.outerHTML);
      console.log(right.outerHTML);
      console.groupEnd();
      throw 'source and target have diffent DOMStructure';
    }
  }

  suite.on('cycle', function() {
    render();
  }).on('complete', function() {
    console.log(this);
    progress.style.display = 'none';
  });
  Promise.all(fixtures.map(function(fixture) {
    return loadFixture(fixture);
  })).then(function() {
    var options = {
      minSamples: 10,
      async: true
    };

    fixtures.filter(function(fixture, i) {
      if (index > -1) {
        return i === index;
      } else {
        return true;
      }
    }).forEach(function(fixture) {
      (function() {
        // OIGDomRenderer deep
        suite.add('OIGDomRenderer detached: ' + fixture.target, function() {
          var sourceElement = fixture.sourceElement();
          var targetElement = fixture.targetElement();
          var result = new OIGDomRenderer().render(sourceElement, targetElement);
          verify(this, result, sourceElement);
        }, options);
        // fragment
        suite.add('OIGDomRenderer attached without fragments: ' + fixture.target, function() {
          var targetElement = target.appendChild(fixture.targetElement());
          var sourceElement = fixture.sourceElement();
          var result = new OIGDomRenderer().render(sourceElement, targetElement, {
            useFragment: true
          });
          targetElement.parentNode.removeChild(targetElement);
          verify(this, result, sourceElement);
        }, options);
        // ignore text cannot call verify because of normalize
        suite.add('OIGDomRenderer attached ignore text: ' + fixture.target, function() {
          var targetElement = target.appendChild(fixture.targetElement());
          var sourceElement = fixture.sourceElement();
          new OIGDomRenderer().render(sourceElement, targetElement, {
            ignoreText: true
          });
          targetElement.parentNode.removeChild(targetElement);
          //verify(this, targetElement, sourceElement);
        }, options);
        suite.add('OIGDomRenderer attached with fragment: ' + fixture.target, function() {
          var targetElement = target.appendChild(fixture.targetElement());
          var sourceElement = fixture.sourceElement();
          var result = new OIGDomRenderer().render(sourceElement, targetElement);
          targetElement.parentNode.removeChild(targetElement);
          verify(this, result, sourceElement);
        }, options);
        // OIGDomRenderer shallow
        suite.add('OIGDomRenderer detached shallow: ' + fixture.target, function() {
          var sourceElement = fixture.sourceElement();
          var targetElement = fixture.targetElement();
          var result = new OIGDomRenderer().render(sourceElement, targetElement, {
            deep: false
          });
          verify(this, result, sourceElement);
        }, options);
        suite.add('OIGDomRenderer attached shallow: ' + fixture.target, function() {
          var targetElement = target.appendChild(fixture.targetElement());
          var sourceElement = fixture.sourceElement();
          var result = new OIGDomRenderer().render(sourceElement, targetElement, {
            deep: false
          });
          targetElement.parentNode.removeChild(targetElement);
          verify(this, result, sourceElement);
        }, options);
        // morphdom
        suite.add('morphdom detached: ' + fixture.target, function() {
          var targetElement = fixture.targetElement();
          var sourceElement = fixture.sourceElement();
          morphdom(sourceElement, targetElement);
          verify(this, targetElement, sourceElement);
        }, options);
        suite.add('morphdom attached: ' + fixture.target, function() {
          var targetElement = target.appendChild(fixture.targetElement());
          var sourceElement = fixture.sourceElement();
          morphdom(sourceElement, targetElement);
          targetElement.parentNode.removeChild(targetElement);
          verify(this, targetElement, sourceElement);
        }, options);

      }());
    });
  }).then(function() {
    suite.run({
      'async': true
    });

    render();
  });

}, false)
