
var fixtures = [{
  source: 'fixtures/svg/source.svg',
  target: 'fixtures/svg/target.svg',
  contentType: 'text/xml'
}, {
  source: 'fixtures/large/source.html',
  target: 'fixtures/large/target.html',
  contentType: 'text/html'
}, {
  source: 'fixtures/countries/source.html',
  target: 'fixtures/countries/target.html',
  contentType: 'text/html'
}];

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

function loadFixture(fixture) {
  return new Promise(function(resolve, reject) {
    Promise.all([
      loadTemplate(fixture.source, fixture.contentType),
      loadTemplate(fixture.target, fixture.contentType)
    ]).then(function(elements) {
      fixture.sourceElement = function() {
        var node = elements[0].cloneNode(true);
        //node.normalize();
        return node;
      };
      fixture.targetElement = function() {
        var node = elements[1].cloneNode(true);
        //node.normalize();
        return node;
      };
      resolve(fixture);
    }).catch(reject);
  });
}
