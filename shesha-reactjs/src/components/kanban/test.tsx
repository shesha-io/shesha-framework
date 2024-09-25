import React, { CSSProperties, useEffect, useState, useMemo } from 'react';
import { Button, Dropdown, Flex, Form, MenuProps, message, Modal, Popconfirm } from 'antd';
import { ReactSortable } from 'react-sortablejs';
import { IKanbanComponentProps } from './model';
import { getColumns, getHeight, getMetaData, useKanbanActions } from './utils';
import { KanbanPlaceholder } from './placeholder';
import { ConfigurableForm, useFormState, useGet } from '@/index';
import { DownOutlined, LeftOutlined, MoreOutlined, PlusOutlined, RightOutlined } from '@ant-design/icons';
import { useStyles } from './styles';

const CollapsibleKanbanColumn = ({ column, children, headerStyle, addNewRecordsProps, handleCreateClick, size }) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div style={{
      margin: '0 10px',
      width: isCollapsed ? '50px' : '250px',
      border: '1px solid #ddd',
      borderRadius: '8px',
      backgroundColor: '#f5f5f5',
      transition: 'width 0.3s ease-in-out',
      overflow: 'hidden',
    }}>
      <Flex justify="space-between" align="center" style={{ ...headerStyle, padding: '10px' }}>
        {!isCollapsed && <h3>{column.item} ({column.tasks.length})</h3>}
        <Flex>
          {!isCollapsed && addNewRecordsProps && (
            <Button type="text" onClick={() => handleCreateClick(column.itemValue)} size={size} icon={<PlusOutlined style={{color: '#ffffff'}}/>} />
          )}
          <Button 
            type="text" 
            icon={isCollapsed ? <RightOutlined /> : <LeftOutlined />}
            onClick={() => setIsCollapsed(!isCollapsed)}
            style={{color: '#ffffff'}}
          />
        </Flex>
      </Flex>
      {!isCollapsed && children}
    </div>
  );
};

const KanbanReactComponent: React.FC<IKanbanComponentProps> = (props) => {
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
    backgroundColor,
    color,
    headerStyle,
    addNewRecordsProps,
    size,
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

  useEffect(() => {
    if (!isInDesigner && entityType && groupingProperty) {
      var type: any;
      refetch(getMetaData('/api/services/app/Metadata/Get', entityType)).then((resp: any) => {
        type = resp.result.properties.find(
          (x: any) => x.path.toLowerCase() === groupingProperty.toLowerCase()
        );
        if (type?.dataType === 'reference-list-item') {
          const endpoints = resp.result.apiEndpoints;
          setUrls({updateUrl: endpoints.update.url, deleteUrl: endpoints.delete.url, postUrl: endpoints.create.url});
          refetch({ path: `${resp.result.apiEndpoints.list.url}?maxResultCount=1000` })
            .then((resp) => {
              setTasks(resp.result.items.filter((x: any) => x[`${groupingProperty}`] !== null));
              refetch(getColumns('/api/services/app/Entities/GetAll', type?.referenceListName))
                .then((resp: any) => {
                  setColumns(resp?.result?.items);
                })
                .catch((err) => console.error('Error fetching columns:', err));
            })
            .catch((err) => console.error('Error fetching tasks:', err));
        }
      });
    }
  }, [groupingProperty, trigger]);

  const handleUpdate = async (newTasks: any[], columnValue: any) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((task) => {
        const movedTask = newTasks.find((newTask) => newTask.id === task.id);
        if (movedTask && task[groupingProperty] !== columnValue) {
          const updatedTask = { ...task, [groupingProperty]: columnValue };
          const payload = { id: task.id, [groupingProperty]: columnValue };
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
  };

  useEffect(() => {
    if (selectedItem) {
      form.setFieldsValue(selectedItem);
    } else {
      form.resetFields();
    }
  }, [selectedItem, form]);

  const newHeaderStyle: CSSProperties = {
    textAlign: 'center',
    color: color || '#595959',
    fontSize: fontSize || 16,
    borderRadius: 5,
    padding: '0 10px',
    marginBottom: 10,
    backgroundColor: backgroundColor || '#f0f0f0',
    ...headerStyle,
  };

  const handleEditClick = (item) => {
    setSelectedItem(item);
    setIsModalVisible(true);
  };

  const handleEdit = async () => {
    try {
      const updatedItem = form.getFieldsValue();
      updatedItem.id = selectedItem.id;

      updateKanban(updatedItem, urls.updateUrl);

      var updatedTasks = tasks.map((task) => task.id === selectedItem.id ? {...task, ...updatedItem} : task);

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
    setSelectedItem(undefined);
    form.resetFields();
    setIsModalVisible(true);
  };
  
  const closeModal = () => {
    setIsModalVisible(false);
    form.resetFields();
    setSelectedItem(undefined);
  };

  const memoizedFilteredTasks = useMemo(() => {
    return columns.map(column => ({
      ...column,
      tasks: tasks.filter(task => task[groupingProperty] === column.itemValue)
    }));
  }, [columns, tasks, groupingProperty]);

  return (
    <>
      {isInDesigner ? (
        <KanbanPlaceholder />
      ) : (
        <Flex gap={gap || 10} style={{ overflowX: 'auto', minWidth: '1000px' }}>
          {memoizedFilteredTasks.map((column) => (
            <CollapsibleKanbanColumn 
              key={column.itemValue} 
              column={column}
              headerStyle={newHeaderStyle}
              addNewRecordsProps={addNewRecordsProps}
              handleCreateClick={handleCreateClick}
              size={size}
            >
              <ReactSortable
                list={column.tasks}
                setList={(newTasks) => handleUpdate(newTasks, column.itemValue)}
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
              >
                {column.tasks.length === 0 ? (
                  <div style={{ textAlign: 'center', color: '#999', padding: '20px', border: '1px dashed #d9d9d9', borderRadius: '5px' }}>
                    No Item Found
                  </div>
                ) : (
                  column.tasks.map((t) => {
                    const items: MenuProps['items'] = [
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
                      <div key={t.id} className={styles.container}>
                        <ConfigurableForm 
                          key={t.id} 
                          initialValues={t} 
                          formId={modalFormId}
                          mode={'readonly'}
                        />
                        <Dropdown trigger={['click']} menu={{ items }} placement="bottomRight">
                          <Button type="text" className={`${styles.threeDotsStyle} three-dots`} icon={<MoreOutlined />} />
                        </Dropdown>                             
                      </div>
                    );
                  })
                )}
              </ReactSortable>
            </CollapsibleKanbanColumn>
          ))}
        </Flex>
      )}
      <Modal
        title={selectedItem ? 'Edit Item' : 'New Item'}
        open={isModalVisible}
        onOk={() => {
          form.validateFields()
            .then(() => {
              if (selectedItem) handleEdit();
              else handleCreate();
            }).catch((error) => {
              console.error('error', error);
              message.error(error);
              return;
            });
        }}
        onCancel={closeModal}
        width={1000}
      >
        <ConfigurableForm initialValues={selectedItem ? selectedItem : {}} form={form} formId={addNewRecordsProps?.modalFormId} mode="edit"/>
      </Modal>
    </>
  );
};

export default KanbanReactComponent;