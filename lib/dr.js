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
  var SHALLOW = 0x1;
  /**@const*/
  var IGNORE_COMMENT = 0x2;
  /**@const*/
  var IGNORE_TEXT = 0x4;
  /**@const*/
  var USE_FRAGMENT = 0x8;
  /**@const*/

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
   * @property {Number} flags
   */
  /**
  * internet explorer has some issues with acceptNode
  */
  /* istanbul ignore next */
  function filter() {
    return NodeFilter.FILTER_ACCEPT;
  }
  filter.acceptNode = filter;
  /**
  * @constructor
  */
  function DomRenderer() {
  }

  DomRenderer.prototype = {
    render: function( /**Element|String*/ source, /**Element*/ targetElement, /**Number*/ flags) /**{Element|string}*/ {

      var sourceElement = typeof source === 'string' ? this.createSourceElementFromString(source) : source,
        targetParent = targetElement.parentNode;

      if (!targetParent) {
        // remove the fragment
        flags &= ~USE_FRAGMENT;
        targetParent = targetElement.ownerDocument.createDocumentFragment();
        targetParent.appendChild(targetElement);
      }
      // should this only be done for ignore text?
      sourceElement.normalize();
      targetElement.normalize();
      this.visit(sourceElement, targetElement, flags);
      return targetElement;

    },
    /**
    * @private
    */
    createSourceElementFromString: function( /**String*/ html) /**Element*/ {
      return new DOMParser().parseFromString(html, CONTENT_TYPE_XML).documentElement;
    },
    /**
    * @private
    */
    mergeAttributes: function( /**Element*/ source, /**Element*/ target) {
      var sourceAttributes = source.attributes,
        targetAttributes = target.attributes,
        i = Math.max(sourceAttributes.length, targetAttributes.length),
        sourceAttr, targetAttr;

      while (i--) {
        sourceAttr = sourceAttributes[i];
        targetAttr = targetAttributes[i];
        if (sourceAttr) {
          if (!targetAttr || sourceAttr.value !== targetAttr.value) {
            target.setAttributeNS(sourceAttr.namespaceURI, sourceAttr.localName, sourceAttr.value);
          }
        } else {
          target.removeAttributeNS(targetAttr.namespaceURI, targetAttr.localName);
        }
      }
    },
    /**
    * @private
    */
    isSameNode: function( /**Element*/ left, /**Element*/ right) {
      return left.nodeType === right.nodeType && left.namespaceURI === right.namespaceURI && left.localName === right.localName;
    },
    /**
    * @private
    */
    importNode: function( /**Node*/ node, /**Document*/ ownerDocument, /**Boolean?*/ deep) /**Node*/ {
      if (node.nodeType === ELEMENT_NODE) {
        return ownerDocument.importNode(node, deep);
      } else if (node.nodeType === TEXT_NODE) {
        return ownerDocument.createTextNode(node.textContent);
      } else if (node.nodeType === COMMENT_NODE) {
        return ownerDocument.createComment(node.textContent);
      }
    },
    /**
    * @private
    */
    removeSiblings: function( /**Node*/ node) {
      var current;
      while (node) {
        current = node.nextSibling;
        node.parentNode.removeChild(node);
        node = current;
      }
    },

    visit: function( /**Element*/ source, /**Element*/ target, /**Number*/ flags) /**Element*/ {
      var ownerDocument = target.ownerDocument,
        targetNode = target.firstChild,
        currentTarget,
        sourceNode,
        importedNode,
        fragment = flags & USE_FRAGMENT ? ownerDocument.createDocumentFragment() : null,
        sourceIterator = flags & IGNORE_TEXT ? source.children : source.childNodes,
        targetIterator = flags & IGNORE_TEXT ? target.children : target.childNodes,
        i = 0;
      while ((sourceNode = sourceIterator[i++])) {
        currentTarget = targetNode;
        if ((flags & IGNORE_COMMENT) && sourceNode.nodeType === COMMENT_NODE) {
          continue;
        }
        importedNode = this.importNode(sourceNode, ownerDocument, flags & SHALLOW === 0);
        if (targetNode) {
          if ((flags & IGNORE_COMMENT) && targetNode.nodeType === COMMENT_NODE) {
            targetNode = targetNode.nextSibling;
            target.removeChild(currentTarget);
          }
          if (!this.isSameNode(importedNode, targetNode) ||
            !importedNode.isEqualNode(targetNode.cloneNode(flags & IGNORE_COMMENT === 0))) {
            target.replaceChild(importedNode, targetNode);
            targetNode = importedNode;
          }

        } else {
          if (fragment && importedNode.nextSibling) {
            targetNode = fragment.appendChild(importedNode);
          } else {
            if (importedNode.nodeType === TEXT_NODE) {
              target.insertAdjacentText('beforeEnd', importedNode.textContent);
            } else {
              targetNode = target.appendChild(importedNode);
            }
          }
        }
        if ((sourceNode.nodeType === ELEMENT_NODE && targetNode.nodeType === ELEMENT_NODE) &&
          ((flags & SHALLOW === 0) || !sourceNode.isEqualNode(targetNode))) {
          this.visit(sourceNode, targetNode);
        }
        targetNode = targetIterator[i];
      } // end while
      if (flags & USE_FRAGMENT) {
        if (fragment.firstChild) {
          target.insertBefore(fragment.childNodes.length > 1 ? fragment : fragment.firstChild, targetNode);
        }
      }
      this.removeSiblings(targetNode);
      this.mergeAttributes(source, target);
      if ((flags & IGNORE_TEXT) && !source.firstElementChild) {
        target.textContent = source.textContent;
      }
      return target;
    }
  };

  var factory = function() {
    /**
    * expose public API
    */
    var instance = new DomRenderer();
    return {
      render: function( /**Element*/ source, /**Element*/ target, /**Options*/ options) /**Element*/ {
        return instance.render(source, target, (options || {}).flags);
      }
    };
  };
  factory.SHALLOW = SHALLOW;
  factory.IGNORE_COMMENT = IGNORE_COMMENT;
  factory.IGNORE_TEXT = IGNORE_TEXT;
  factory.USE_FRAGMENT = USE_FRAGMENT;

  return factory;
}));
