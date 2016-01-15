(function(root, factory) {
  'use strict';
  /* istanbul ignore next */
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof module === "object" && module.exports) {
    module.exports = factory();
  } else {
    root.OIGDomRenderer = factory();
  }
}(this, function() {
  'use strict';
  /**@const*/
  var TEXT_NODE = Node.TEXT_NODE;
  /**@const*/
  var ELEMENT_NODE = Node.ELEMENT_NODE;
  /**
  * internet explorer has some issues with acceptNode
  */
  function filter(node) {
    return NodeFilter.FILTER_ACCEPT;
  }
  filter.acceptNode = filter;

  function createTreeWalker( /**Node*/ node) /**TreeWalker*/ {
    return node.ownerDocument.createTreeWalker(
      node,
      NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT,
      filter,
      false);
  }

  /**
  * @constructor
  */
  function DomRenderer() {
    /**
    * @type {DOMDocument}
    */
    this.targetDocument = null;
  }

  DomRenderer.prototype = {
    render: function( /**Element|String*/ source, /**Element*/ targetElement) /**{Element|string}*/ {
      var sourceElement = typeof source === 'string' ? this.createSourceElementFromString(source) : source;
      if (sourceElement.isEqualNode(targetElement)) {
        return targetElement;
      } else {
        if (sourceElement.nodeName.toLowerCase() === targetElement.nodeName.toLowerCase()) {
          var sourceWalker = createTreeWalker(sourceElement),
            targetWalker = createTreeWalker(targetElement);

          this.targetDocument = targetElement.ownerDocument;
          this.mergeNode(sourceElement, targetElement);
          this.visit(targetElement, sourceWalker, targetWalker);
          return targetElement;
        } else {
          throw '[oig-dr].render source and target should be same element';
        }
      }
    },
    createSourceElementFromString: function( /**String*/ source) /**Element*/ {
      return new DOMParser().parseFromString(source, 'text/xml').documentElement;
    },
    mergeNode: function( /**Element*/ source, /**Element*/ target) {
      var attr,
        attrs = {},
        sourceAttributes = source.attributes,
        targetAttributes = target.attributes,
        i = sourceAttributes.length,
        j,
        k;

      while (i--) {
        attr = sourceAttributes[i];
        if (target.getAttribute(attr.name) !== attr.value) {
          target.setAttributeNS(attr.namespaceURI, attr.name, attr.value);
        }
        attrs[attr.name] = attr;
      }
      j = targetAttributes.length;
      while (j--) {
        attr = targetAttributes[j];
        if (!attrs.hasOwnProperty(attr.name)) {
          target.removeAttributeNS(attr.namespaceURI, attr.name);
        }
      }
      for (k in attrs) {
        if (attrs.hasOwnProperty(k)) {
          delete attrs[k];
        }
      }
    },
    replaceElement: function( /**Element*/ newElement, /**Element*/ oldElement) {
      var targetDocument = this.targetDocument;
      if (newElement.namespaceURI === targetDocument.namespaceURI) {
        oldElement.parentNode.replaceChild(newElement.cloneNode(true), oldElement);
      } else {
        oldElement.parentNode.replaceChild(targetDocument.importNode(newElement, true), oldElement);
      }
    },
    addElement: function( /**Element*/ parentElement, /**Element*/ element) {
      var targetDocument = this.targetDocument;
      if (parentElement.namespaceURI === targetDocument.namespaceURI) {
        parentElement.appendChild(element.cloneNode(true));
      } else {
        parentElement.appendChild(targetDocument.importNode(element, true));
      }
    },
    clearNodes: function( /**Node*/ targetNode, /**TreeWalker*/ treeWalker) {
      var nodes = [],
        node,
        i;
      do {
        nodes.push(targetNode);
      } while ((targetNode = treeWalker.nextNode()) !== null);

      i = nodes.length;
      while (i--) {
        node = nodes[i];
        node.parentNode.removeChild(node);
        nodes[i] = null;
      }
    },
    visit: function( /**Element*/ target, /**TreeWalker*/ sourceWalker, /**TreeWalker*/ targetWalker) {
      var targetDocument = this.targetDocument,
        sourceNode = sourceWalker.nextNode(),
        targetNode = targetWalker.nextNode(),
        nextTarget;

      if (sourceNode) {
        if (targetNode === null) {
          this.addElement(target, sourceNode);
          targetNode = targetWalker.nextNode();
        } else {
          if (targetNode.nodeType === sourceNode.nodeType) {
            if (targetNode.nodeType === TEXT_NODE) {
              if (targetNode.nodeValue !== sourceNode.nodeValue) {
                targetNode.nodeValue = sourceNode.nodeValue;
              }
            } else if (targetNode.nodeType === ELEMENT_NODE) {
              if (targetNode.nodeName === sourceNode.nodeName &&
                targetNode.namespaceURI === sourceNode.namespaceURI) {
                if (!targetNode.isEqualNode(sourceNode)) {
                  this.mergeNode(sourceNode, targetNode);
                }
              } else {
                // reset the treeWalker to previous to continue walking
                targetWalker.nextNode();
                this.replaceElement(sourceNode, targetNode);
                targetNode = targetWalker.previousNode();
              }
            } else {
              // different node type (eg. TEXT_NODE instead of ELEMENT_NODE)
              targetWalker.nextNode();
              this.replaceElement(sourceNode, targetNode);
              targetNode = targetWalker.previousNode();
            }
          }
        }

        if (targetNode) {
          if (targetNode.nextSibling) {
            // the parent still has elements
            nextTarget = targetNode.parentNode;
          } else if (targetNode.parentNode.parentNode) {
            // no elements await move back to parent of parent
            nextTarget = targetNode.parentNode.parentNode;
          } else {
            // will move to next using treeWalker
            nextTarget = target;
          }
          this.visit(nextTarget, sourceWalker, targetWalker);
        }
      } else if (targetNode) {
        this.clearNodes(targetNode, targetWalker);
      }
    }
  };
  return DomRenderer;
}));
