import React, { FC, useEffect, useRef, useContext, useState, Fragment, ReactElement, CSSProperties } from 'react';
import {
  DragDropContext,
  DropResult,
  Draggable,
  DraggableProvided,
  DraggableStateSnapshot,
  Droppable,
  DroppableProvided,
  DroppableStateSnapshot,
} from 'react-beautiful-dnd';

import { Table, Space, Popconfirm, Button, Form, Modal, Select, Input, Tooltip } from 'antd';
import { DeleteFilled, MenuOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import { nanoid } from '@/utils/uuid';
import { KeyInfomationBarItemProps } from './interfaces';
import { strings } from '@/components/keyInformationBar/utils';
import { SizeType } from 'antd/lib/config-provider/SizeContext';

export interface IProps {
  readOnly: boolean;
  value?: object;
  onChange?: any;
  size?: SizeType;
}

const EditableContext = React.createContext(null);
const DragHandleContext = React.createContext(null);

const tooltip = (): ReactElement => (
  <Tooltip title={strings.tooltip}>
    <QuestionCircleOutlined className="tooltip-question-icon" size={14} color="gray" />
  </Tooltip>
);

const EditableCell = ({ title, editable, children, dataIndex, record, handleSave, isDropdown, ...restProps }): ReactElement => {
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

  const { Option } = Select;


  const textAlignValues = ['start', 'end', 'center', 'inherit'];
  const flexDirectionValues = ['row', 'column', 'row-reverse', 'column-reverse'];

  const Dropdown = (ref, values): ReactElement =>
    (
      <Select ref={ref} onSelect={save} onBlur={save}>
        {values.map((value, i) => (
          <Option key={i} value={value}>{value.split('-').map((word) => {
            return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
          }).join(' ')}
          </Option>
        ))}
      </Select>
    );

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
        {dataIndex === "textAlign"
          ? Dropdown(inputRef, textAlignValues) : dataIndex === "flexDirection"
            ? Dropdown(inputRef, flexDirectionValues) : <Input ref={inputRef} onPressEnter={save} onBlur={save} />}
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

  return <MenuOutlined style={{ color: '#999' }} {...dragHandleProps} />;
};


export const ColumnsList: FC<IProps> = ({ value, onChange, readOnly, size }) => {
  const columns = value as KeyInfomationBarItemProps[];

  const handleDeleteTab = (key: string): void => {
    const newColumns = columns.filter((column) => column.id !== key);
    onChange(newColumns);
  };

  const handleAddColumn = (): void => {
    const newColumn: KeyInfomationBarItemProps = {
      id: nanoid(),
      width: 200,
      textAlign: 'center',
      flexDirection: "column",
      components: [],
      padding: '0px',
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
      title: "Width",
      dataIndex: 'width',
      editable: !readOnly,
      width: '20%',
      tooltip: strings.tooltip,
    },
    {
      title: 'Text Align',
      dataIndex: 'textAlign',
      editable: !readOnly,
      width: '20%',
    },
    {
      title: 'Flex Direction',
      dataIndex: 'flexDirection',
      editable: !readOnly,
      width: '20%',
    },
    {
      title: 'Padding',
      dataIndex: 'padding',
      editable: !readOnly,
      width: '20%',
    },
    !readOnly
      ? {
        title: '',
        width: 10,
        dataIndex: 'operations',
        render: (_, record) =>
          columns.length >= 1 ? (
            <Popconfirm title="Are you sure want to delete this column?" onConfirm={() => handleDeleteTab(record.id)}>
              <a><DeleteFilled color="red" /></a>
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

  const getListStyle = (_isDraggingOver: boolean): Pick<CSSProperties, 'background' | 'overflow'> => ({
    background: _isDraggingOver ? "lightgrey" : "inherit",
    overflow: "scroll" as "scroll",
  });

  const onDragEnd = (result: DropResult): void => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && source.index === destination.index) return;

    const reorder = (list: KeyInfomationBarItemProps[], startIndex: number, endIndex: number): KeyInfomationBarItemProps[] => {
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
      <Button size={size} onClick={toggleModal}>{readOnly ? 'View Columns' : 'Configure Columns'}</Button>

      <Modal
        title={readOnly ? 'View Columns' : <>Configure Columns {tooltip()}</>}
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
              {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
                <div ref={provided.innerRef} {...provided.droppableProps} style={{ ...getListStyle(snapshot.isDraggingOver), overflow: "hidden" }}>
                  <Table
                    style={{ overflow: "hidden" }}
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

export default ColumnsList;
