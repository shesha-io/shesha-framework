import React, { useState } from 'react';
import {
    Tree,
    Button,
    Modal,
    Input,
    message,
    Space,
    Divider,
    Alert,
    ConfigProvider,
    TreeProps
} from 'antd';
import {
    FolderOutlined,
    FileOutlined,
    PlusOutlined,
    DeleteOutlined,
    EditOutlined,
    InfoCircleOutlined
} from '@ant-design/icons';

const { DirectoryTree } = Tree;

type AllowDrop = TreeProps['allowDrop'];

// Initial tree data structure
const initialTreeData = [
    {
        key: 'root',
        title: 'Project',
        icon: <FolderOutlined />,
        isLeaf: false,
        children: [
            {
                key: 'src',
                title: 'src',
                icon: <FolderOutlined />,
                isLeaf: false,
                children: [
                    { key: 'index-js', title: 'index.js', icon: <FileOutlined />, isLeaf: true },
                    { key: 'styles-css', title: 'styles.css', icon: <FileOutlined />, isLeaf: true },
                ],
            },
            {
                key: 'public',
                title: 'public',
                icon: <FolderOutlined />,
                isLeaf: false,
                children: [
                    { key: 'index-html', title: 'index.html', icon: <FileOutlined />, isLeaf: true },
                ],
            },
            { key: 'package-json', title: 'package.json', icon: <FileOutlined />, isLeaf: true },
            { key: 'readme-md', title: 'README.md', icon: <FileOutlined />, isLeaf: true },
        ],
    },
];

// Custom theme configuration
const theme = {
    token: {
        colorPrimary: '#1890ff',
        colorBgContainer: '#ffffff',
        colorBorder: '#d9d9d9',
        colorText: '#314659',
        colorTextHeading: '#0d1a26',
    },
    components: {
        Tree: {
            directoryNodeSelectedColor: '#1890ff',
            directoryNodeSelectedBg: '#e6f7ff',
        },
    },
};

type DragState = {
    sourceKey: string;
    targetKey: string;
    dropPosition: number;
};

