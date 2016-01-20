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
   * @property {Boolean} ignoreComments - skip comments processing
   * @default false
   * @property {Boolean} deep - parse all individual nodes which degrades performance but maintains elements refererences
   * @default true
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
      if (typeof this.options.deep !== 'boolean') {
        this.options.deep = true;
      }
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
    visit: function( /**Element*/ source, /**Element*/ target) /**Element*/ {
      var options = this.options,
        deep = options.deep,
        ignoreComments = options.ignoreComments,
        ownerDocument = target.ownerDocument;
      if (source.nodeType === ELEMENT_NODE) {
        var sourceNode,
          targetNode = target.childNodes[0],
          importedNode,
          i = 0
        while ((sourceNode = source.childNodes[i++])) {
          if (ignoreComments && sourceNode.nodeType === COMMENT_NODE) {
            continue;
          }
          if (ignoreComments) {
            if (targetNode.nodeType === COMMENT_NODE) {
              targetNode.parentNode.removeChild(targetNode)
              continue;
            }
            if (sourceNode.nodeType === COMMENT_NODE) {
              continue;
            }
          }
          importedNode = ownerDocument.importNode(sourceNode, deep);
          if (targetNode) {
            if (!importedNode.isEqualNode(deep ? targetNode : targetNode.cloneNode(false))) {
              targetNode = target.replaceChild(importedNode, targetNode);
            }
          } else {
            targetNode = target.appendChild(importedNode);
          }
          if (deep || !sourceNode.isEqualNode(targetNode)) {
            this.visit(sourceNode, targetNode);
          }
          targetNode = target.childNodes[i];
        }
        if (targetNode) {
          var nextNode;
          while (targetNode) {
            nextNode = targetNode.nextSibling;
            targetNode.parentNode.removeChild(targetNode);
            targetNode = nextNode;
          }
        }
        if (source && target) {
          this.mergeAttributes(source, target);
        }
      } else if (source.nodeType === TEXT_NODE || source.nodeType === COMMENT_NODE) {
        if (target.nodeValue !== source.nodeValue) {
          target.nodeValue = source.nodeValue;
        }
      } else if (source.nodeType === COMMENT_NODE) {
        if (target.nodeValue !== source.nodeValue) {
          target.nodeValue = source.nodeValue;
        }
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
