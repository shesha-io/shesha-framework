import React, { useState, useRef, useEffect } from 'react';
import { Tree } from 'antd';
import type { TreeDataNode, TreeProps } from 'antd';

interface EnhancedTreeProps extends TreeProps {
  treeData: TreeDataNode[];
}

const KeyboardTree: React.FC<EnhancedTreeProps> = ({ treeData, ...props }) => {
  const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);
  const [focusedKey, setFocusedKey] = useState<React.Key | null>(null);
  const treeRef = useRef<any>(null);

  // Flatten the tree for easier navigation
  const flattenTree = (nodes: TreeDataNode[], result: TreeDataNode[] = []) => {
    nodes.forEach(node => {
      result.push(node);
      if (node.children && expandedKeys.includes(node.key)) {
        flattenTree(node.children, result);
      }
    });
    return result;
  };

  // Get all visible nodes
  const getVisibleNodes = () => flattenTree(treeData);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const visibleNodes = getVisibleNodes();
    if (visibleNodes.length === 0) return;

    const currentIndex = focusedKey 
      ? visibleNodes.findIndex(node => node.key === focusedKey)
      : -1;

    let newFocusedKey: React.Key | null = null;
    let newExpandedKeys = [...expandedKeys];
    let newSelectedKeys = [...selectedKeys];

    switch (e.key) {
      case 'ArrowDown':
        if (currentIndex < visibleNodes.length - 1) {
          newFocusedKey = visibleNodes[currentIndex + 1].key;
        }
        break;

      case 'ArrowUp':
        if (currentIndex > 0) {
          newFocusedKey = visibleNodes[currentIndex - 1].key;
        }
        break;

      case 'ArrowRight':
        if (currentIndex >= 0) {
          const currentNode = visibleNodes[currentIndex];
          if (currentNode.children && !expandedKeys.includes(currentNode.key)) {
            newExpandedKeys = [...expandedKeys, currentNode.key];
            setExpandedKeys(newExpandedKeys);
          }
        }
        break;

      case 'ArrowLeft':
        if (currentIndex >= 0) {
          const currentNode = visibleNodes[currentIndex];
          if (currentNode.children && expandedKeys.includes(currentNode.key)) {
            newExpandedKeys = expandedKeys.filter(key => key !== currentNode.key);
            setExpandedKeys(newExpandedKeys);
          }
        }
        break;

      case 'Enter':
        if (focusedKey) {
          newSelectedKeys = [focusedKey];
          setSelectedKeys(newSelectedKeys);
        }
        break;

      case 'Home':
        newFocusedKey = visibleNodes[0].key;
        break;

      case 'End':
        newFocusedKey = visibleNodes[visibleNodes.length - 1].key;
        break;

      default:
        return;
    }

    if (newFocusedKey !== null) {
      e.preventDefault();
      setFocusedKey(newFocusedKey);
      
      // Scroll to the focused node
      setTimeout(() => {
        const nodeElement = document.querySelector(`[data-key="${newFocusedKey}"]`);
        nodeElement?.scrollIntoView({ block: 'nearest' });
      }, 0);
    }
  };

  // Set initial focus if nothing is focused
  useEffect(() => {
    if (!focusedKey && treeData.length > 0) {
      setFocusedKey(treeData[0].key);
    }
  }, [treeData, focusedKey]);

  return (
    <div 
      onKeyDown={handleKeyDown}
      tabIndex={0}
      style={{ outline: 'none' }}
    >
      <Tree
        ref={treeRef}
        treeData={treeData}
        expandedKeys={expandedKeys}
        selectedKeys={selectedKeys}
        onExpand={keys => setExpandedKeys(keys as React.Key[])}
        onSelect={keys => setSelectedKeys(keys)}
        titleRender={(nodeData) => (
          <div 
            data-key={nodeData.key}
            style={{
              padding: '4px 8px',
              backgroundColor: focusedKey === nodeData.key ? '#e6f7ff' : 'transparent',
              borderRadius: 4
            }}
          >
            {typeof(nodeData.title) !== 'function' ? nodeData.title : '-'}
          </div>
        )}
        {...props}
      />
    </div>
  );
};

export default KeyboardTree;