import { Button, Dropdown, Flex, Form, MenuProps, message, Modal, Popconfirm } from 'antd';
import React, { CSSProperties, useEffect, useState } from 'react';
import { ReactSortable } from 'react-sortablejs';
import { IKanbanComponentProps } from './model';
import { getColumns, getHeight, getMetaData, useKanbanActions } from './utils';
import { KanbanPlaceholder } from './placeholder';
import { ConfigurableForm, useFormState, useGet} from '@/index';
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
  const { updateKanban , deleteKanban, createKanbanItem} = useKanbanActions();
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
          setUrls({updateUrl:endpoints.update.url, deleteUrl: endpoints.delete.url, postUrl: endpoints.create.url});
          refetch({ path: `${resp.result.apiEndpoints.list.url}?maxResultCount=1000` })
            .then((resp) => {
              setTasks(resp.result.items.filter((x: any)=> x[`${groupingProperty}`] !== null));
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
          // Task has moved to a new column
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
    border: '2px solid red',
    fontSize: 100,
    borderRadius: 5,
    padding: '0 10px',
    marginBottom: 10,
  };
  const newHeaderStyle = { ...hStyle, ...headerStyle, fontSize, backgroundColor, color };
  const newStyle = { ...style, ...columnStyle, ...getHeight(height, minHeight, maxHeight) };


  const onAddNew = (item: any) => {
    setSelectedColumn(item);
   setIsModalVisible(true);
  };

  const handleEditClick = (item: string) => {
    setSelectedItem(item);
    setIsModalVisible(true);
  };

  const handleEdit = () => {
    const updatedItem = form.getFieldsValue();
    updatedItem.id = selectedItem.id;
    updateKanban(updatedItem, urls.updateUrl);
    setIsModalVisible(false);
    setSelectedItem(null);
  };

  const handleDelete = (id: string) => {
    const updatedTasks = tasks.filter((task) => task.id !== id);
    setTasks(updatedTasks);
    deleteKanban(id, urls.deleteUrl);
    setTrigger((prev)=> prev+1);
  };

  const handleCreate = () =>{
    const newValues = form.getFieldsValue();
    newValues[groupingProperty] = selectedColumn;
    createKanbanItem(newValues, urls.postUrl);
  };


  const closeModal = () => {
    setIsModalVisible(false);
    form.resetFields();
    setSelectedItem(null);
};
  return (
    <>
      {isInDesigner ? (
        <KanbanPlaceholder />
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <Flex gap={gap || 10} style={{ display: 'flex', minWidth: '1000px' }}>
            {columns?.map((c: any, colIndex: any) => {
              const filteredTasks = tasks.filter((task) => task[groupingProperty] === c.itemValue);
              const taskCount = filteredTasks.length;
              return (
                <div key={colIndex} style={newStyle}>
                  <div style={{ flexGrow: 1 }}>
                    <Flex
                      justify={addNewRecordsProps ? 'space-between' : 'center'}
                      align="center"
                      style={{ width: '100%', ...newHeaderStyle }}
                    >
                      <h3>
                        {c.item} ({taskCount})
                      </h3>
                      {addNewRecordsProps ? (
                        <Button type="text" onClick={()=>onAddNew(c.itemValue)} size={size} icon={<PlusOutlined />} />
                      ) : null}
                    </Flex>
                    <ReactSortable
                      list={filteredTasks}
                      setList={(newTasks) => handleUpdate(newTasks, c.itemValue)}
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
                      {filteredTasks.length === 0 ? (
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
                        filteredTasks.map((t) => {
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
                           <>
                             <div className={styles.container}>
                              <ConfigurableForm key={t.id} initialValues={{...t}} formId={modalFormId} mode={'readonly'} />
                              <Dropdown trigger={['click']} menu={{ items }} placement="bottomRight">
                                <Button type="text" className={`${styles.threeDotsStyle} three-dots`} icon={<MoreOutlined />} />
                              </Dropdown>                             
                            </div>
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
                                <ConfigurableForm initialValues={selectedItem ? selectedItem : {}} form={form} formId={addNewRecordsProps?.modalFormId} mode="edit" />
                            </Modal>
                           </>
                          );
                        })
                      )}
                    </ReactSortable>
                  </div>
                </div>
              );
            })}
          </Flex>
        </div>
      )}
    </>
  );
};

export default KanbanReactComponent;
