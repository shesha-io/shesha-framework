import React, { FC, useEffect, useRef, useContext, useState, Fragment, ReactElement, CSSProperties } from 'react';
import {
  DragDropContext,
  DropResult,
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
  Droppable,
  DroppableProvided,
} from 'react-beautiful-dnd';

import { ISizableColumnProps } from './interfaces';
import { Table, Space, Popconfirm, Button, Form, InputNumber, Modal } from 'antd';
import { MenuOutlined, PlusOutlined } from '@ant-design/icons';
import { nanoid } from '@/utils/uuid';
import { createNamedContext } from '@/utils/react';

export interface IProps {
  readOnly: boolean;
  value?: object;
  onChange?: any;
}

const EditableContext = createNamedContext(null, "EditableContext");

const DragHandleContext = createNamedContext(null, "DragHandleContext");

const EditableCell = ({ title, editable, children, dataIndex, record, handleSave, ...restProps }): ReactElement => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);

  const form = useContext(EditableContext);

  useEffect(() => {
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);

  const toggleEdit = (): void => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };

  const save = async (): Promise<void> => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.error('Save failed:', errInfo);
    }
  };

  let childNode = children;

  if (editable) {
    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0,
        }}
        name={dataIndex}
        rules={[
          {
            required: true,
            message: `${title} is required.`,
          },
        ]}
      >
        <InputNumber ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24,
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

const getItemStyle = (draggableStyle: any, isDragging: boolean): CSSProperties => ({
  padding: '2px',
  userSelect: 'none',
  background: isDragging ? 'white' : 'inherit',
  border: isDragging ? '1px dashed #000' : 'none',
  ...draggableStyle,
});

const DraggableBodyRowInner = ({ columns, className, style, ...restProps }): ReactElement => {
  const [form] = Form.useForm();

  // function findIndex base on Table rowKey props and should always be a right array index
  const rowKey = restProps['data-row-key'];

  const index = columns.findIndex((x) => x.id === restProps['data-row-key']);

  return (
    <Draggable key={rowKey} draggableId={rowKey} index={index}>
      {(providedDraggable: DraggableProvided, snapshotDraggable: DraggableStateSnapshot) => (
        <Form form={form} component={false}>
          <DragHandleContext.Provider value={{ ...providedDraggable.dragHandleProps }}>
            <EditableContext.Provider value={form}>
              <tr
                className="editable-row"
                ref={providedDraggable.innerRef}
                {...providedDraggable.draggableProps}
                style={getItemStyle(providedDraggable.draggableProps.style, snapshotDraggable.isDragging)}
                {...restProps}
              />
            </EditableContext.Provider>
          </DragHandleContext.Provider>
        </Form>
      )}
    </Draggable>
  );
};

const DragHandle = (): ReactElement => {
  const dragHandleProps = useContext(DragHandleContext);
  return (<MenuOutlined style={{ color: '#999' }} {...dragHandleProps} />);
};

export const SizableColumnsList: FC<IProps> = ({ value, onChange, readOnly }) => {
  const columns = value as ISizableColumnProps[];

  const handleDeleteTab = (key: string): void => {
    const newColumns = columns.filter((column) => column.id !== key);
    onChange(newColumns);
  };

  const handleAddColumn = (): void => {
    const newColumn: ISizableColumnProps = {
      id: nanoid(),
      size: 25,
      components: [],
    };
    const newColumns = [...columns, newColumn];
    onChange(newColumns);
  };

  const handleSaveCell = (row): void => {
    const newData = [...columns];
    const index = newData.findIndex((item) => row.id === item.id);
    const currentItem = newData[index];
    newData.splice(index, 1, { ...currentItem, ...row });

    onChange(newData);
  };

  const cols = [
    !readOnly
      ? {
        title: '',
        dataIndex: 'sort',
        width: 30,
        render: (_text, _record, _index) => {
          return <DragHandle />;
        },
      }
      : null,
    {
      title: 'Size',
      dataIndex: 'size',
      editable: !readOnly,
      width: '20%',
    },
    !readOnly
      ? {
        title: '',
        dataIndex: 'operations',
        render: (_, record) =>
          columns.length >= 1 ? (
            <Popconfirm title="Are you sure want to delete this column?" onConfirm={() => handleDeleteTab(record.id)}>
              <a>Delete</a>
            </Popconfirm>
          ) : null,
      }
      : null,
  ].filter((c) => Boolean(c));

  const tableColumns = cols.map((col) => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: (record) => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave: handleSaveCell,
      }),
    };
  });

  const onDragEnd = (result: DropResult): void => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && source.index === destination.index) return;

    const reorder = (list: ISizableColumnProps[], startIndex: number, endIndex: number): ISizableColumnProps[] => {
      const orderedList = [...list];
      const [removed] = orderedList.splice(startIndex, 1);
      orderedList.splice(endIndex, 0, removed);

      return orderedList;
    };

    if (source.droppableId === destination.droppableId) {
      const newColumns = reorder(columns, source.index, destination.index);

      onChange(newColumns);
    }
  };

  const [showDialog, setShowDialog] = useState(false);

  const toggleModal = (): void => setShowDialog((prevVisible) => !prevVisible);

  return (
    <Fragment>
      <Button size="small" onClick={toggleModal}>{readOnly ? 'View Columns' : 'Configure Columns'}</Button>

      <Modal
        title={readOnly ? 'View Columns' : 'Configure Columns'}
        open={showDialog}
        width="650px"
        onOk={toggleModal}
        okButtonProps={{ hidden: readOnly }}
        onCancel={toggleModal}
        cancelText={readOnly ? 'Close' : undefined}
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="columns">
              {(provided: DroppableProvided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  <Table
                    scroll={{ x: 'mex-content' }}
                    bordered
                    pagination={false}
                    dataSource={columns}
                    columns={tableColumns}
                    rowKey={(r) => r.id}
                    components={{
                      body: {
                        row: ({ className, style, ...restProps }) => (
                          <DraggableBodyRowInner columns={columns} className={className} style={style} {...restProps} />
                        ),
                        cell: EditableCell,
                      },
                    }}
                  />
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
          {!readOnly && (
            <div>
              <Button type="default" onClick={handleAddColumn} icon={<PlusOutlined />}>
                Add Column
              </Button>
            </div>
          )}
        </Space>
      </Modal>
    </Fragment>
  );
};

export default SizableColumnsList;
