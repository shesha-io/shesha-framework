import React, { useState } from 'react';
import { Tree, Button, Modal, Input, message, Space, Divider } from 'antd';
import { 
  FolderOutlined, 
  FileOutlined, 
  PlusOutlined, 
  DeleteOutlined, 
  EditOutlined 
} from '@ant-design/icons';

const { DirectoryTree } = Tree;

// Initial tree data structure
const initialTreeData = [
  {
    key: '0',
    title: 'Project',
    icon: <FolderOutlined />,
    isLeaf: false,
    children: [
      {
        key: '0-0',
        title: 'src',
        icon: <FolderOutlined />,
        isLeaf: false,
        children: [
          { key: '0-0-0', title: 'index.js', icon: <FileOutlined />, isLeaf: true },
          { key: '0-0-1', title: 'styles.css', icon: <FileOutlined />, isLeaf: true },
        ],
      },
      {
        key: '0-1',
        title: 'public',
        icon: <FolderOutlined />,
        isLeaf: false,
        children: [
          { key: '0-1-0', title: 'index.html', icon: <FileOutlined />, isLeaf: true },
        ],
      },
      { key: '0-2', title: 'package.json', icon: <FileOutlined />, isLeaf: true },
      { key: '0-3', title: 'README.md', icon: <FileOutlined />, isLeaf: true },
    ],
  },
];

