import React, { CSSProperties, useEffect, useState, useMemo } from 'react';
import { Button, Dropdown, Flex, Form, MenuProps, message, Modal, Popconfirm } from 'antd';
import { ReactSortable } from 'react-sortablejs';
import { IKanbanComponentProps } from './model';
import { getColumns, getHeight, getMetaData, useKanbanActions } from './utils';
import { KanbanPlaceholder } from './placeholder';
import { ConfigurableForm, useFormState, useGet } from '@/index';
import { MoreOutlined, PlusOutlined } from '@ant-design/icons';
import { useStyles } from './styles';

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
  const [formKey, setFormKey] = useState('initial');
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

  const style: CSSProperties = {
    flex: '1 0 200px',
    justifyContent: 'space-between',
    margin: '0 10px',
    padding: '10px',
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
    marginBottom: 10,
  };

  const newHeaderStyle = { ...hStyle, ...headerStyle, fontSize, backgroundColor, color };
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
    setFormKey(Date.now().toString());  // To force re-render of the form
    setSelectedColumn(columnValue);
    setSelectedItem(undefined); // Ensure no item is selected for adding new
    form.resetFields(); // Reset the form to clear previous values
    setIsModalVisible(true);
  };
  
  const closeModal = () => {
    setIsModalVisible(false);
    form.resetFields();
    setSelectedItem(undefined);
    console.log('close modal', selectedItem);
    
};


  const memoizedFilteredTasks = useMemo(() => {
    return columns.map(column => ({
      column,
      tasks: tasks.filter(task => {
        return task[groupingProperty] === column.itemValue;
      })
    }));
  }, [columns, tasks, groupingProperty]);

  return (
    <>
      {isInDesigner ? (
        <KanbanPlaceholder />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <Flex gap={gap || 10} style={{ display: 'flex', minWidth: '1000px' }}>
            {memoizedFilteredTasks.map(({ column, tasks: columnTasks }) => (
              <div key={column.itemValue} style={newStyle}>
                <div style={{ flexGrow: 1 }}>
                  <Flex
                    justify={addNewRecordsProps ? 'space-between' : 'center'}
                    align="center"
                    style={{ width: '100%', ...newHeaderStyle }}
                  >
                    <h3>
                      {column.item} ({columnTasks.length})
                    </h3>
                    {addNewRecordsProps ? (
                      <Button type="text" onClick={() => handleCreateClick(column.itemValue)} size={size} icon={<PlusOutlined style={{color: '#ffffff'}}/>} />
                    ) : null}
                  </Flex>
                  <ReactSortable
                    list={columnTasks}
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
                    {columnTasks.length === 0 ? (
                      <div
                        style={{
                          textAlign: 'center',
                          color: '#999',
                          padding: '20px',
                          border: '1px dashed #d9d9d9',
                          borderRadius: '5px',
                        }}
                      >
                        No Item Found
                      </div>
                    ) : (
                      columnTasks.map((t, index) => {
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
                            key={selectedItem ? selectedItem.id : 'new-item'} 
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
                </div>
              </div>
            ))}
          </Flex>
        </div>
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