import React, { useEffect, useState, useMemo } from 'react';
import { Flex, Form, App, Modal } from 'antd';
import { IKanbanProps } from './model';
import { useKanbanActions } from './utils';
import KanbanPlaceholder from './components/kanbanPlaceholder';
import {
  ConfigurableForm,
  DataTypes,
  useFormState,
  useGet,
  useMetadataDispatcher,
} from '@/index';
import KanbanColumn from './components/renderColumn';
import { useRefListItemGroupConfigurator } from '@/providers/refList/provider';
import { addPx } from '../keyInformationBar/utils';

const KanbanReactComponent: React.FC<IKanbanProps> = (props) => {
  const { gap, groupingProperty, entityType, createFormId, items, componentName, editFormId, maxResultCount } = props;

  const { message } = App.useApp();
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
  const { storeSettings } = useRefListItemGroupConfigurator();
  const { getMetadata } = useMetadataDispatcher();

  useEffect(() => {
    if (!isInDesigner && entityType.id && groupingProperty) {
      getMetadata({ modelType: entityType.id, dataType: DataTypes.entityReference }).then((resp: any) => {
        const endpoints = resp?.apiEndpoints;
        setUrls({ updateUrl: endpoints.update.url, deleteUrl: endpoints.delete.url, postUrl: endpoints.create.url });
        refetch({ path: `${resp?.apiEndpoints.list.url}?maxResultCount=${maxResultCount || 100}` })
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
      editForm.setFieldsValue(selectedItem);
    } else {
      editForm.resetFields();
    }
  }, [selectedItem, editForm]);

  const closeModal = () => {
    setIsModalVisible(false);
    form.resetFields();
    editForm.resetFields();
    setSelectedItem(null);
    setSelectedColumn(null);
  };


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
      tasks: tasks.filter((task) => parseFloat(task[groupingProperty]) === column.itemValue),
      isCollapsed: settings[column.itemValue] || false, // Default to false if not set
    }));
  }, [columns, tasks, groupingProperty, settings]);

  return (
    <>
      {items.length === 0 ? (
        <KanbanPlaceholder />
      ) : (
        <Flex style={{ overflowX: 'auto', overflowY: 'hidden', display: 'flex', gap: addPx(gap) }}>
          {memoizedFilteredTasks.map(({ column, tasks: columnTasks }) => (
            <KanbanColumn
              props={props}
              setTasks={setTasks}
              key={column.itemValue}
              urls={urls}
              tasks={tasks}
              collapse={settings[column.itemValue] ?? false}
              column={column}
              columns={columns}
              columnTasks={columnTasks}
              handleEditClick={handleEditClick}
              handleDelete={handleDelete}
              handleCreateClick={handleCreateClick}
              selectedItem={selectedItem}
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
            key={selectedItem}
            initialValues={selectedItem || {}}
            form={editForm}
            formId={editFormId}
            mode="edit"
          />
        ) : (
          <ConfigurableForm key={'new-item'} form={form} formId={createFormId} mode="edit" />
        )}
      </Modal>
    </>
  );
};

export default KanbanReactComponent;
