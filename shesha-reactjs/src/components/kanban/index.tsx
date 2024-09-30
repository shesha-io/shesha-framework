import React, { CSSProperties, useEffect, useState, useMemo, useCallback } from 'react';
import { Form, message, Modal } from 'antd';
import { IKanbanProps } from './model';
import { getHeight, getMetaData, useKanbanActions } from './utils';
import KanbanPlaceholder from './placeholder';
import {
  ConfigurableForm,
  useAvailableConstantsData,
  useConfigurableActionDispatcher,
  useFormState,
  useGet,
} from '@/index';
import { useStyles } from './styles';
import KanbanColumn from './components/kanbanColumn';
import { MoveEvent } from 'react-sortablejs';

const KanbanReactComponent: React.FC<IKanbanProps> = (props) => {
  const {
    columnStyle,
    minHeight,
    height,
    maxHeight,
    gap,
    readonly,
    groupingProperty,
    modalFormId,
    entityType,
    fontSize,
    headerBackgroundColor,
    headerStyle,
    fontColor,
    createFormId,
    items,
  } = props;

  const [columns, setColumns] = useState([]);
  const [urls, setUrls] = useState({ updateUrl: '', deleteUrl: '', postUrl: '' });
  const [tasks, setTasks] = useState([]);
  const { refetch } = useGet({ path: '', lazy: true });
  const { formMode } = useFormState();
  const isInDesigner = formMode === 'designer';
  const { updateKanban, deleteKanban, createKanbanItem } = useKanbanActions();
  const { styles } = useStyles();
  const [trigger, setTrigger] = useState(0);
  const [form] = Form.useForm();
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const allData = useAvailableConstantsData();
  const { executeAction } = useConfigurableActionDispatcher();
  // const dynamicContext = useActionDynamicContext(actionConfiguration);

  useEffect(() => {
    setColumns(items);
    if (!isInDesigner && entityType && groupingProperty) {
      var type: any;
      refetch(getMetaData('/api/services/app/Metadata/Get', entityType?.id)).then((resp: any) => {
        type = resp.result.properties.find((x: any) => x.path.toLowerCase() === groupingProperty.toLowerCase());

        if (type?.dataType === 'reference-list-item') {
          const endpoints = resp.result.apiEndpoints;
          setUrls({ updateUrl: endpoints.update.url, deleteUrl: endpoints.delete.url, postUrl: endpoints.create.url });
          refetch({ path: `${resp.result.apiEndpoints.list.url}?maxResultCount=1000` })
            .then((resp) => {
              setTasks(resp.result.items.filter((x: any) => x[`${groupingProperty}`] !== null));
            })
            .catch((err) => console.error('Error fetching tasks:', err));
        }
      });
    }
  }, [groupingProperty, trigger, items]);

  const onEnd = useCallback(
    (evt: any, column: any): Promise<boolean> => {
      return new Promise((resolve) => {
        const { to, dragged } = evt;
        const draggedTask = dragged?.dataset?.id;
        const targetColumn = to?.dataset?.columnId;

        console.log('Dragged Task:', draggedTask);
        console.log('Target Column:', targetColumn);

        if (!column || !column.actionConfiguration) {
          resolve(true); // Allow the drop if no action configuration
          return;
        }

        const evaluationContext = {
          ...allData,
          selectedRow: column,
          draggedTask,
        };

        executeAction({
          actionConfiguration: column.actionConfiguration,
          argumentsEvaluationContext: evaluationContext,
          success: (response) => {
            console.log('Custom Success Logic:', response);
            resolve(true);
          },
          fail: (error) => {
            console.log('Custom Failure Logic:', error);
            resolve(false);
          },
        });
      });
    },
    [allData, executeAction]
  );

  const handleUpdate = useCallback(
    async (newTasks: any[], column: any) => {
      const hasChanged = newTasks.some((task, index) => task.id !== tasks[index]?.id);

      if (!hasChanged) {
        return; // Exit if there's no change
      }

      const canUpdate = await onEnd(
        {
          to: { dataset: { columnId: column.id } },
          dragged: { dataset: { id: newTasks[0]?.id } },
        },
        column
      );

      if (!canUpdate) {
        console.log('Update prevented due to failed action execution');
        return; // Exit the function without updating
      }

      setTasks((prevTasks) => {
        const updatedTasks = prevTasks.map((task) => {
          const movedTask = newTasks.find((newTask) => newTask.id === task.id);
          if (movedTask && task[groupingProperty] !== column.itemValue) {
            const updatedTask = { ...task, [groupingProperty]: column.itemValue };
            const payload = { id: task.id, [groupingProperty]: column.itemValue };
            updateKanban(payload, urls.updateUrl);
            return updatedTask;
          }
          return task;
        });

        return updatedTasks.sort((a, b) => {
          const aIndex = newTasks.findIndex((t) => t.id === a.id);
          const bIndex = newTasks.findIndex((t) => t.id === b.id);
          return aIndex - bIndex;
        });
      });
    },
    [tasks, groupingProperty, onEnd, updateKanban, urls.updateUrl]
  );

  useEffect(() => {
    if (selectedItem) {
      form.setFieldsValue(selectedItem);
    } else {
      form.resetFields();
    }
  }, [selectedItem, form]);

  const style: CSSProperties = {
    flex: '1 0 100px',
    justifyContent: 'space-between',
    margin: '0 10px',
    padding: '0px',
    border: '1px solid #ddd',
    minHeight: '150px',
    maxHeight: '500px',
    height: '500px',
    borderRadius: '8px',
    marginBottom: '10px',
    backgroundColor: '#f5f5f5',
    transition: 'background-color 0.3s',
    flexGrow: 1,
    width: '250px',
    maxWidth: '250px',
    minWidth: '250px',
    boxSizing: 'border-box',
  };

  const hStyle: CSSProperties = {
    textAlign: 'center',
    color: '#595959',
    fontSize: 100,
    borderRadius: 5,
    padding: '0 10px',
    marginTop: 10,
    backgroundColor: '#1890ff',
  };

  const newHeaderStyle = {
    ...hStyle,
    ...headerStyle,
    fontSize,
    backgroundColor: headerBackgroundColor,
    color: fontColor,
  };
  const newStyle = { ...style, ...columnStyle, ...getHeight(height, minHeight, maxHeight) };

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setIsModalVisible(true);
  };

  const handleEdit = async () => {
    try {
      const updatedItem = form.getFieldsValue();
      updatedItem.id = selectedItem.id;

      updateKanban(updatedItem, urls.updateUrl);

      var updatedTasks = tasks.map((task) => (task.id === selectedItem.id ? { ...task, ...updatedItem } : task));

      setTasks([...updatedTasks]);
      setTrigger((prev) => prev + 1);

      form.resetFields();
      setIsModalVisible(false);
      setSelectedItem(null);
      message.success('Item updated successfully');
    } catch (error) {
      console.error('Error updating item:', error);
      message.error('Failed to update the item.');
    }
  };

  const handleDelete = (id: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    deleteKanban(id, urls.deleteUrl);
    setTrigger((prev) => prev + 1);
  };

  const handleCreate = () => {
    const newValues = form.getFieldsValue();
    newValues[groupingProperty] = selectedColumn;
    createKanbanItem(newValues, urls.postUrl);
    setTasks([...tasks, newValues]);
    setIsModalVisible(false);
    setSelectedColumn(null);
  };

  const handleCreateClick = (columnValue) => {
    setSelectedColumn(columnValue);
    setSelectedItem(undefined); // Ensure no item is selected for adding new
    form.resetFields(); // Reset the form to clear previous values
    setIsModalVisible(true);
  };

  const closeModal = () => {
    setIsModalVisible(false);
    form.resetFields();
    setSelectedItem(undefined);
    // console.log('close modal', selectedItem);
  };

  const memoizedFilteredTasks = useMemo(() => {
    return columns.map((column) => {
      return {
        column,
        tasks: tasks.filter((task) => {
          return task[groupingProperty] === column.itemValue;
        }),
      };
    });
  }, [columns, tasks, groupingProperty]);

  return (
    <>
      {items.length === 0 ? (
        <KanbanPlaceholder />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <div style={{ display: 'flex', gap: gap || 10 }}>
            {memoizedFilteredTasks.map(({ column, tasks: columnTasks }) => (
              <KanbanColumn
                key={column.itemValue}
                column={column}
                columnTasks={columnTasks}
                groupingProperty={groupingProperty}
                readonly={readonly}
                newStyle={newStyle}
                newHeaderStyle={newHeaderStyle}
                handleUpdate={handleUpdate}
                handleEditClick={handleEditClick}
                handleDelete={handleDelete}
                handleCreateClick={handleCreateClick}
                styles={styles}
                selectedItem={selectedItem}
                modalFormId={modalFormId}
                onEnd={(evt: MoveEvent) => onEnd(evt, column)}
              />
            ))}
          </div>
        </div>
      )}

      <Modal
        title={selectedItem ? 'Edit Item' : 'New Item'}
        open={isModalVisible}
        onOk={() => form.validateFields().then(selectedItem ? handleEdit : handleCreate)}
        onCancel={closeModal}
        width={1000}
      >
        <ConfigurableForm initialValues={selectedItem || {}} form={form} formId={createFormId} mode="edit" />
      </Modal>
    </>
  );
};

export default KanbanReactComponent;
