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
      false)
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
      var sourceElement;
      if (typeof source === 'string') {
        sourceElement = this.createSourceElementFromString(source);
      } else {
        sourceElement = source;
      }
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
      var attrs = {},
        sourceAttributes = source.attributes,
        targetAttributes = target.attributes,
        i = sourceAttributes.length,
        j;

      while (i--) {
        var attr = sourceAttributes[i];
        if (target.getAttribute(attr.name) !== attr.value) {
          target.setAttributeNS(attr.namespaceURI, attr.name, attr.value);
        }
        attrs[attr.name] = attr;
      }
      j = targetAttributes.length;
      while (j--) {
        var attr = targetAttributes[j];
        !(attrs.hasOwnProperty(attr.name)) && target.removeAttributeNS(attr.namespaceURI, attr.name);
      }
    },
    visit: function( /**Element*/ target, /**TreeWalker*/ sourceWalker, /**TreeWalker*/ targetWalker) {
      var targetDocument = this.targetDocument,
        sourceNode, targetNode;
      // we some how have to check the parentNode
      sourceNode = sourceWalker.nextNode();
      targetNode = targetWalker.nextNode();

      if (sourceNode) {
        if (targetNode === null) {
          // adding a new child and setting the targetNode to the targetWalker.nextNode
          target.appendChild(sourceNode.cloneNode(true));
          //targetWalker.nextNode();
          targetNode = targetWalker.nextNode();
        } else {
          if (targetNode.nodeType === sourceNode.nodeType) {
            // textNode
            if (targetNode.nodeType === TEXT_NODE) {
              if (targetNode.nodeValue !== sourceNode.nodeValue) {
                targetNode.nodeValue = sourceNode.nodeValue;
              }
            } else if (targetNode.nodeType === ELEMENT_NODE) {
              // same nodeName
              if (targetNode.nodeName === sourceNode.nodeName && targetNode.namespaceURI === sourceNode.namespaceURI) {
                if (!targetNode.isEqualNode(sourceNode)) {
                  this.mergeNode(sourceNode, targetNode);
                }
              } else {
                // different element node
                targetWalker.nextNode();
                targetNode.parentNode.replaceChild(sourceNode.cloneNode(true), targetNode);
                // reset the treeWalker to previous to continue walking
                targetNode = targetWalker.previousNode();
              }
            } else {
              // different node type (eg. TEXT_NODE instead of ELEMENT_NODE)
              targetWalker.nextNode();
              targetNode.parentNode.replaceChild(sourceNode.cloneNode(true), targetNode);
              // reset the treeWalker to previous to continue walking
              targetNode = targetWalker.previousNode();
            }
          }
        }
        // we need to have the correct parent
        // how to know to use target or targetNode
        if (targetNode) {
          if (targetNode.nextSibling) {
            // the parent still has elements
            this.visit(targetNode.parentNode, sourceWalker, targetWalker);
          } else if (targetNode.parentNode.parentNode) {
            // no elements move beacj to the parent
            this.visit(targetNode.parentNode.parentNode, sourceWalker, targetWalker);
          } else {
            // will move to next using treeWalker
            this.visit(target, sourceWalker, targetWalker);
          }
        }
      } else {
        if (targetNode) {
          var nodes = [], i;
          do {
            nodes.push(targetNode);
          } while ((targetNode = targetWalker.nextNode()) !== null)
          for (var i = 0, node; (node = nodes[i++]);) {
            node.parentNode.removeChild(node);
          }
        }
      }
    }
  };

  return DomRenderer;

}));
