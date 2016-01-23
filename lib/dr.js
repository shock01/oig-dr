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
   * @property {Boolean} useFragment - use documentFragments to append nodes for performance when attached to DOM
   * @default true
   */
  /**
  * internet explorer has some issues with acceptNode
  */
  function filter() {
    return NodeFilter.FILTER_ACCEPT;
  }
  filter.acceptNode = filter;
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
      if (typeof this.options.useFragment !== 'boolean') {
        this.options.useFragment = true;
      }
      if (typeof this.options.ignoreText !== 'boolean') {
        this.options.ignoreText = false;
      }
      if (typeof this.options.ignoreComments !== 'boolean') {
        this.options.ignoreComments = false;
      }
      var sourceElement = typeof source === 'string' ? this.createSourceElementFromString(source) : source,
        targetParent = targetElement.parentNode;

      if (!targetParent) {
        this.options.useFragment = false;
        targetParent = targetElement.ownerDocument.createDocumentFragment();
        targetParent.appendChild(targetElement);
      }
      // should this only be done for ignore text?
      sourceElement.normalize();
      targetElement.normalize();
      console.log(sourceElement.outerHTML);
      console.log(targetElement.outerHTML)
      this.visit(sourceElement, targetElement, targetElement);
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
      if (!(source && target) && (source.nodeType === ELEMENT_NODE && target.nodeType === ELEMENT_NODE)) {
        return;
      }

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
    /**
    * @todo
    * should possibly also have flags for IGNORE_COMMENTS, IGNORE_TEXT (eg. all textNodes should have a parentElement)
    * when IGNORE_COMMENTS AND IGNORE_TEXT we can iterate over the children instead of childNodes which is much faster
    * OIGDomRenderer.Filter.IGNORE_COMMENT = 0x1;
    * OIGDomRenderer.Filter.IGNORE_TEXT = 0x2;
    * OIGDomRenderer.Filter.IGNORE = 0x3; (will do both ignore comments and ignore text)
    * OigDomRenderer.Filter.SHALLOW = 0x8;
    * meaning options will be replaced by filter flags
    */
    visit: function( /**Element*/ source, /**Element*/ target) /**Element*/ {
      var options = this.options,
        deep = options.deep,
        useFragment = options.useFragment,
        ignoreComments = options.ignoreComments,
        ignoreText = options.ignoreText,
        ownerDocument = target.ownerDocument;
      if (source.nodeType === ELEMENT_NODE) {
        var sourceNode,
          targetNode = target.firstChild,
          currentTarget,
          fragment = useFragment ? ownerDocument.createDocumentFragment() : null,
          importedNode,
          sourceIterator = ignoreText ? source.children : source.childNodes,
          targetIterator = ignoreText ? target.children : target.childNodes,
          i = 0;
        while ((sourceNode = sourceIterator[i++])) {
          currentTarget = targetNode;
          if (ignoreComments && sourceNode.nodeType === COMMENT_NODE) {
            continue;
          }
          importedNode = this.importNode(sourceNode, ownerDocument, !deep);
          if (targetNode) {
            if (ignoreComments && targetNode.nodeType === COMMENT_NODE) {
              targetNode = targetNode.nextSibling;
              target.removeChild(currentTarget);
            }
            if (!this.isSameNode(importedNode, targetNode) ||
              !importedNode.isEqualNode(targetNode.cloneNode(!deep))) {
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
            (deep || !sourceNode.isEqualNode(targetNode))) {
            this.visit(sourceNode, targetNode);
          }
          targetNode = targetIterator[i];
        } // end while
        if (fragment) {
          if (fragment.firstChild) {
            target.insertBefore(fragment.childNodes.length > 1 ? fragment : fragment.firstChild, targetNode);
          }
        }
        this.removeSiblings(targetNode);
        this.mergeAttributes(source, target);
        if (ignoreText && !source.firstElementChild) {
          target.textContent = source.textContent;
        }
      } else {
        // equality will not trigger re-rendering for text nodes
        target.textContent = source.textContent;
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
