import { getDimensionsStyle } from '@/designer-components/_settings/utils/dimensions/utils';
import { getFontStyle } from '@/designer-components/_settings/utils/font/utils';
import { useRefListItemGroupConfigurator } from '@/components/refListSelectorDisplay/provider';
import { LeftOutlined, MoreOutlined, PlusOutlined, RightOutlined, SettingOutlined } from '@ant-design/icons';
import { Button, Dropdown, Flex, Popconfirm } from 'antd';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ItemInterface, ReactSortable, ReactSortableProps } from 'react-sortablejs';
import { useStyles } from '../styles/styles';
import { useKanbanActions } from '../utils';
import { useAvailableConstantsData } from '@/providers/form/utils';
import { useConfigurableActionDispatcher } from '@/providers/configurableActionsDispatcher';
import { ShaIcon } from '@/components/shaIcon';
import { ConfigurableForm } from '@/components/configurableForm';
import { IKanbanButton, IKanbanProps } from '../model';
import { ITableRowData } from '@/providers/dataTable/interfaces';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { MenuItemType } from 'antd/es/menu/interface';
import { Promisify } from '@/interfaces/utilityTypes';
import { UnwrapCodeEvaluators } from '@/interfaces';

export type KanbanUrls = {
  updateUrl: string;
  deleteUrl: string;
  postUrl: string;
};

interface KanbanColumnProps {
  column: IKanbanButton;
  columnTasks: ITableRowData[];
  handleEditClick: (item: ITableRowData) => void;
  handleDelete: (id: string) => void;
  handleCreateClick: (columnValue: number) => void;
  selectedItem: ITableRowData | null;
  collapse: boolean;
  props: UnwrapCodeEvaluators<IKanbanProps>;
  setTasks: React.Dispatch<React.SetStateAction<ITableRowData[]>>;
  tasks: ITableRowData[];
  columns: IKanbanButton[];
  urls: KanbanUrls;
}

type OnEndHandler<T extends ItemInterface = ItemInterface> = Required<ReactSortableProps<T>>["onEnd"];
type OnEndHandlerAsync<T extends ItemInterface = ItemInterface> = Promisify<OnEndHandler<T>>;

