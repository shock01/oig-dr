document.addEventListener('DOMContentLoaded', function() {

  var totalRuns = 20;
  var results = document.getElementById("results");
  var target = document.getElementById('target');
  var progress = document.getElementById('progress');

  var suite = new Benchmark.Suite('OIGDomRenderer Benchmark');

  function render() {
    results.innerHTML = tmpl("results_tmpl", {
      data: suite
    });
  }

  function verify(left, right) {
    if (!left.isEqualNode(right)) {
      throw 'source and target have diffent DOMStructure';
    }
  }

  suite.on('cycle', function() {
    render();
  }).on('complete', function() {
    console.log(this);
    progress.style.display = 'none';
  })
  Promise.all(fixtures.map(function(fixture) {
    return loadFixture(fixture);
  })).then(function() {
    var benches = [];
    var options = {

    };

    fixtures.forEach(function(fixture) {
      (function() {
        // OIGDomRenderer deep
        suite.add('OIGDomRenderer detached: ' + fixture.target, function() {
          var sourceElement = fixture.sourceElement();
          var targetElement = fixture.targetElement();
          var result = new OIGDomRenderer().render(sourceElement, targetElement);
          verify(result, sourceElement);
        }, options);
        suite.add('OIGDomRenderer attached: ' + fixture.target, function() {
          var targetElement = target.appendChild(fixture.targetElement());
          var sourceElement = fixture.sourceElement();
          var result = new OIGDomRenderer().render(sourceElement, targetElement);
          targetElement.parentNode.removeChild(targetElement);
          verify(result, sourceElement);
        }, options);
        // OIGDomRenderer shallow
        suite.add('OIGDomRenderer detached shallow: ' + fixture.target, function() {
          var sourceElement = fixture.sourceElement();
          var targetElement = fixture.targetElement();
          var result = new OIGDomRenderer().render(sourceElement, targetElement, {
            deep: false
          });
          console.groupCollapsed(this.name)
          console.log(result.outerHTML)
          console.log(sourceElement.outerHTML);
          verify(result, sourceElement);
        }, options);
        suite.add('OIGDomRenderer attached shallow: ' + fixture.target, function() {
          var targetElement = target.appendChild(fixture.targetElement());
          var sourceElement = fixture.sourceElement();
          var result = new OIGDomRenderer().render(sourceElement, targetElement, {
            deep: false
          });
          targetElement.parentNode.removeChild(targetElement);
          verify(result, sourceElement);
        }, options);
        // morphdom
        suite.add('morphdom detached: ' + fixture.target, function() {
          var targetElement = fixture.targetElement();
          var sourceElement = fixture.sourceElement();
          var result = morphdom(targetElement, sourceElement);
          verify(result, sourceElement);
        }, options);
        suite.add('morphdom attached: ' + fixture.target, function() {
          var targetElement = target.appendChild(fixture.targetElement());
          var sourceElement = fixture.sourceElement();
          var result = morphdom(targetElement, sourceElement);
          targetElement.parentNode.removeChild(targetElement);
          verify(result, sourceElement);
        }, options);

      }())
    })
  }).then(function() {
    suite.run({
      'async': true
    });

    render();
  });

}, false)
