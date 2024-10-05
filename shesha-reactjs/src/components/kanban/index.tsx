import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Form, message, Modal } from 'antd';
import { IKanbanProps } from './model';
import { getMetaData, useKanbanActions } from './utils';
import KanbanPlaceholder from './components/kanbanPlaceholder';
import {
  ConfigurableForm,
  useAvailableConstantsData,
  useConfigurableActionDispatcher,
  useFormState,
  useGet,
} from '@/index';
import KanbanColumn from './components/renderColumn';
import { MoveEvent } from 'react-sortablejs';
import { useRefListItemGroupConfigurator } from '@/providers/refList/provider';

const KanbanReactComponent: React.FC<IKanbanProps> = (props) => {
  const {
    gap,
    groupingProperty,
    entityType,
    createFormId,
    items,
  } = props;

  const [columns, setColumns] = useState([]);
  const [urls, setUrls] = useState({ updateUrl: '', deleteUrl: '', postUrl: '' });
  const [tasks, setTasks] = useState([]);
  const { refetch } = useGet({ path: '', lazy: true });
  const { formMode } = useFormState();
  const isInDesigner = formMode === 'designer';
  const { updateKanban, deleteKanban, createKanbanItem, fetchColumnState } = useKanbanActions();
  const [form] = Form.useForm();
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [settings, setSettings] = useState({});
  const allData = useAvailableConstantsData();
  const { executeAction } = useConfigurableActionDispatcher();
  const { storeSettings } = useRefListItemGroupConfigurator();

  useEffect(() => {
    if (!isInDesigner && entityType.id && groupingProperty) {
      refetch(getMetaData('/api/services/app/Metadata/Get', entityType?.id)).then((resp: any) => { 
      const endpoints = resp.result.apiEndpoints;
      setUrls({ updateUrl: endpoints.update.url, deleteUrl: endpoints.delete.url, postUrl: endpoints.create.url });
      refetch({ path: `${resp.result.apiEndpoints.list.url}` })
        .then((resp) => {
          setTasks(resp.result.items.filter((x: any) => x[`${groupingProperty}`] !== null));
        })
        .catch((err) => console.error('Error fetching tasks:', err));
      });
    }
  }, [groupingProperty, entityType.id]);

  useEffect(() => {
    setColumns(items);
  }, [items]);

  useEffect(() => {
    const initializeSettings = async () => {
      try {
        const resp = await fetchColumnState();
        if (!resp?.result) return;
  
        const parsedSettings = JSON.parse(resp.result);
        if (parsedSettings) {
          setSettings(parsedSettings);
          // Loop through and store settings asynchronously
          for (const [columnId, isCollapsed] of Object.entries(parsedSettings)) {
            await storeSettings(columnId, isCollapsed as boolean); // Await inside loop
          }
        }
      } catch (error) {
        console.error('Error initializing settings:', error);
        setSettings({});
      }
    };
  
    initializeSettings();
  }, []);
  

  useEffect(() => {
    if (selectedItem) {
      form.setFieldsValue(selectedItem);
    } else {
      form.resetFields();
    }
  }, [selectedItem, form]);

  const onEnd = useCallback(
    (evt: any, column: any): Promise<boolean> => {
      return new Promise((resolve) => {
        const { to, dragged } = evt;
        const draggedTask = dragged?.dataset?.id;
        const targetColumn = to?.dataset;
  
        if (!column || !targetColumn?.actionConfiguration) {
          resolve(true); // Allow the drag and drop to proceed without action
          return;
        }
  
        // Ensure the task is not dropped back into the same column based on the value
        if (column.itemValue === dragged?.dataset.value) {
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
          actionConfiguration: column.actionConfiguration,
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
  
  const handleUpdate = useCallback(
    async (newTasks: any[], column: any) => {
      // Check if the tasks have changed (e.g., their order or column)
      const hasChanged = newTasks.some((task, index) => task.id !== tasks[index]?.id);

      if (!hasChanged) {
        return; // Exit early if no changes are found
      }
      // Call onEnd to check whether action execution is necessary
      const canUpdate = await onEnd(
        {
          to: { dataset: { columnId: column.id, actionConfiguration: column.actionConfiguration } },
          dragged: { dataset: { id: newTasks[0]?.id, value: newTasks[0]?.appointmentType } },
        },
        column
      );
      // If onEnd returns false, don't update tasks
      if (!canUpdate) {
        return; // Exit the function without updating
      }
  
      // If we get here, we can safely update tasks
      setTasks((prevTasks) => {
        const updatedTasks = prevTasks.map((task) => {
          const movedTask = newTasks.find((newTask) => newTask.id === task.id);
          if (movedTask && task[groupingProperty] !== column.itemValue) {
            const updatedTask = { ...task, [groupingProperty]: column.itemValue };
            const payload = { id: task.id, [groupingProperty]: column.itemValue };
            updateKanban(payload, urls.updateUrl); // Send update to the server
            return updatedTask;
          }
          return task;
        });
  
        // Sort tasks based on their new order in the column
        return updatedTasks.sort((a, b) => {
          const aIndex = newTasks.findIndex((t) => t.id === a.id);
          const bIndex = newTasks.findIndex((t) => t.id === b.id);
          return aIndex - bIndex;
        });
      });
    },
    [tasks, groupingProperty, onEnd, updateKanban, urls.updateUrl]
  );
  
  
  const handleEditClick = (item: any) => {
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
    return columns.map((column) => ({
      column,
      tasks: tasks.filter((task) => task[groupingProperty] === column.itemValue),
      isCollapsed: settings[column.itemValue] || false, // Default to false if not set
    }));
  }, [columns, tasks, groupingProperty, settings]);

  return (
    <>
      {items.length === 0 ? (
        <KanbanPlaceholder />
      ) : (
        <div style={{ overflowX: 'auto', overflowY: 'hidden' }}>
          <div style={{ display: 'flex', gap: gap || 10 }}>
            {memoizedFilteredTasks.map(({ column, tasks: columnTasks }) => (
              <KanbanColumn
                props={props}
                key={column.itemValue}
                collapse={settings[column.itemValue] ?? false}
                column={column}
                columnTasks={columnTasks}
                handleUpdate={handleUpdate}
                handleEditClick={handleEditClick}
                handleDelete={handleDelete}
                handleCreateClick={handleCreateClick}
                selectedItem={selectedItem}
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
