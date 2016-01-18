document.addEventListener('DOMContentLoaded', function() {
  var fixtures = [{
    source: 'fixtures/svg/source.svg',
    target: 'fixtures/svg/target.svg',
    contentType: 'text/xml'
  }, {
    source: 'fixtures/large/source.html',
    target: 'fixtures/large/target.html',
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
    return Promise.all([loadTemplate(fixture.source, fixture.contentType), loadTemplate(fixture.target, fixture.contentType)])
      .then(function(result) {
        fixture.sourceElement = function() {
          return result[0].cloneNode(true)
        };
        fixture.targetElement = function() {
          return result[1].cloneNode(true);
        }
      });
  }

  function run(fixture) {
    var totalRuns = 100,
      sourceElement,
      targetElement,
      start,
      end,
      tests = {
        'attached': 0,
        'detached': 0,
        'morphdom': 0
      };

    for (var i = 0; i < totalRuns; i++) {
      sourceElement = fixture.sourceElement();
      targetElement = fixture.targetElement();
      // DOMNode not in document
      start = performance.now();
      new OIGDomRenderer().render(sourceElement, targetElement);
      end = performance.now();
      tests.detached += end - start;
      // morphdom
      sourceElement = fixture.sourceElement();
      targetElement = fixture.targetElement();
      start = performance.now();
      morphdom(sourceElement, targetElement);
      end = performance.now();
      console.log(new XMLSerializer().serializeToString(sourceElement) === new XMLSerializer().serializeToString(targetElement))
      tests.morphdom += end - start;
      // Part of document
      targetElement = fixture.targetElement();
      sourceElement = document.body.appendChild(document.importNode(fixture.sourceElement(), true));
      start = performance.now();
      new OIGDomRenderer().render(sourceElement, targetElement);
      end = performance.now();
      tests.attached += end - start;
      // cleanup
      // sourceElement.parentNode.removeChild(sourceElement);
    }
    results.push({
      fixture: fixture,
      time: {
        attached: tests.attached / totalRuns,
        detached: tests.detached / totalRuns,
        morphdom: tests.morphdom / totalRuns
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
