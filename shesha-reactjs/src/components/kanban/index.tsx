import { useRefListItemGroupConfigurator } from '@/components/refListSelectorDisplay/provider';
import { App, Flex, Form, Modal } from 'antd';
import React, { useEffect, useMemo, useState } from 'react';
import KanbanPlaceholder from './components/kanbanPlaceholder';
import KanbanColumn, { KanbanUrls } from './components/renderColumn';
import { IKanbanButton, IKanbanProps } from './model';
import { useKanbanActions } from './utils';
import { addPx } from '@/utils/style';
import { getOverflowStyle } from '@/designer-components/_settings/utils/overflow/util';
import { getPropertyOrUndefined, jsonSafeParse } from '@/utils/object';
import { pickStyleFromModel, useAvailableConstantsData } from '@/providers/form/utils';
import { useDataTableStore } from '@/providers/dataTable/hooks';
import { useFormState } from '@/providers/form';
import { useMetadataDispatcher } from '@/providers/metadataDispatcher/provider';
import { FCUnwrapped, StyleBoxValue } from '@/providers/form/models';
import { DataTypes } from '@/interfaces/dataTypes';
import { ConfigurableForm } from '../configurableForm';
import { IAnyObject, isEntityMetadata } from '@/interfaces';
import { ITableRowData } from '@/providers/dataTable/interfaces';
import { isNonEmptyArray } from '@/utils/array';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { useEffectOnce } from '@/hooks/useEffectOnce';
import { RecursivePartial } from '@/interfaces/entity';

