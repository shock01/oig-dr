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
      * @type {Options}
      */
    this.options = null;
  }

  DomRenderer.prototype = {
    render: function( /**Element|String*/ source, /**Element*/ targetElement, /**Options?*/ options) /**{Element|string}*/ {
      this.options = options;
      var sourceElement = typeof source === 'string' ? this.createSourceElementFromString(source) : source,
        targetParent = targetElement.parentNode;

      if (!targetParent) {
        targetParent = targetElement.ownerDocument.createDocumentFragment();
        targetParent.appendChild(targetElement);
      }

      this.visit(sourceElement, targetElement, targetElement);
      return targetElement;

    },
    /**
    * @private
    */
    createSourceElementFromString: function( /**String*/ html) /**Element*/ {
      return new DOMParser().parseFromString(html, 'text/xml').documentElement;
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
    isSameElement: function( /**Element*/ left, /**Element*/ right) /**Boolean*/ {
      return (left.nodeType === ELEMENT_NODE &&
        right.nodeType === ELEMENT_NODE &&
        left.localName === right.localName &&
        left.namespaceURI === right.namespaceURI);
    },
    visit: function( /**Element*/ source, /**Element*/ target, /**Element*/ targetParent) /**Element*/ {
      var options = this.options,
        sourceWalker = createTreeWalker(source, options.ignoreComments),
        targetWalker = createTreeWalker(target),
        ownerDocument = target.ownerDocument;
      // we need to keep a list of target;
      while ((source = sourceWalker.nextNode())) {
        target = targetWalker.nextNode();
        if (options.ignoreComments === true && target.nodeType === COMMENT_NODE) {
          target.parentNode.removeChild(target);
          target = targetWalker.nextNode();
        }
        if (target) {
          if (target.nodeType === source.nodeType) {
            if (source.nodeType === TEXT_NODE || source.nodeType === COMMENT_NODE) {
              target.nodeValue = source.nodeValue;
            } else if (source.nodeType === ELEMENT_NODE) {
              if (this.isSameElement(target, source)) {
                if (!target.cloneNode(false).isEqualNode(source.cloneNode(false))) {
                  targetWalker.previousNode();
                  target.parentNode.replaceChild(ownerDocument.importNode(source.cloneNode(true)), target);
                  target = targetWalker.nextNode();
                }
              } else {
                targetWalker.previousNode();
                target.parentNode.replaceChild(ownerDocument.importNode(source.cloneNode(true)), target);
                target = targetWalker.nextNode();
              }
              //this.visit(source, target, target);
              //continue;
            }
          }
        } else {
          targetParent.appendChild(ownerDocument.importNode(source.cloneNode(source, true)));
          target = targetWalker.nextNode();
        }
      }
      // remove what we do not need
      var current = targetWalker.nextNode(), next;
      while (current) {
        next = targetWalker.nextNode();
        current.parentNode.removeChild(current);
        current = next;
      }
      return target;
    }
  };
  return function() {
    /**
    * expose public API
    */
    var instance = new DomRenderer();
    return {
      render: function( /**Element*/ source, /**Element*/ target, /**Options*/ options) /**Element*/ {
        return instance.render(source, target, options || {});
      }
    };
  };
}));
