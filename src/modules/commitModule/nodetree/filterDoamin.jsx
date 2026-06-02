import Tree from 'rc-tree';
import React from 'react'

/**
 * FilterDoamin
 * -------------
 * A read-only, checkable tree that displays ONLY the nodes whose `key` is
 * present in `pathsToDisplay`. It is used to show a filtered slice of a larger
 * domain hierarchy (e.g. only the branches relevant to the current document)
 * instead of the full tree.
 *
 * The actual filtering/rendering is delegated to `renderMatchingNodes` (below).
 *
 * @param {Object}   props
 * @param {Array}    props.treeData        - Full hierarchical node list. Each node is
 *                                           `{ key, title, children? }`.
 * @param {string[]} props.pathsToDisplay  - Keys of the nodes that should remain visible.
 * @param {Function} [props.onCheck]       - Optional callback invoked when the user
 *                                           checks/unchecks a node. Receives
 *                                           `(checkedKeys, event)`. Safe to omit.
 * @returns {JSX.Element} The rendered rc-tree.
 */
const FilterDoamin = ({ treeData, pathsToDisplay, onCheck }) => {
  /**
   * Local guard around the optional `onCheck` prop. rc-tree always calls
   * `onCheck`, so we forward to the parent only when a handler was supplied,
   * preventing a crash when the component is used purely for display.
   *
   * @param {string[]} checkedKeys - Keys currently checked in the tree.
   * @param {Object}   e           - rc-tree check event (includes `checkedNodes`).
   * @returns {void}
   */
  const handleCheck = (checkedKeys, e) => {
    if (typeof onCheck === 'function') {
      onCheck(checkedKeys, e);
    }
  };

  return (
    <Tree
      checkable
      showLine={true}
      defaultExpandAll={true}
      onCheck={handleCheck}
    >
      {renderMatchingNodes(treeData, pathsToDisplay)}
    </Tree>
  );
}

/**
 * renderMatchingNodes
 * -------------------
 * Recursively walks `treeData` and returns `<Tree.TreeNode>` elements only for
 * nodes whose `key` exists in `pathsToDisplay`. Non-matching nodes are skipped
 * (returned as `null`), so the resulting tree contains just the requested paths.
 *
 * Recursion: when a matching node has children, the same filter is applied to
 * the children, allowing nested matches to be preserved.
 *
 * @param {Array}    treeData       - Nodes to evaluate at the current depth.
 * @param {string[]} pathsToDisplay - Keys allowed to be rendered.
 * @returns {Array<JSX.Element|null>} Tree nodes for matches, `null` for the rest.
 */
export function renderMatchingNodes(treeData, pathsToDisplay) {
  return treeData.map(node => {
    const isMatching = pathsToDisplay.includes(node.key);

    // If the current node matches one of the paths in pathsToDisplay, render it
    if (isMatching) {
      return (
        <Tree.TreeNode
          key={node.key}
          title={node.title}
        >
          {node.children && node.children.length > 0
            ? renderMatchingNodes(node.children, pathsToDisplay)
            : null
          }
        </Tree.TreeNode>
      );
    }
    return null; // If the node doesn't match, return null
  });
}

export default FilterDoamin