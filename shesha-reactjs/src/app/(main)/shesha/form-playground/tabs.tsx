import React, { useState, useRef } from 'react';
import { Tabs, Dropdown, Button, message, Modal, Input } from 'antd';
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  CopyOutlined,
  MoreOutlined
} from '@ant-design/icons';

const TabContextMenuExample = () => {
  const [activeKey, setActiveKey] = useState('1');
  const [tabs, setTabs] = useState([
    { key: '1', label: 'Tab 1', content: 'Content of Tab 1' },
    { key: '2', label: 'Tab 2', content: 'Content of Tab 2' },
    { key: '3', label: 'Tab 3', content: 'Content of Tab 3' },
  ]);
  const [editingTab, setEditingTab] = useState(null);
  const [editTitle, setEditTitle] = useState('');
  const [contextMenuVisible, setContextMenuVisible] = useState(false);
  const [contextMenuPosition, setContextMenuPosition] = useState({ x: 0, y: 0 });
  const [selectedTabKey, setSelectedTabKey] = useState(null);

  // Function to handle context menu
  const handleContextMenu = (e, tabKey) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedTabKey(tabKey);
    setContextMenuPosition({ x: e.clientX, y: e.clientY });
    setContextMenuVisible(true);
  };

  // Function to add a new tab
  const addTab = () => {
    const newKey = `${tabs.length + 1}`;
    const newTab = {
      key: newKey,
      label: `Tab ${newKey}`,
      content: `Content of Tab ${newKey}`
    };
    setTabs([...tabs, newTab]);
    setActiveKey(newKey);
    message.success(`Added new tab: Tab ${newKey}`);
  };

  // Function to edit a tab
  const editTab = (tabKey) => {
    const tab = tabs.find(t => t.key === tabKey);
    if (tab) {
      setEditingTab(tabKey);
      setEditTitle(tab.label);
    }
    setContextMenuVisible(false);
  };

  // Function to save edited tab title
  const saveEdit = () => {
    setTabs(tabs.map(tab => 
      tab.key === editingTab ? { ...tab, label: editTitle } : tab
    ));
    setEditingTab(null);
    setEditTitle('');
    message.success('Tab title updated');
  };

  // Function to duplicate a tab
  const duplicateTab = (tabKey) => {
    const tab = tabs.find(t => t.key === tabKey);
    if (tab) {
      const newKey = `${Date.now()}`;
      const newTab = {
        key: newKey,
        label: `${tab.label} (Copy)`,
        content: tab.content
      };
      setTabs([...tabs, newTab]);
      setActiveKey(newKey);
      message.success(`Duplicated tab: ${tab.label}`);
    }
    setContextMenuVisible(false);
  };

  // Function to close a tab
  const closeTab = (tabKey) => {
    if (tabs.length <= 1) {
      message.error('Cannot close the only tab');
      setContextMenuVisible(false);
      return;
    }
    
    const tabIndex = tabs.findIndex(tab => tab.key === tabKey);
    const newTabs = tabs.filter(tab => tab.key !== tabKey);
    
    setTabs(newTabs);
    
    // If the closed tab was active, activate the next one
    if (tabKey === activeKey) {
      const newActiveKey = tabIndex > 0 ? tabs[tabIndex - 1].key : newTabs[0].key;
      setActiveKey(newActiveKey);
    }
    
    message.success('Tab closed');
    setContextMenuVisible(false);
  };

  // Function to close other tabs
  const closeOtherTabs = (tabKey) => {
    const tabToKeep = tabs.find(tab => tab.key === tabKey);
    setTabs([tabToKeep]);
    setActiveKey(tabKey);
    message.info('Closed other tabs');
    setContextMenuVisible(false);
  };

  // Context menu items
  const getContextMenuItems = (tabKey) => [
    {
      key: 'edit',
      label: 'Edit',
      icon: <EditOutlined />,
      onClick: () => editTab(tabKey)
    },
    {
      key: 'duplicate',
      label: 'Duplicate',
      icon: <CopyOutlined />,
      onClick: () => duplicateTab(tabKey)
    },
    {
      type: 'divider'
    },
    {
      key: 'close',
      label: 'Close',
      icon: <DeleteOutlined />,
      onClick: () => closeTab(tabKey)
    },
    {
      key: 'closeOthers',
      label: 'Close Others',
      icon: <DeleteOutlined />,
      onClick: () => closeOtherTabs(tabKey)
    }
  ];

  // Create tab items with custom label rendering for context menu
  const tabItems = tabs.map(tab => ({
    key: tab.key,
    icon: <DeleteOutlined />,
    label: (
      <div 
        className="tab-label"
        onContextMenu={(e) => handleContextMenu(e, tab.key)}
      >
        {editingTab === tab.key ? (
          <Input
            size="small"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onBlur={saveEdit}
            onPressEnter={saveEdit}
            autoFocus
            className="tab-edit-input"
          />
        ) : (
          <>
            <span>{tab.label}</span>
            <MoreOutlined className="tab-menu-icon" />
          </>
        )}
      </div>
    ),
    children: (
      <div className="tab-content">
        <h3>{tab.label}</h3>
        <p>{tab.content}</p>
      </div>
    )
  }));

  return (
    <div className="tabs-container">
      <div className="tabs-header">
        <h2>AntD Tabs with Context Menu (Using items Prop)</h2>
        <p>Right-click on any tab to see the context menu options</p>
        <Button 
          type="primary" 
          icon={<PlusOutlined />} 
          onClick={addTab}
          className="add-tab-btn"
        >
          Add Tab
        </Button>
      </div>

      <div className="tabs-wrapper">
        <Tabs
          type="card"
          activeKey={activeKey}
          onChange={setActiveKey}
          items={tabItems}
          className="custom-tabs"
          hideAdd
        />
      </div>

      {/* Context Menu */}
      {contextMenuVisible && (
        <Dropdown
          open={contextMenuVisible}
          onOpenChange={(visible) => setContextMenuVisible(visible)}
          menu={{
            items: getContextMenuItems(selectedTabKey)
          }}
          trigger={['contextMenu']}
          align={{ points: ['tl', 'tr'] }}
        >
          <div
            style={{
              position: 'fixed',
              left: contextMenuPosition.x,
              top: contextMenuPosition.y,
              width: 1,
              height: 1,
            }}
          />
        </Dropdown>
      )}

      <Modal
        title="Edit Tab Title"
        open={!!editingTab}
        onOk={saveEdit}
        onCancel={() => setEditingTab(null)}
      >
        <Input
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          onPressEnter={saveEdit}
          autoFocus
          className="modal-edit-input"
        />
      </Modal>
    </div>
  );
};

export default TabContextMenuExample;