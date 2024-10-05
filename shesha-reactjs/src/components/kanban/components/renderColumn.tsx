import React, { useEffect, useState } from 'react';
import { Button, Dropdown, Popconfirm } from 'antd';
import { ReactSortable } from 'react-sortablejs';
import { PlusOutlined, MoreOutlined, RightOutlined, LeftOutlined, SettingFilled } from '@ant-design/icons';
import { ConfigurableForm } from '@/index';
import { MenuProps } from 'antd';
import { Flex } from 'antd';
import { useRefListItemGroupConfigurator } from '@/providers/refList/provider';
import { useKanbanActions } from '../utils';
import { useStyles } from '../styles/styles';

interface KanbanColumnProps {
  column: any;
  columnTasks: any[];
  handleUpdate: (newTasks: any[], columnValue: any) => void;
  onEnd: (evt: any, column: any) => void;
  handleEditClick: (item: any) => void;
  handleDelete: (id: string) => void;
  handleCreateClick: (columnValue: any) => void;
  selectedItem: any;
  collapse: boolean;
  props: any;
}

const RenderColumn: React.FC<KanbanColumnProps> = ({
  column,
  columnTasks,
  collapse,
  selectedItem,
  handleUpdate,
  onEnd,
  handleEditClick,
  handleDelete,
  handleCreateClick,
  props
}) => {
  const {
    modalFormId,
    externaHeaderStyle,   
    readonly,
  } = props;
  
  const [isCollapsed, setIsCollapsed] = useState(collapse);
  const { updateUserSettings } = useKanbanActions();
  const { storeSettings, userSettings } = useRefListItemGroupConfigurator();
  const {styles} = useStyles({props, isCollapsed}); 

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
        [column.itemValue]: newCollapseState,
      };
      updateUserSettings(updatedSettings);
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

  return (
    <>
      {!column.hidden && (
        <div key={column.id} className={isCollapsed ? styles.collapseColumnStyle : styles.combinedColumnStyle} data-column-id={column.id}>
          <Flex justify="space-between" align="center"  className={isCollapsed ? styles.collapsedHeaderStyle : styles.internalHeaderStyle}  style={isCollapsed ?? {...externaHeaderStyle}}>
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
                padding: '10px',
              }}
            >
              {columnTasks.length === 0 ? (
                <div
                  className={styles.noTask}
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
                    <div key={t.id} className={styles.taskContainer} data-id={t.id}>
                      <ConfigurableForm
                        key={selectedItem ? selectedItem.id : 'new-item'}
                        initialValues={t}
                        formId={modalFormId}
                        mode={'readonly'}
                        className={styles.taskContainer}
                      />
                      <Dropdown trigger={['click']} menu={{ items: taskDropdownItems }} placement="bottomRight">
                        <Button type="text" className={`${styles.threeDots} three-dots`} icon={<MoreOutlined />} />
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
