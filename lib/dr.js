(function(root, factory) {
  'use strict';
  /* istanbul ignore next */
  if (typeof define === 'function' && define.amd) {
    define(factory);
  } else if (typeof module === 'object' && module.exports) {
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
  function filter() {
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
    /**
    * @type {TreeWalker}
    */
    this.targetWalker = null;
    /**
    * @type {TreeWalker}
    */
    this.sourceWalker = null;
    /**
    * @type {Element}
    */
    this.sourceNode = null;
    /**
    * @type {Element}
    */
    this.targetNode = null;
  }

  DomRenderer.prototype = {
    render: function( /**Element|String*/ source, /**Element*/ targetElement) /**{Element|string}*/ {
      var sourceElement = typeof source === 'string' ? this.createSourceElementFromString(source) : source;
      if (sourceElement.isEqualNode(targetElement)) {
        return targetElement;
      } else {
        this.sourceWalker = createTreeWalker(sourceElement);
        this.targetWalker = createTreeWalker(targetElement);
        this.targetDocument = targetElement.ownerDocument;
        this.sourceNode = this.sourceWalker.nextNode();
        this.targetNode = this.targetWalker.nextNode();
        this.mergeNode(sourceElement, targetElement);
        this.visit(targetElement);
        return targetElement;
      }
    },
    createSourceElementFromString: function( /**String*/ html) /**Element*/ {
      var frag = document.createRange().createContextualFragment(html);
      return frag.firstChild;
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
    replaceElement: function() /**Element*/ {
      var targetDocument = this.targetDocument,
        newElement = this.sourceWalker.currentNode,
        oldElement = this.targetWalker.currentNode;
      this.targetWalker.previousNode();
      if (newElement.namespaceURI === targetDocument.namespaceURI) {
        oldElement.parentNode.replaceChild(newElement.cloneNode(true), oldElement);
      } else {
        oldElement.parentNode.replaceChild(targetDocument.importNode(newElement, true), oldElement);
      }
      return this.targetWalker.nextNode();
    },
    addElement: function( /**Element*/ parentElement) /**Element*/ {
      var targetDocument = this.targetDocument,
        element = this.sourceWalker.currentNode;
      if (parentElement.namespaceURI === targetDocument.namespaceURI) {
        parentElement.appendChild(element.cloneNode(true));
      } else {
        parentElement.appendChild(targetDocument.importNode(element, true));
      }
      return this.targetWalker.nextNode();
    },
    clearNodes: function() {
      var treeWalker = this.targetWalker,
        targetNode = treeWalker.currentNode,
        nodes = [],
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
    advanceSibling: function() {
      this.sourceNode = this.sourceWalker.nextSibling();
      this.targetNode = this.targetWalker.nextSibling();
    },
    advanceNode: function() {
      this.sourceNode = this.sourceWalker.nextNode();
      this.targetNode = this.targetWalker.nextNode();
    },
    isSameElement: function( /**Element*/ left, /**Element*/ right) /**Boolean*/ {
      return (left.nodeType === ELEMENT_NODE &&
        right.nodeType === ELEMENT_NODE &&
        left.nodeName.toLowerCase() === right.nodeName.toLowerCase() &&
        left.namespaceURI === right.namespaceURI);
    },
    visit: function( /**Element*/ target) {
      var sourceNode = this.sourceNode,
        targetNode = this.targetNode;

      if (sourceNode) {
        if (targetNode === null) {
          target = this.addElement(target).parentNode;
          this.advanceSibling();
        } else {
          if (targetNode.nodeType === sourceNode.nodeType) {
            if (targetNode.nodeType === TEXT_NODE) {
              if (targetNode.nodeValue !== sourceNode.nodeValue) {
                targetNode.nodeValue = sourceNode.nodeValue;
              }
              this.advanceNode();
            } else if (this.isSameElement(sourceNode, targetNode)) {
              if (targetNode.isEqualNode(sourceNode)) {
                this.advanceNode();
              } else {
                if (sourceNode.childNodes.length === 0) {
                  this.mergeNode(sourceNode, targetNode);
                } else {
                  target = this.replaceElement();
                }
                this.advanceSibling();
              }
            } else {
              target = this.replaceElement();
              this.advanceSibling();
            }
          }
        }
        if (target) {
          this.visit(target);
        }
      } else if (targetNode) {
        this.clearNodes();
      }
    }
  };
  return DomRenderer;
}));
