import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { Flex, Form, message, Modal } from 'antd';
import { IKanbanProps } from './model';
import { useKanbanActions } from './utils';
import KanbanPlaceholder from './components/kanbanPlaceholder';
import {
  ConfigurableForm,
  DataTypes,
  useAvailableConstantsData,
  useConfigurableActionDispatcher,
  useFormState,
  useGet,
  useMetadataDispatcher,
} from '@/index';
import KanbanColumn from './components/renderColumn';
import { MoveEvent } from 'react-sortablejs';
import { useRefListItemGroupConfigurator } from '@/providers/refList/provider';
import { addPx } from '../keyInformationBar/utils';

const KanbanReactComponent: React.FC<IKanbanProps> = (props) => {
  const { gap, groupingProperty, entityType, createFormId, items, componentName, editFormId } = props;

  const [columns, setColumns] = useState([]);
  const [urls, setUrls] = useState({ updateUrl: '', deleteUrl: '', postUrl: '' });
  const [tasks, setTasks] = useState([]);
  const { refetch } = useGet({ path: '', lazy: true });
  const { formMode } = useFormState();
  const isInDesigner = formMode === 'designer';
  const { updateKanban, deleteKanban, createKanbanItem, fetchColumnState } = useKanbanActions();
  const [form] = Form.useForm();
  const [editForm] = Form.useForm();
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedColumn, setSelectedColumn] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [settings, setSettings] = useState({});
  const allData = useAvailableConstantsData();
  const { executeAction } = useConfigurableActionDispatcher();
  const { storeSettings } = useRefListItemGroupConfigurator();
  const { getMetadata } = useMetadataDispatcher();

  useEffect(() => {
    if (!isInDesigner && entityType.id && groupingProperty) {
      getMetadata({ modelType: entityType.id, dataType: DataTypes.entityReference }).then((resp: any) => {
        const endpoints = resp?.apiEndpoints;
        setUrls({ updateUrl: endpoints.update.url, deleteUrl: endpoints.delete.url, postUrl: endpoints.create.url });
        refetch({ path: `${resp?.apiEndpoints.list.url}?maxResultCount=1000` })
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
        const resp = await fetchColumnState(componentName);
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

  const closeModal = () => {
    setIsModalVisible(false);
    form.resetFields();
    editForm.resetFields();
    setSelectedItem(null);
    setSelectedColumn(null);
  };

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
    const updatedItem = editForm.getFieldsValue();
    updatedItem.id = selectedItem.id;

    updateKanban(updatedItem, urls.updateUrl)
      .then((resp: any) => {
        if (resp.success) {
          const updatedTasks = tasks.map((task) => (task.id === selectedItem.id ? { ...task, ...resp.result } : task));
          setTasks([...updatedTasks]);
          closeModal();
          message.success('Item updated successfully');
        }
      })
      .catch((error: any) => {
        console.error(error);
      });
  };

  const handleDelete = (id: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    deleteKanban(id, urls.deleteUrl);
  };

  const handleCreate = () => {
    const newValues = form.getFieldsValue();
    newValues[groupingProperty] = selectedColumn;
    createKanbanItem(newValues, urls.postUrl)
      .then((response) => {
        if (response?.success) {
          setTasks([...tasks, response.result]);
          setIsModalVisible(false);
          setSelectedColumn(null);
        } else {
          message.error('Failed to create the item.');
        }
      })
      .catch((error: any) => {
        console.error(error);
      });
  };

  const handleCreateClick = (columnValue) => {
    setSelectedColumn(columnValue);
    setSelectedItem(null);
    form.resetFields();
    setIsModalVisible(true);
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
        <Flex
          style={{ overflowX: 'auto', overflowY: 'hidden', display: 'flex', gap: addPx(gap) }}
        >
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
        </Flex>
      )}
      <Modal
        afterClose={closeModal}
        title={selectedItem ? 'Edit Item' : 'New Item'}
        open={isModalVisible}
        onOk={() =>
          selectedItem ? editForm.validateFields().then(handleEdit) : form.validateFields().then(handleCreate)
        }
        onCancel={closeModal}
        width={1000}
      >
        {selectedItem ? (
          <ConfigurableForm
            key={selectedItem ? selectedItem : 'new-item'}
            initialValues={selectedItem || {}}
            form={editForm}
            formId={editFormId}
            mode="edit"
          />
        ) : (
          <ConfigurableForm
            key={selectedItem ? selectedItem : 'new-item'}
            form={form}
            formId={createFormId}
            mode="edit"
          />
        )}
      </Modal>
    </>
  );
};

export default KanbanReactComponent;
