import { Button, Dropdown, Flex, MenuProps, Popconfirm } from 'antd';
import React, { CSSProperties, useEffect, useState } from 'react';
import { ReactSortable } from 'react-sortablejs';
import { IKanbanComponentProps } from './model';
import { getColumns, getHeight, getMetaData, useUpdateKanban } from './utils';
import { KanbanPlaceholder } from './placeholder';
import { ConfigurableForm, useFormState, useGet, useModal } from '@/index';
import { IModalProps } from '@/providers/dynamicModal/models';
import { nanoid } from '@/utils/uuid';
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
  const [updateUrl, setUpdateUrl] = useState();
  const [tasks, setTasks] = useState([]);
  const { refetch } = useGet({ path: '', lazy: true });
  const { formMode } = useFormState();
  const isInDesigner = formMode === 'designer';
  const { updateKanban } = useUpdateKanban();
  const [modalId] = useState(nanoid());
  const { styles } = useStyles();

  useEffect(() => {
    if (!isInDesigner && entityType && groupingProperty) {
      refetch(getMetaData('/api/services/app/Metadata/Get', entityType)).then((resp: any) => {
        const type = resp.result.properties.find(
          (x: any) => x.path.toLowerCase() === groupingProperty.toLowerCase()
        )?.dataType;

        if (type === 'reference-list-item') {
          setUpdateUrl(resp.result.apiEndpoints.update.url);
          refetch({ path: `${resp.result.apiEndpoints.list.url}` })
            .then((resp) => {
              setTasks(resp.result.items);
            })
            .catch((err) => console.error('Error fetching tasks:', err));
        }
      });
      refetch(getColumns('/api/services/app/Entities/GetAll', entityType))
        .then((resp: any) => {
          setColumns(resp?.result?.items);
        })
        .catch((err) => console.error('Error fetching columns:', err));
    }
  }, [groupingProperty]);
  const handleUpdate = async (newTasks: any[], columnValue: any) => {
    setTasks((prevTasks) => {
      const updatedTasks = prevTasks.map((task) => {
        const movedTask = newTasks.find((newTask) => newTask.id === task.id);
        if (movedTask && task[groupingProperty] !== columnValue) {
          // Task has moved to a new column
          const updatedTask = { ...task, [groupingProperty]: columnValue };
          const payload = { id: task.id, [groupingProperty]: columnValue };
          updateKanban(payload, updateUrl);

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

  const modalProps: IModalProps = {
    id: modalId,
    isVisible: false,
    formId: addNewRecordsProps?.modalFormId,
    title: addNewRecordsProps?.modalTitle,
    showModalFooter: false, //doing this allows the modal to depend solely on the footerButtons prop
    width: addNewRecordsProps?.modalWidth,
    buttons: addNewRecordsProps?.buttons,
    footerButtons: addNewRecordsProps?.footerButtons,
  };

  const dynamicModal = useModal(modalProps);

  const onAddNew = () => {
    if (addNewRecordsProps.modalFormId) {
      dynamicModal.open();
    } else console.warn('Modal Form is not specified');
  };

  const handleEdit = (id: string) => {
    console.log('Edit task with id:', id);
    // Add your edit logic here
  };

  const handleDelete = (id: string) => {
    console.log('Delete task with id:', id);
    // Add your delete logic here
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
                        <Button type="text" onClick={onAddNew} size={size} icon={<PlusOutlined />} />
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
                              onClick: () => handleEdit(t.id),
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
                            <div className={styles.container}>
                              <ConfigurableForm initialValues={t} formId={modalFormId} mode={'readonly'} />
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
              );
            })}
          </Flex>
        </div>
      )}
    </>
  );
};

export default KanbanReactComponent;
