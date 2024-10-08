import React, { useEffect, useState } from 'react';
import { Button, Dropdown, Popconfirm } from 'antd';
import { ReactSortable } from 'react-sortablejs';
import { PlusOutlined, MoreOutlined, RightOutlined, LeftOutlined, SettingFilled } from '@ant-design/icons';
import { ConfigurableForm, getStyle, IconPicker, useFormData } from '@/index';
import { MenuProps } from 'antd';
import { Flex } from 'antd';
import { useRefListItemGroupConfigurator } from '@/providers/refList/provider';
import { useKanbanActions } from '../utils';
import { useStyles } from '../styles/styles';
import { addPx } from '@/designer-components/button/util';

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
  props,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(collapse);
  const { updateUserSettings } = useKanbanActions();
  const { storeSettings, userSettings } = useRefListItemGroupConfigurator();
  const { styles } = useStyles({ ...props, isCollapsed });
  const { data: formData } = useFormData();

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
      updateUserSettings(updatedSettings, props.componentName);
    } catch (error) {
      console.error('Error updating collapse state:', error);
      // Revert local state if persistence fails
      setIsCollapsed(!isCollapsed);
    }
  };

  const columnDropdownItems: MenuProps['items'] = [
    props.allowNewRecord && {
      key: '1',
      label: 'Add',
      onClick: () => handleCreateClick(column.itemValue),
      icon: <PlusOutlined />,
    },
    props.collapsible && {
      key: '2',
      label: isCollapsed ? 'Uncollapse' : 'Collapse',
      onClick: toggleFold,
      icon: isCollapsed ? <RightOutlined /> : <LeftOutlined />,
    },
  ].filter(Boolean); // Filter out any items that are `false` or `undefined`
  
  return (
    <>
      {!column.hidden && (
        <div
          key={column.id}
          className={styles.combinedColumnStyle}
          style={{ ...(getStyle(props.columnStyle, formData) || {}) }}
          data-column-id={column.id}
        >
          <Flex
            justify={props.kanbanReadonly || props.readonly ? 'center' : 'space-between'} // Apply space-between when editable (settings dropdown exists)
            align="center"
            className={styles.combinedHeaderStyle}
            style={{ ...(getStyle(props.headerStyles, formData) || {}) }}
          >
            {props.showIcons && column.icon && (
              <IconPicker
                value={column.icon}
                readOnly
                style={{ color: props.fontColor, fontSize: addPx(props.fontSize) }}
              />
            )}
            <h3>
              {column.item} ({columnTasks.length})
            </h3>

            {/* Render collapsible icon if in readonly mode and collapsible is true */}
            {props.kanbanReadonly || props.readonly ? null : (
              <Dropdown trigger={['click']} menu={{ items: columnDropdownItems }} placement="bottomRight">
                <Button
                  type="text"
                  icon={<SettingFilled style={{ color: props.fontColor, fontSize: addPx(props.fontSize) }} />}
                />
              </Dropdown>
            )}
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
              disabled={props.kanbanReadonly || props.readonly}
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
                <div className={styles.noTask}>No Item Found</div>
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
                        formId={props.modalFormId}
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
