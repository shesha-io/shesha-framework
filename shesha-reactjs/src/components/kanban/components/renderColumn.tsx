import React, { useEffect, useState } from 'react';
import { Button, Dropdown, Popconfirm } from 'antd';
import { ReactSortable } from 'react-sortablejs';
import { PlusOutlined, MoreOutlined, RightOutlined, LeftOutlined, SettingFilled } from '@ant-design/icons';
import { ConfigurableForm, useMutate } from '@/index';
import { MenuProps } from 'antd';
import { Flex } from 'antd';
import { CSSProperties } from 'react';
import { useRefListItemGroupConfigurator } from '@/providers/refList/provider';

interface KanbanColumnProps {
  column: any;
  columnTasks: any[];
  groupingProperty: string;
  readonly: boolean;
  externalColumnStyle: CSSProperties;
  newHeaderStyle: CSSProperties;
  handleUpdate: (newTasks: any[], columnValue: any) => void;
  onEnd: (evt: any, column: any) => void;
  handleEditClick: (item: any) => void;
  handleDelete: (id: string) => void;
  handleCreateClick: (columnValue: any) => void;
  styles: any;
  selectedItem: any;
  modalFormId: string;
  collapse: boolean;
}

const RenderColumn: React.FC<KanbanColumnProps> = ({
  column,
  columnTasks,
  readonly,
  externalColumnStyle,
  newHeaderStyle,
  handleUpdate,
  onEnd,
  handleEditClick,
  handleDelete,
  handleCreateClick,
  collapse,
  styles,
  selectedItem,
  modalFormId,
}) => {
  const { mutate } = useMutate<any>();
  const [isCollapsed, setIsCollapsed] = useState(collapse);
  const { storeSettings, userSettings } = useRefListItemGroupConfigurator();

  // Initialize collapse state from props
  useEffect(() => {
    setIsCollapsed(collapse);
  }, [collapse]);

  // Update user settings and persist to backend
  const toggleFold = async () => {
    try {
      const newCollapseState = !isCollapsed;
      
      // First update the local state
      setIsCollapsed(newCollapseState);
      
      // Update the settings in the provider
      await storeSettings(column.itemValue, newCollapseState);
      
      const updatedSettings = {
        ...userSettings,
        [column.itemValue]: newCollapseState
      };
      
      // Serialize the updated settings
      const serializedSettings = JSON.stringify(updatedSettings);
      
      await mutate(
        { 
          url: '/api/services/app/Settings/UpdateUserValue', 
          httpVerb: 'POST' 
        },
        {
          name: 'mSettings',
          module: 'Shesha',
          value: serializedSettings,
          datatype: 'string',
        }
      );
    } catch (error) {
      console.error('Error updating collapse state:', error);
      // Revert local state if persistence fails
      setIsCollapsed(!isCollapsed);
    }
  };
  
  const columnDropdownItems: MenuProps['items'] = [
    {
      key: '1',
      label: 'Add',
      onClick: () => handleCreateClick(column.itemValue),
      icon: <PlusOutlined />,
    },
    {
      key: '2',
      label: isCollapsed ? 'Uncollapse' : 'Collapse',
      onClick: toggleFold,
      icon: isCollapsed ? <RightOutlined /> : <LeftOutlined />,
    },
  ];

  const columnStyle: CSSProperties = {
    flex: '1 0 100px',
    justifyContent: 'space-between',
    margin: '0 10px',
    padding: '0px',
    border: '1px solid #ddd',
    marginBottom: '10px',
    backgroundColor: '#f5f5f5',
    transition: 'transform 0.5s ease, width 0.5s ease',
    boxSizing: 'border-box',
    width: '250px',
    maxWidth: '250px',
    height: '400px',
    display: 'flex',
    flexDirection: 'column',
    scrollbarWidth: 'none',
    msOverflowStyle: 'none',
    ...externalColumnStyle,
  };

  const collapseColumnStyle: CSSProperties = {
    ...columnStyle,
    width: 40,
    backgroundColor: '#f0f0f0',
    transition: 'transform 0.5s ease, width 0.5s ease',
    position: 'relative',
    flex: '0 0 auto',
  };

  const headerStyle: CSSProperties = {
    ...newHeaderStyle,
    writingMode: 'vertical-rl',
    transform: 'rotate(180deg)',
    textAlign: 'center',
    width: '45px',
    height: '100%',
    padding: '10px 0',
    transition: 'transform 0.5s ease, width 0.5s ease',
  };

  return (
    <>
      {!column.hidden && (
        <div key={column.id} style={isCollapsed ? collapseColumnStyle : columnStyle} data-column-id={column.id}>
          <Flex justify="space-between" align="center" style={isCollapsed ? headerStyle : newHeaderStyle}>
            <h3>
              {column.item} ({columnTasks.length})
            </h3>
            <Flex align="center">
              <Dropdown trigger={['click']} menu={{ items: columnDropdownItems }} placement="bottomRight">
                <Button type="text" icon={<SettingFilled />} />
              </Dropdown>
            </Flex>
          </Flex>

          {!isCollapsed && (
            <ReactSortable
              list={columnTasks}
              setList={(newTasks) => handleUpdate(newTasks, column)}
              fallbackOnBody={true}
              swapThreshold={0.5}
              group={{ name: 'tasksGroup', pull: true, put: true }}
              sort={true}
              animation={75}
              ghostClass="task-item-ghost"
              emptyInsertThreshold={20}
              scroll={true}
              bubbleScroll={true}
              disabled={readonly}
              onEnd={(evt) => onEnd(evt, column)}
              className={styles.container}
              style={{
                flex: '1 1 auto',
                overflowY: 'auto',
                minHeight: 200,
                maxHeight: 300,
                padding: '10px',
                border: '1px solid red',
              }}
            >
              {columnTasks.length === 0 ? (
                <div
                  style={{
                    textAlign: 'center',
                    color: '#999',
                    padding: '20px',
                    border: '1px dashed #d9d9d9',
                    borderRadius: '5px',
                  }}
                >
                  No Item Found
                </div>
              ) : (
                columnTasks.map((t) => {
                  const taskDropdownItems: MenuProps['items'] = [
                    {
                      key: '1',
                      label: 'Edit',
                      onClick: () => handleEditClick(t),
                    },
                    {
                      key: '2',
                      label: (
                        <Popconfirm
                          title="Are you sure you want to delete this item?"
                          onConfirm={() => handleDelete(t.id)}
                          okText="Yes"
                          cancelText="No"
                        >
                          Delete
                        </Popconfirm>
                      ),
                    },
                  ];
                  return (
                    <div key={t.id} className={styles.container} data-id={t.id}>
                      <ConfigurableForm
                        key={selectedItem ? selectedItem.id : 'new-item'}
                        initialValues={t}
                        formId={modalFormId}
                        mode={'readonly'}
                        className={styles.container}
                      />
                      <Dropdown trigger={['click']} menu={{ items: taskDropdownItems }} placement="bottomRight">
                        <Button type="text" className={`${styles.threeDotsStyle} three-dots`} icon={<MoreOutlined />} />
                      </Dropdown>
                    </div>
                  );
                })
              )}
            </ReactSortable>
          )}
        </div>
      )}
    </>
  );
};

export default RenderColumn;