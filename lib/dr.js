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
  /**@const*/
  var COMMENT_NODE = Node.COMMENT_NODE;
  /**@const*/
  var CONTENT_TYPE_XML = 'text/xml';
  /**@const*/
  var ELEMENT_PROPERTIES = [{
    name: 'className'
  }, {
    name: 'id'
  }, {
    name: 'scrollLeft'
  }, {
    name: 'scrollTop'
  }];
  /**@@const*/
  var INPUT_PROPERTIES = [{
    name: 'checked',
    boolean: true
  }, {
    name: 'value'
  }, {
    name: 'indeterminate',
    boolean: true,
    scriptOnly: true
  }, {
    name: 'readOnly',
    boolean: true
  }];
  /**@const*/
  var SELECT_PROPERTIES = [{
    name: 'selectedIndex'
  }, {
    name: 'multiple',
    boolean: true
  }];
  /**@const*/
  var MEDIA_PROPERTIES = [
    {
      name: 'controls',
      boolean: true
    },
    {
      name: 'loop',
      boolean: true
    }, {
      name: 'muted',
      boolean: true
    }];
  /**@const*/
  var IFRAME_PROPERTIES = [{
    name: 'srcDoc'
  }];
  /**
   * Options
   * @typedef {Object} Options
   * @property {Boolean} ignoreComments - to skip comments processing default(false)
   */
  /**
  * internet explorer has some issues with acceptNode
  */
  function filter() {
    return NodeFilter.FILTER_ACCEPT;
  }
  filter.acceptNode = filter;

  function createTreeWalker( /**Node*/ node, /**Boolean*/ ignoreComments) /**TreeWalker*/ {
    var flags = NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT | NodeFilter.SHOW_COMMENT;
    if (ignoreComments === true) {
      flags &= ~NodeFilter.SHOW_COMMENT;
    }
    return node.ownerDocument.createTreeWalker(node, flags, filter, false);
  }
  /**
  * @constuctor
  */
  function ElementPropertyHandler /**Array.<String>*/ (properties) {
    this.properties = properties;
  }
  ElementPropertyHandler.prototype = {
    handle: function( /**Element*/ sourceElement, /**Element*/ targetElement) /**Element*/ {
      var properties = this.properties,
        i = this.properties.length,
        key;
      while (i--) {
        key = properties[i];
        targetElement[key] = sourceElement[key];
      }
      return targetElement;
    }
  };

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
    /**
    * @type {DOMParser}
    */
    this.domParser = new DOMParser();
    /**
    * @type {Options}
    */
    this.options = null;
  }

  DomRenderer.prototype = {
    elementPropertyHandlers: {
      /**
      * elementPropertyHandlers are mostly used to fix Internet Explorer issues with not updating element attributes
      * when a property changes
      */
      __default__: new ElementPropertyHandler(ELEMENT_PROPERTIES),
      input: new ElementPropertyHandler(INPUT_PROPERTIES),
      select: new ElementPropertyHandler(SELECT_PROPERTIES),
      media: new ElementPropertyHandler(MEDIA_PROPERTIES),
      iframe: new ElementPropertyHandler(IFRAME_PROPERTIES)
    },
    render: function( /**Element|String*/ source, /**Element*/ targetElement, /**Options?*/ options) /**{Element|string}*/ {
      this.options = options;
      var sourceElement = typeof source === 'string' ? this.createSourceElementFromString(source) : source;
      if (sourceElement.nodeName.toLowerCase() === targetElement.nodeName.toLowerCase()) {
        this.prepare(sourceElement, targetElement, options);
        this.mergeAttributes(sourceElement, targetElement);
        this.visit(targetElement);
        this.mergeProperties(sourceElement, targetElement);
        return targetElement;
      } else if (targetElement.parentNode) {
        return this.replaceChild(sourceNode.cloneNode(true), targetNode);
      } else {
        return targetElement;
      }
    },
    /**
    * @private
    */
    prepare: function( /**Element*/ sourceElement, /**Element*/ targetElement, /**Options*/ options) {
      this.sourceWalker = createTreeWalker(sourceElement, options.ignoreComments);
      this.targetWalker = createTreeWalker(targetElement);
      this.targetDocument = targetElement.ownerDocument;
      this.sourceNode = this.sourceWalker.nextNode();
      this.targetNode = this.targetWalker.nextNode();
    },
    /**
    * @private
    */
    createSourceElementFromString: function( /**String*/ html) /**Element*/ {
      return this.domParser.parseFromString(html, 'text/xml').documentElement;
    },
    /**
    * @private
    */
    mergeAttributes: function( /**Element*/ source, /**Element*/ target) {
      var attr,
        attrs = {},
        sourceAttributes = source.attributes,
        targetAttributes = target.attributes,
        i = sourceAttributes.length,
        k;

      while (i--) {
        attr = sourceAttributes[i];
        if (target.getAttributeNS(attr.namespaceURI, attr.localName) !== attr.value) {
          target.setAttributeNS(attr.namespaceURI, attr.nodeName, attr.value);
        }
        attrs[attr.nodeName] = attr;
      }
      i = targetAttributes.length;
      while (i--) {
        attr = targetAttributes[i];
        if (!attrs.hasOwnProperty(attr.nodeName)) {
          target.removeAttributeNS(attr.namespaceURI, attr.localName);
        }
      }
      for (k in attrs) {
        if (attrs.hasOwnProperty(k)) {
          delete attrs[k];
        }
      }
    },
    /**
    * @private
    */
    mergeProperties: function( /**Element*/ sourceElement, /**Element*/ targetElement) /**Element*/ {
      // breaks the loop
      //this.elementPropertyHandlers.__default__.handle(sourceElement, targetElement)
      if (sourceElement instanceof HTMLInputElement) {
        return this.elementPropertyHandlers.input.handle(sourceElement, targetElement);
      } else if (sourceElement instanceof HTMLSelectElement) {
        return this.elementPropertyHandlers.select.handle(sourceElement, targetElement);
      } else if (sourceElement instanceof HTMLMediaElement) {
        return this.elementPropertyHandlers.media.handle(sourceElement, targetElement);
      } else if (sourceElement instanceof HTMLIFrameElement) {
        return this.elementPropertyHandlers.iframe.handle(sourceElement, targetElement);
      } else {
        return targetElement;
      }
    },
    /**
    * @private
    */
    replaceElement: function() /**Element*/ {
      var sourceWalker = this.sourceWalker,
        targetWalker = this.targetWalker,
        currentTarget = targetWalker.currentNode;
      targetWalker.previousNode();
      this.replaceChild(sourceWalker.currentNode, currentTarget);
      return targetWalker.nextNode();
    },
    /**
    * @private
    */
    replaceChild: function( /**Node*/ newChild, /**Node*/ oldChild) {
      return oldChild.parentNode.replaceChild(this.targetDocument.importNode(newChild, true), oldChild);
    },
    /**
    * @private
    */
    addElement: function( /**Element*/ parentElement) /**Element*/ {
      var element = this.sourceWalker.currentNode;
      parentElement.appendChild(this.targetDocument.importNode(element, true));
      return this.targetWalker.nextNode();
    },
    /**
    * @private
    */
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
    /**
    * @private
    */
    nextSibling: function() {
      this.sourceNode = this.sourceWalker.nextSibling();
      this.targetNode = this.targetWalker.nextSibling();
    },
    /**
    * @private
    */
    nextNode: function() {
      this.sourceNode = this.sourceWalker.nextNode();
      this.targetNode = this.targetWalker.nextNode();
    },
    /**
    * @private
    */
    isSameElement: function( /**Element*/ left, /**Element*/ right) /**Boolean*/ {
      return (left.nodeType === ELEMENT_NODE &&
        right.nodeType === ELEMENT_NODE &&
        left.nodeName.toLowerCase() === right.nodeName.toLowerCase() &&
        left.namespaceURI === right.namespaceURI);
    },
    /**
    * @private
    */
    verifyTargetNode: function() {
      var targetNode = this.targetNode;
      if (this.options.ignoreComments === true && targetNode.nodeType === COMMENT_NODE) {
        targetNode.parentNode.removeChild(targetNode);
        this.targetNode = this.targetWalker.nextNode();
      }
      return this.targetNode;
    },
    visit: function( /**Element*/ currentParentElement) {
      var sourceNode = this.sourceNode,
        targetNode = this.verifyTargetNode(),
        nextParentElement = currentParentElement;

      // somehow need to know when the parent has changed


      if (sourceNode) {
        if (targetNode === null) {
          nextParentElement = this.addElement(currentParentElement).parentNode;
          this.nextSibling();
        } else {
          if (targetNode.nodeType === sourceNode.nodeType) {
            if (targetNode.nodeType === TEXT_NODE) {
              if (targetNode.nodeValue !== sourceNode.nodeValue) {
                targetNode.nodeValue = sourceNode.nodeValue;
              }
              this.nextNode();
            } else if (this.isSameElement(sourceNode, targetNode)) {
              if (targetNode.isEqualNode(sourceNode)) {
                this.nextSibling();
              } else {
                if (sourceNode.childNodes.length === 0) {
                  this.replaceElement();
                } else {
                  /**
                  * @todo it might be so performance to do a complete replaceChild
                  * somehow we should limit changes and iterate over childNodes
                  */
                  nextParentElement = this.replaceElement();
                }
                this.nextSibling();
              }
              this.mergeProperties(sourceNode, targetNode);
            } else {
              // comment node
              nextParentElement = this.replaceElement();
              this.nextSibling();
            }
          }
        }
        if (nextParentElement) {
          this.visit(nextParentElement);
        }
      } else if (targetNode) {
        this.clearNodes();
      }
    }
  };
  return function() {
    /**
    * expose public API
    */
    var instance = new DomRenderer();
    return {
      inputProperties: INPUT_PROPERTIES,
      render: function( /**Element*/ source, /**Element*/ target, /**Options*/ options) /**Element*/ {
        return instance.render(source, target, options || {});
      }
    }
  }
}));
