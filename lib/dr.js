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
    isSameNode: function( /**Element*/ left, /**Element*/ right) {
      return left.namespaceURI === right.namespaceURI && left.localName === right.localName;
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
    * should possible use a documentFragment to speed up dom rendering/modification
    */
    visit: function( /**Element*/ source, /**Element*/ target) /**Element*/ {
      var options = this.options,
        deep = options.deep,
        ignoreComments = options.ignoreComments,
        ownerDocument = target.ownerDocument;
      if (source.nodeType === ELEMENT_NODE) {
        var sourceNode,
          targetNode = target.firstChild,
          currentTarget,
          importedNode,
          i = 0;
        while ((sourceNode = source.childNodes[i++])) {
          currentTarget = targetNode;
          if (ignoreComments) {
            if (sourceNode.nodeType === COMMENT_NODE) {
              continue;
            }
            if (targetNode && targetNode.nodeType === COMMENT_NODE) {
              targetNode = targetNode.nextSibling;
              currentTarget.parentNode.removeChild(currentTarget);
            }
          }
          importedNode = ownerDocument.importNode(sourceNode, !deep);
          if (targetNode) {
            if (!this.isSameNode(importedNode, targetNode) || !importedNode.isEqualNode(targetNode.cloneNode(!deep))) {
              //if (!sourceNode.isEqualNode(targetNode)) {
              target.replaceChild(importedNode, targetNode);
              targetNode = importedNode;
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
          while (targetNode) {
            currentTarget = targetNode.nextSibling;
            targetNode.parentNode.removeChild(targetNode);
            targetNode = currentTarget;
          }
        }
        if (source && target) {
          this.mergeAttributes(source, target);
        }
      } else if (source.nodeType === TEXT_NODE || source.nodeType === COMMENT_NODE) {
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