const KanbanReactComponent: FCUnwrapped<IKanbanProps> = (props) => {
  const { gap, groupingProperty, createFormId, items, componentName, editFormId } = props;

  const { tableData, modelType } = useDataTableStore();
  const { message } = App.useApp();
  const allData = useAvailableConstantsData();
  const [columns, setColumns] = useState<IKanbanButton[]>([]);
  const [urls, setUrls] = useState<KanbanUrls>({ updateUrl: '', deleteUrl: '', postUrl: '' });
  const [tasks, setTasks] = useState<ITableRowData[]>([]);
  const { formMode } = useFormState();
  const isInDesigner = formMode === 'designer';
  const { updateKanban, deleteKanban, createKanbanItem, fetchColumnState } = useKanbanActions();
  const [form] = Form.useForm<ITableRowData>();
  const [editForm] = Form.useForm<ITableRowData>();
  const [selectedItem, setSelectedItem] = useState<ITableRowData | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<number | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [settings, setSettings] = useState<IAnyObject>({});
  const { storeSettings } = useRefListItemGroupConfigurator();
  const { getMetadata } = useMetadataDispatcher();

  const styling = jsonSafeParse<StyleBoxValue>(props.columnStyles?.stylingBox || '{}');
  const stylingBoxAsCSS = pickStyleFromModel(styling);

  useEffect(() => {
    if (!isInDesigner && modelType && groupingProperty) {
      getMetadata({ modelType: modelType, dataType: DataTypes.entityReference }).then((resp) => {
        if (isEntityMetadata(resp)) {
          const { update, delete: deleteEndpoint, create } = resp.apiEndpoints;
          setUrls({
            updateUrl: update?.url ?? "",
            deleteUrl: deleteEndpoint?.url ?? "",
            postUrl: create?.url ?? "",
          });
        }
      }).catch((error) => {
        console.error('Failed to fetch metadata', error);
        throw error;
      });

      const filteredTasks = tableData.filter((item) => item[groupingProperty]);
      setTasks(filteredTasks);
    }
  }, [isInDesigner, modelType, groupingProperty, tableData, getMetadata]);

  useEffect(() => {
    setColumns(items ?? []);
  }, [items]);

  useEffectOnce(() => {
    const initializeSettings = async (): Promise<void> => {
      try {
        if (!isNullOrWhiteSpace(componentName)) {
          const resp = await fetchColumnState(componentName);
          setSettings(resp);
          // Loop through and store settings asynchronously
          for (const [columnId, isCollapsed] of Object.entries(resp)) {
            await storeSettings(columnId, isCollapsed as boolean); // Await inside loop
          }
        } else
          setSettings({});
      } catch (error) {
        console.error('Error initializing settings:', error);
        setSettings({});
      }
    };

    initializeSettings().catch((error) => {
      console.error('Failed to initialize settings', error);
      throw error;
    });
  });

  useEffect(() => {
    if (isDefined(selectedItem)) {
      editForm.setFieldsValue(selectedItem as RecursivePartial<ITableRowData>);
    } else {
      editForm.resetFields();
    }
  }, [selectedItem, editForm]);

  const closeModal = (): void => {
    setIsModalVisible(false);
    form.resetFields();
    editForm.resetFields();
    setSelectedItem(null);
    setSelectedColumn(null);
  };

  const handleEditClick = (item: ITableRowData): void => {
    setSelectedItem(item);
    setIsModalVisible(true);
  };

  const handleEdit = async (): Promise<void> => {
    if (!isDefined(selectedItem))
      throw new Error('No item selected to update');

    const updatedItem = editForm.getFieldsValue();
    updatedItem.id = selectedItem.id;

    await updateKanban(updatedItem, urls.updateUrl)
      .then((resp) => {
        const updatedTasks = tasks.map((task) => (task.id === selectedItem.id ? { ...task, ...resp } : task));
        setTasks([...updatedTasks]);
        closeModal();
        message.success('Item updated successfully');
      })
      .catch((error) => {
        console.error(error);
      });
  };

  const handleDelete = (id: string): void => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    deleteKanban(id, urls.deleteUrl).catch((error) => {
      console.error('Failed to delete item', error);
      throw error;
    });
  };

  const handleCreate = (): void => {
    const newValues = form.getFieldsValue();
    if (!isNullOrWhiteSpace(groupingProperty))
      newValues[groupingProperty] = selectedColumn;
    createKanbanItem(newValues, urls.postUrl)
      .then((response) => {
        setTasks([...tasks, response]);
        setIsModalVisible(false);
        setSelectedColumn(null);
      })
      .catch((error) => {
        console.error(error);
        message.error('Failed to create the item.');
      });
  };

  const handleCreateClick = (columnValue: number): void => {
    setSelectedColumn(columnValue);
    setSelectedItem(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const memoizedFilteredTasks = useMemo(() => {
    return columns.map((column) => ({
      column,
      tasks: tasks.filter((task) => getPropertyOrUndefined<number>(task, groupingProperty, (value) => value ? parseFloat(String(value)) : undefined) === column.itemValue),
      isCollapsed: settings[column.itemValue] || false, // Default to false if not set
    }));
  }, [columns, tasks, groupingProperty, settings]);

  const overflowStyle = getOverflowStyle(true, false);

  return (
    <>
      {!isNonEmptyArray(columns) ? (
        <KanbanPlaceholder />
      ) : (
        <Flex style={{ ...stylingBoxAsCSS, ...overflowStyle, overflowY: 'hidden', display: 'flex', gap: addPx(gap, allData) ?? '0px' }}>
          {memoizedFilteredTasks?.map(({ column, tasks: columnTasks }) => (
            <KanbanColumn
              props={props}
              setTasks={setTasks}
              key={column.itemValue}
              urls={urls}
              tasks={tasks}
              collapse={Boolean(settings[column.itemValue])}
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
          selectedItem
            ? editForm.validateFields().then(handleEdit)
            : form.validateFields().then(handleCreate)}
        onCancel={closeModal}
        width={1000}
      >
        {selectedItem
          ? editFormId && (
            <ConfigurableForm
              key={selectedItem.id}
              initialValues={selectedItem}
              form={editForm}
              formId={editFormId}
              mode="edit"
            />
          )
          : (
            createFormId && <ConfigurableForm key="new-item" form={form} formId={createFormId} mode="edit" />
          )}
      </Modal>
    </>
  );
};

export default KanbanReactComponent;
