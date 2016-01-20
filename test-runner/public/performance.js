document.addEventListener('DOMContentLoaded', function() {

  var totalRuns = 20;

  var fixtures = [{
    from: 'fixtures/svg/from.svg',
    to: 'fixtures/svg/to.svg',
    contentType: 'text/xml'
  }, {
    from: 'fixtures/large/from.html',
    to: 'fixtures/large/to.html',
    contentType: 'text/html'
  }];
  var results = [];

  function loadTemplate(url, contentType) {
    return new Promise(function(resolve, reject) {
      var xhr = new XMLHttpRequest();
      xhr.open('GET', url, true);
      xhr.onload = function() {
        if (this.status >= 200 && this.status < 300) {
          var element;
          if (contentType === 'text/xml') {
            element = new DOMParser().parseFromString(xhr.responseText, contentType).documentElement
          } else {
            element = new DOMParser().parseFromString(xhr.responseText, contentType).documentElement.querySelector('BODY').firstChild;
          }
          resolve(element);
        } else {
          reject({
            status: this.status,
            statusText: xhr.statusText
          });
        }
      };
      xhr.onerror = function() {
        reject({
          status: this.status,
          statusText: xhr.statusText
        });
      };
      xhr.send();
    });
  }

  function setUp(fixture) {
    return Promise.all([loadTemplate(fixture.from, fixture.contentType), loadTemplate(fixture.to, fixture.contentType)])
      .then(function(result) {
        fixture.fromElement = function() {
          return result[0].cloneNode(true)
        };
        fixture.toElement = function() {
          return result[1].cloneNode(true);
        }
      });
  }

  function run(fixture) {
    var deepContentElement = document.getElementById('deep'),
      shallowContentElement = document.getElementById('shallow'),
      morphdomContentElement = document.getElementById('morphdom'),
      sourceElement,
      targetElement,
      start,
      end,
      tests = {
        'attached': 0,
        'attachedShallow': 0,
        'detached': 0,
        'detachedShallow': 0,
        'attachedMorphdom': 0,
        'detachedMorphdom': 0
      };

    for (var i = 0; i < totalRuns; i++) {
      sourceElement = fixture.toElement();
      targetElement = fixture.fromElement();
      // Detached
      start = performance.now();
      new OIGDomRenderer().render(sourceElement, targetElement);
      end = performance.now();
      tests.detached += end - start;
      // DOMNode not in document shallow
      start = performance.now();
      new OIGDomRenderer().render(sourceElement, targetElement, {
        deep: false
      });
      end = performance.now();
      tests.detachedShallow += end - start;
      // morphdom
      sourceElement = morphdomContentElement.appendChild(document.importNode(fixture.toElement(), true));
      targetElement = fixture.fromElement();
      start = performance.now();
      morphdom(sourceElement, targetElement);
      end = performance.now();
      tests.attachedMorphdom += end - start;
      // morphdom detached
      sourceElement = fixture.toElement();
      targetElement = fixture.fromElement();
      start = performance.now();
      morphdom(sourceElement, targetElement);
      end = performance.now();
      tests.detachedMorphdom += end - start;
      // Attached
      sourceElement = deepContentElement.appendChild(document.importNode(fixture.toElement(), true));
      targetElement = fixture.fromElement();
      start = performance.now();
      new OIGDomRenderer().render(sourceElement, targetElement);
      end = performance.now();
      tests.attached += end - start;
      // Attached shallow
      sourceElement = shallowContentElement.appendChild(document.importNode(fixture.toElement(), true));
      targetElement = fixture.fromElement();
      start = performance.now();
      new OIGDomRenderer().render(sourceElement, targetElement, {
        deep: false
      });
      end = performance.now();
      tests.attachedShallow += end - start;
      // cleanup
      // sourceElement.parentNode.removeChild(sourceElement);
    }
    results.push({
      fixture: fixture,
      time: {
        attached: tests.attached / totalRuns,
        attachedShallow: tests.attachedShallow / totalRuns,
        detached: tests.detached / totalRuns,
        detachedShallow: tests.detachedShallow / totalRuns,
        attachedMorphdom: tests.attachedMorphdom / totalRuns,
        detachedMorphdom: tests.detachedMorphdom / totalRuns
      }
    })
  }

  Promise.all(fixtures.map(function(fixture) {
    return setUp(fixture);
  })).then(function() {
    fixtures.forEach(function(fixture) {
      run(fixture);
    })
    var output = document.getElementById('output');
    output.innerHTML = tmpl("tmpl", {
      results: results
    });
    console.groupCollapsed('results')
    console.dir(results);
    console.groupEnd();
  });

}, false)