const FileTree = () => {
  const [treeData, setTreeData] = useState(initialTreeData);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [newName, setNewName] = useState('');
  const [modalAction, setModalAction] = useState(''); // 'addFile', 'addFolder', 'rename'

  // Update tree data when dragging is complete
  const onDrop = (info) => {
    const dropKey = info.node.key;
    const dragKey = info.dragNode.key;
    const dropPos = info.node.pos.split('-');
    const dropPosition = info.dropPosition - Number(dropPos[dropPos.length - 1]);
    
    const data = [...treeData];
    
    // Find dragObject
    let dragObj;
    const findDragObj = (arr, key) => {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].key === key) {
          dragObj = arr[i];
          arr.splice(i, 1);
          return true;
        }
        if (arr[i].children && findDragObj(arr[i].children, key)) {
          return true;
        }
      }
      return false;
    };
    
    findDragObj(data, dragKey);
    
    if (!info.dropToGap) {
      // Drop on the content
      const findDropNode = (arr, key) => {
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].key === key) {
            return arr[i];
          }
          if (arr[i].children) {
            const node = findDropNode(arr[i].children, key);
            if (node) return node;
          }
        }
        return null;
      };
      
      const dropNode = findDropNode(data, dropKey);
      if (!dropNode.children) dropNode.children = [];
      dropNode.children.push(dragObj);
    } else {
      // Drop in the gap
      let ar;
      let i;
      const findDropNode = (arr, key, pos, memo) => {
        for (i = 0; i < arr.length; i++) {
          if (arr[i].key === key) {
            memo.node = arr[i];
            memo.index = i;
            memo.arr = arr;
            return true;
          }
          if (arr[i].children && findDropNode(arr[i].children, key, pos, memo)) {
            return true;
          }
        }
        return false;
      };
      
      const memo = { node: null, index: -1, arr: null };
      findDropNode(data, dropKey, dropPosition, memo);
      ar = memo.arr;
      i = memo.index;
      
      if (dropPosition === -1) {
        ar.splice(i, 0, dragObj);
      } else {
        ar.splice(i + 1, 0, dragObj);
      }
    }
    
    setTreeData(data);
    message.success('Item moved successfully');
  };

  // Handle node selection
  const onSelect = (selectedKeys, { node }) => {
    setSelectedNode(node);
  };

  // Show modal for different actions
  const showModal = (action) => {
    if (!selectedNode && action !== 'addRoot') {
      message.warning('Please select a node first');
      return;
    }
    setModalAction(action);
    setNewName('');
    setIsModalVisible(true);
  };

  // Handle modal OK action
  const handleOk = () => {
    if (!newName.trim()) {
      message.warning('Please enter a name');
      return;
    }

    const data = [...treeData];
    
    // Add new file or folder
    if (modalAction === 'addFile' || modalAction === 'addFolder') {
      const isLeaf = modalAction === 'addFile';
      const newNode = {
        key: `${selectedNode.key}-${Date.now()}`,
        title: newName,
        icon: isLeaf ? <FileOutlined /> : <FolderOutlined />,
        isLeaf,
      };
      
      const addNode = (arr, key) => {
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].key === key) {
            if (!arr[i].children) arr[i].children = [];
            arr[i].children.push(newNode);
            return true;
          }
          if (arr[i].children && addNode(arr[i].children, key)) {
            return true;
          }
        }
        return false;
      };
      
      addNode(data, selectedNode.key);
      setTreeData(data);
      message.success(`${isLeaf ? 'File' : 'Folder'} created successfully`);
    } 
    // Rename node
    else if (modalAction === 'rename') {
      const renameNode = (arr, key) => {
        for (let i = 0; i < arr.length; i++) {
          if (arr[i].key === key) {
            arr[i].title = newName;
            return true;
          }
          if (arr[i].children && renameNode(arr[i].children, key)) {
            return true;
          }
        }
        return false;
      };
      
      renameNode(data, selectedNode.key);
      setTreeData(data);
      message.success('Item renamed successfully');
    }
    // Add root folder
    else if (modalAction === 'addRoot') {
      const newRoot = {
        key: `root-${Date.now()}`,
        title: newName,
        icon: <FolderOutlined />,
        isLeaf: false,
        children: [],
      };
      data.push(newRoot);
      setTreeData(data);
      message.success('Root folder created successfully');
    }
    
    setIsModalVisible(false);
    setNewName('');
  };

  // Handle modal cancel
  const handleCancel = () => {
    setIsModalVisible(false);
    setNewName('');
  };

  // Delete selected node
  const deleteNode = () => {
    if (!selectedNode) {
      message.warning('Please select a node to delete');
      return;
    }

    const data = [...treeData];
    const deleteNodeRecursive = (arr, key) => {
      for (let i = 0; i < arr.length; i++) {
        if (arr[i].key === key) {
          arr.splice(i, 1);
          return true;
        }
        if (arr[i].children && deleteNodeRecursive(arr[i].children, key)) {
          return true;
        }
      }
      return false;
    };
    
    deleteNodeRecursive(data, selectedNode.key);
    setTreeData(data);
    setSelectedNode(null);
    message.success('Item deleted successfully');
  };

  // Get modal title based on action
  const getModalTitle = () => {
    switch (modalAction) {
      case 'addFile': return 'Add New File';
      case 'addFolder': return 'Add New Folder';
      case 'rename': return 'Rename Item';
      case 'addRoot': return 'Add Root Folder';
      default: return 'Modal';
    }
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '0 auto', 
      background: 'white', 
      padding: '24px', 
      borderRadius: '8px', 
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' 
    }}>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <h1>File Explorer</h1>
        <p>Drag and drop to organize files and folders</p>
      </div>
      
      <div style={{ border: '1px solid #d9d9d9', borderRadius: '6px', padding: '16px', background: 'white' }}>
        <DirectoryTree
          className="draggable-tree"
          draggable
          blockNode
          onDrop={onDrop}
          onSelect={onSelect}
          treeData={treeData}
          defaultExpandAll
        />
      </div>
      
      <Divider />
      
      <div style={{ marginTop: '16px', display: 'flex', gap: '8px', justifyContent: 'center' }}>
        <Space wrap>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => showModal('addRoot')}
          >
            Add Root Folder
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => showModal('addFile')}
            disabled={!selectedNode}
          >
            Add File
          </Button>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => showModal('addFolder')}
            disabled={!selectedNode}
          >
            Add Folder
          </Button>
          <Button 
            icon={<EditOutlined />} 
            onClick={() => showModal('rename')}
            disabled={!selectedNode}
          >
            Rename
          </Button>
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            onClick={deleteNode}
            disabled={!selectedNode}
          >
            Delete
          </Button>
        </Space>
      </div>
      
      <Modal
        title={getModalTitle()}
        open={isModalVisible}
        onOk={handleOk}
        onCancel={handleCancel}
      >
        <Input
          placeholder={`Enter ${modalAction === 'addFile' ? 'file' : 'folder'} name`}
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          onPressEnter={handleOk}
          autoFocus
        />
      </Modal>
    </div>
  );
};

export default FileTree;