import { getDimensionsStyle } from '@/designer-components/_settings/utils/dimensions/utils';
import { getFontStyle } from '@/designer-components/_settings/utils/font/utils';
import { ConfigurableForm, ShaIcon, useAvailableConstantsData, useConfigurableActionDispatcher } from '@/index';
import { useRefListItemGroupConfigurator } from '@/components/refListSelectorDisplay/provider';
import { LeftOutlined, MoreOutlined, PlusOutlined, RightOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Dropdown, Flex, MenuProps, Popconfirm } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ReactSortable } from 'react-sortablejs';
import { useStyles } from '../styles/styles';
import { useKanbanActions } from '../utils';

interface KanbanColumnProps {
  column: any;
  columnTasks: any[];
  handleEditClick: (item: any) => void;
  handleDelete: (id: string) => void;
  handleCreateClick: (columnValue: any) => void;
  selectedItem: any;
  collapse: boolean;
  props: any;
  setTasks: React.Dispatch<React.SetStateAction<any[]>>;
  tasks: any[];
  columns: any[];
  urls: any;
}

const RenderColumn: React.FC<KanbanColumnProps> = ({
  column,
  columnTasks,
  collapse,
  selectedItem,
  urls,
  setTasks,
  columns,
  tasks,
  handleEditClick,
  handleDelete,
  handleCreateClick,
  props,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(collapse);
  const { updateUserSettings } = useKanbanActions();
  const { storeSettings, userSettings } = useRefListItemGroupConfigurator();
  const dimensionsStyles = useMemo(() => getDimensionsStyle(props.columnStyles.dimensions), [props.columnStyles.dimensions]);
  const fontStyles = useMemo(() => getFontStyle(props.font), [props.font]);
  const { styles } = useStyles({ ...props, isCollapsed, dimensionsStyles, fontStyles });
  const { updateKanban } = useKanbanActions();
  const allData = useAvailableConstantsData();
  const { executeAction } = useConfigurableActionDispatcher();
  // Initialize collapse state from props
  useEffect(() => {
    setIsCollapsed(collapse);
  }, [collapse]);
  // Update user settings and persist to backend
  const toggleFold = async () => {
    try {
      const newCollapseState = !isCollapsed;
      setIsCollapsed(newCollapseState);
      await storeSettings(column.itemValue, newCollapseState);
      const updatedSettings = {
        ...userSettings,
        [column.itemValue]: newCollapseState,
      };
      updateUserSettings(updatedSettings, props.componentName);
    } catch (error) {
      console.error('Error updating collapse state:', error);
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
  ].filter(Boolean);

  const onEnd = useCallback(
    (evt: any, column: any): Promise<boolean> => {
      return new Promise((resolve) => {
        const { to, dragged } = evt;
        const draggedTask = dragged?.dataset;
        const targetColumn = to?.dataset?.targetColumn;

        if (!targetColumn?.actionConfiguration?.actionName) {
          resolve(true); // Allow the drag and drop to proceed without action
          return;
        }

        if (targetColumn?.itemValue === parseFloat(draggedTask?.value)) {
          resolve(true); // Skip further actions
          return;
        }

        const evaluationContext = {
          ...allData,
          selectedRow: column,
          draggedTask,
        };

        // Perform the action
        executeAction({
          actionConfiguration: targetColumn?.actionConfiguration,
          argumentsEvaluationContext: evaluationContext,
          success: () => {
            resolve(true); // Action succeeded, allow update
          },
          fail: (error) => {
            console.error('Action failed:', error);
            resolve(false); // Action failed, prevent update
          },
        });
      });
    },
    [allData, executeAction]
  );

  const handleUpdate = async (evt: any) => {
    const taskId = evt.item.dataset.id;
    const newColumnValue = evt.to.firstChild.dataset.value;
    const draggedTask = tasks.find((task) => task.id === taskId);
    const targetColumn = columns.find((x) => x.itemValue === parseFloat(newColumnValue));

    const canUpdate = await onEnd(
      {
        to: { dataset: { columnId: targetColumn.id, targetColumn: targetColumn } },
        dragged: { dataset: { id: taskId, value: draggedTask[props.groupingProperty] } },
      },
      targetColumn
    );

    if (!canUpdate) {
      return;
    }
    setTasks((prevTasks) => {
      return prevTasks.map((task) => {
        if (task.id === taskId) {
          const updatedTask = { ...task, [props.groupingProperty]: newColumnValue };
          const payload = { id: task.id, [props.groupingProperty]: newColumnValue };
          updateKanban(payload, urls.updateUrl);
          return updatedTask;
        }
        return task;
      });
    });
  };

  const iconStyles = { ...fontStyles, margin: '0px 8px' };
  return (
    <>
      {!column.hidden && (
        <div
          key={column.id}
          className={styles.combinedColumnStyle}
          style={props.columnStyle || {}}
          data-column-id={column.id}
        >
          <Flex
            justify={
              props.kanbanReadonly || props.readonly || !(props.allowNewRecord || props.collapsible)
                ? 'center'
                : 'space-between'
            }
            align="center"
            className={styles.combinedHeaderStyle}
            style={props.headerStyles || {}}
          >
            {props.showIcons && column.icon && <ShaIcon iconName={column.icon} readOnly style={iconStyles} />}
            <span
              style={{
                textWrap: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
              }}
            >
              {column.item} ({columnTasks.length})
            </span>

            {props.kanbanReadonly || props.readonly || !(props.allowNewRecord || props.collapsible) ? null : (
              <Dropdown trigger={['click']} menu={{ items: columnDropdownItems }} placement="bottomRight">
                <Button type="text" icon={<SettingOutlined style={iconStyles} />} />
              </Dropdown>
            )}
          </Flex>

          {!isCollapsed && (
            <ReactSortable
              list={columnTasks}
              setList={() => {
                /* This is intentionally left empty */
              }}
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
              onEnd={handleUpdate}
              className={styles.container}
              style={{
                flex: '1 1 auto',
                overflowY: 'auto',
                minHeight: 200,
                padding: '10px',
              }}
            >
              {columnTasks.length === 0 ? (
                <div className={styles.noTask} data-id={column.itemValue} data-value={column.itemValue}>
                  No Item Found
                </div>
              ) : (
                columnTasks.map((t) => {
                  const taskDropdownItems: MenuProps['items'] = [
                    props.allowEdit && {
                      key: '1',
                      label: 'Edit',
                      onClick: () => handleEditClick(t),
                    },
                    props.allowDelete && {
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
                  ].filter(Boolean);
                  return (
                    <div key={t.id} className={styles.taskContainer} data-id={t.id} data-value={column.itemValue}>
                      <ConfigurableForm
                        key={selectedItem ? selectedItem.id : 'new-item'}
                        initialValues={t}
                        formId={props.modalFormId}
                        mode={'readonly'}
                        className={styles.taskContainer}
                      />
                      {props.kanbanReadonly || props.readonly || !(props.allowDelete || props.allowEdit) ? null : (
                        <Dropdown trigger={['click']} menu={{ items: taskDropdownItems }} placement="bottomRight">
                          <Button type="text" className={`${styles.threeDots} three-dots`} icon={<MoreOutlined />} />
                        </Dropdown>
                      )}
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