const FileTree = () => {
    const [treeData, setTreeData] = useState(initialTreeData);
    const [selectedNode, setSelectedNode] = useState(null);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [newName, setNewName] = useState('');
    const [dragState, setDragState] = useState<DragState>(undefined);
    
    const [modalAction, setModalAction] = useState(''); // 'addFile', 'addFolder', 'rename'

    // Function to find a node by key in the tree
    const findNode = (arr, key) => {
        for (let i = 0; i < arr.length; i++) {
            if (arr[i].key === key) {
                return { node: arr[i], parent: arr, index: i };
            }
            if (arr[i].children) {
                const result = findNode(arr[i].children, key);
                if (result) return result;
            }
        }
        return null;
    };

    // Function to get the parent key of a node
    const getParentKey = (key, tree) => {
        for (let i = 0; i < tree.length; i++) {
            const node = tree[i];
            if (node.children) {
                if (node.children.some(item => item.key === key)) {
                    return node.key;
                }
                const parentKey = getParentKey(key, node.children);
                if (parentKey) return parentKey;
            }
        }
        return null;
    };

    // Check if a drop is valid (only files can be moved, only into folders)
    const isValidDrop = (dragNode, dropNode, dropPosition) => {
        // Don't allow dropping into the same folder
        if (dropPosition === 0 && dragNode.parentKey === dropNode.key) {
            return false;
        }

        // Only allow dropping files (not folders)
        if (dragNode.isLeaf === false) {
            return false;
        }

        // Only allow dropping into folders (not onto files)
        if (dropPosition === 0 && dropNode.isLeaf) {
            return false;
        }

        // Don't allow dropping between files in the same folder (reordering)
        if (dropPosition !== 0 && dragNode.parentKey === getParentKey(dropNode.key, treeData)) {
            return false;
        }

        return true;
    };

    // Update tree data when dragging is complete
    const onDrop = (info) => {
        const { node: dropNode, dragNode, dropPosition, dropToGap } = info;

        if (!isValidDrop(dragNode, dropNode, dropPosition)) {
            message.error('Invalid move. You can only move files between folders.');
            return;
        }

        const dragKey = dragNode.key;
        const data = [...treeData];

        // Find dragObject and remove it from current position
        let dragObj;
        const findDragObj = (arr, key) => {
            for (let i = 0; i < arr.length; i++) {
                if (arr[i].key === key) {
                    dragObj = { ...arr[i] };
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

        if (dropPosition === 0) {
            // Drop on a folder node
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

            const targetNode = findDropNode(data, dropNode.key);
            if (!targetNode.children) targetNode.children = [];
            targetNode.children.push(dragObj);
            // Sort children by title (name)
            targetNode.children.sort((a, b) => a.title.localeCompare(b.title));
        } else {
            // Drop in a gap (between nodes)
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
            findDropNode(data, dropNode.key, dropPosition, memo);
            ar = memo.arr;
            i = memo.index;

            if (dropPosition === -1) {
                ar.splice(i, 0, dragObj);
            } else {
                ar.splice(i + 1, 0, dragObj);
            }
        }

        setTreeData(data);
        message.success('File moved successfully');
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
                        // Sort children by title (name)
                        arr[i].children.sort((a, b) => a.title.localeCompare(b.title));
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

    const allowDrop: AllowDrop = ({ dragNode, dropNode, dropPosition }) => {
        const dragNodeParentKey = getParentKey(dragNode, treeData);

        setDragState({
            dragNode,
            dropNode,
            dropPosition
        });

        let result = true;
        // Don't allow dropping into the same folder
        if (dropPosition === 0 && /*dragNode.parentKey*/dragNodeParentKey === dropNode.key) {
            result = false;
            //return false;
        }

        // Only allow dropping files (not folders)
        if (dragNode.isLeaf === false) {
            result = false;
            //return false;
        }

        // Only allow dropping into folders (not onto files)
        if (dropPosition === 0 && dropNode.isLeaf) {
            result = false;
            //return false;
        }

        // Don't allow dropping between files in the same folder (reordering)
        if (dropPosition !== 0 && /*dragNode.parentKey*/dragNodeParentKey === getParentKey(dropNode.key, treeData)) {
            result = false;
            //return false;
        }
        console.log('LOG: drag', {
            result,
            dropPosition,
            dragNodeParentKey,
            dropNodeKey: dropNode.key
        });


        return result;
    };

    return (
        <ConfigProvider theme={theme}>
            <div style={{
                maxWidth: '800px',
                margin: '0 auto',
                background: 'white',
                padding: '24px',
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
            }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                    <h1>File Explorer with Drag & Drop</h1>
                    <p>Move files between folders (files are always ordered by name)</p>
                </div>

                <div style={{
                    backgroundColor: '#f9f9f9',
                    padding: '12px',
                    borderRadius: '6px',
                    marginBottom: '16px',
                    borderLeft: '4px solid #1890ff'
                }}>
                    <Alert
                        message="Drag & Drop Rules"
                        description="You can move files between folders, but files are always ordered by name within folders. You cannot reorder files within the same folder."
                        type="info"
                        showIcon
                        icon={<InfoCircleOutlined />}
                    />
                </div>

                <div style={{
                    border: '1px solid #d9d9d9',
                    borderRadius: '6px',
                    padding: '16px',
                    background: 'white',
                    minHeight: '300px'
                }}>
                    <Tree
                        className="draggable-tree"
                        draggable
                        blockNode
                        onDrop={onDrop}
                        onSelect={onSelect}
                        treeData={treeData}
                        allowDrop={allowDrop}
                        defaultExpandAll
                    />
                </div>

                <Divider />

                <div style={{
                    marginTop: '16px',
                    display: 'flex',
                    gap: '8px',
                    justifyContent: 'center'
                }}>
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
                            disabled={!selectedNode || selectedNode.isLeaf}
                        >
                            Add File
                        </Button>
                        <Button
                            type="primary"
                            icon={<PlusOutlined />}
                            onClick={() => showModal('addFolder')}
                            disabled={!selectedNode || selectedNode.isLeaf}
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
        </ConfigProvider>
    );
};

export default FileTree;