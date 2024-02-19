import Tree from 'rc-tree';
import React from 'react'

const FilterDoamin = ({ treeData, pathsToDisplay }) => {
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