type OnEndArgs = {
  to: { dataset: { columnId: string; targetColumn: IKanbanButton } };
  dragged: { dataset: { id: string; value: string } };
};

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
  const dimensionsStyles = useMemo(() => getDimensionsStyle(props.columnStyles?.dimensions), [props.columnStyles?.dimensions]);
  const fontStyles = useMemo(() => getFontStyle(props.font), [props.font]);
  const { styles } = useStyles({ isCollapsed, dimensionsStyles, fontStyles });
  const { updateKanban } = useKanbanActions();
  const allData = useAvailableConstantsData();
  const { executeAction } = useConfigurableActionDispatcher();
  // Initialize collapse state from props
  useEffect(() => {
    setIsCollapsed(collapse);
  }, [collapse]);
  // Update user settings and persist to backend
  const toggleFold = async (): Promise<void> => {
    try {
      const newCollapseState = !isCollapsed;
      setIsCollapsed(newCollapseState);
      await storeSettings(String(column.itemValue), newCollapseState);
      const updatedSettings = {
        ...userSettings,
        [column.itemValue]: newCollapseState,
      };
      if (!isNullOrWhiteSpace(props.componentName))
        updateUserSettings(updatedSettings, props.componentName).catch((error) => {
          console.error('Failed to update user settings', error);
          throw error;
        });
    } catch (error) {
      console.error('Error updating collapse state:', error);
      setIsCollapsed(!isCollapsed);
    }
  };

  const columnDropdownItems: MenuItemType[] = [
    props.allowNewRecord
      ? {
        key: '1',
        label: 'Add',
        onClick: () => handleCreateClick(column.itemValue),
        icon: <PlusOutlined />,
      }
      : undefined,
    props.collapsible
      ? {
        key: '2',
        label: isCollapsed ? 'Uncollapse' : 'Collapse',
        onClick: toggleFold,
        icon: isCollapsed ? <RightOutlined /> : <LeftOutlined />,
      }
      : undefined,
  ].filter(isDefined);

  const onEnd = useCallback(
    (evt: OnEndArgs, column: IKanbanButton): Promise<boolean> => {
      return new Promise((resolve) => {
        const { to, dragged } = evt;
        const draggedTask = dragged.dataset;
        const targetColumn = to.dataset.targetColumn;

        if (!targetColumn.actionConfiguration?.actionName) {
          resolve(true); // Allow the drag and drop to proceed without action
          return;
        }

        if (targetColumn.itemValue === parseFloat(draggedTask.value)) {
          resolve(true); // Skip further actions
          return;
        }

        const evaluationContext = {
          ...allData,
          selectedRow: column,
          draggedTask,
        };

        // Perform the action
        void executeAction({
          actionConfiguration: targetColumn.actionConfiguration,
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
    [allData, executeAction],
  );

  const handleUpdate: OnEndHandlerAsync = async (evt) => {
    const { groupingProperty } = props;
    if (isNullOrWhiteSpace(groupingProperty))
      return;
    const taskId = evt.item.dataset['id'];
    if (!isDefined(taskId))
      return;
    const draggedTask = tasks.find((task) => task.id === taskId);
    if (!draggedTask)
      return;

    const newColumnValueStr = (evt.to.firstChild as HTMLElement | null)?.dataset["value"];
    const newColumnValue = !isNullOrWhiteSpace(newColumnValueStr) ? parseFloat(newColumnValueStr) : undefined;
    if (!newColumnValue)
      return;

    const targetColumn = columns.find((x) => x.itemValue === newColumnValue);
    if (!targetColumn)
      return;

    const canUpdate = await onEnd(
      {
        to: { dataset: { columnId: targetColumn.id, targetColumn: targetColumn } },
        dragged: { dataset: { id: taskId, value: String(draggedTask[groupingProperty]) } },
      },
      targetColumn,
    );

    if (!canUpdate) {
      return;
    }
    setTasks((prevTasks) => {
      return prevTasks.map((task) => {
        if (task.id === taskId) {
          const updatedTask: ITableRowData = { ...task, [groupingProperty]: newColumnValue };
          const payload: ITableRowData = { id: task.id, [groupingProperty]: newColumnValue };
          updateKanban(payload, urls.updateUrl).catch((error) => {
            console.error('Failed to update item', error);
            throw error;
          });
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
          style={typeof (props.columnStyle) === "object" ? props.columnStyle : {}}
          data-column-id={column.id}
        >
          <Flex
            justify={props.kanbanReadonly || props.readOnly || !(props.allowNewRecord || props.collapsible)
              ? 'center'
              : 'space-between'}
            align="center"
            className={styles.combinedHeaderStyle}
            style={typeof (props.headerStyles) === "object" ? props.headerStyles : {}}
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

            {props.kanbanReadonly || props.readOnly || !(props.allowNewRecord || props.collapsible) ? null : (
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
              disabled={props.kanbanReadonly || props.readOnly}
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
                  const taskDropdownItems: MenuItemType[] = [
                    props.allowEdit
                      ? {
                        key: '1',
                        label: 'Edit',
                        onClick: () => handleEditClick(t),
                      }
                      : undefined,
                    props.allowDelete
                      ? {
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
                      }
                      : undefined,
                  ].filter(isDefined);
                  return (
                    <div key={t.id} className={styles.taskContainer} data-id={t.id} data-value={column.itemValue}>
                      {isDefined(props.modalFormId) && (
                        <ConfigurableForm
                          key={selectedItem ? selectedItem.id : 'new-item'}
                          initialValues={t}
                          formId={props.modalFormId}
                          mode="readonly"
                          className={styles.taskContainer}
                        />
                      )}
                      {props.kanbanReadonly || props.readOnly || !(props.allowDelete || props.allowEdit) ? null : (
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
