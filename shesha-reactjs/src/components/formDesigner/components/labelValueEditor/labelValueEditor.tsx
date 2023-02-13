import React, { FC, useEffect, useRef, useContext, useState, Fragment } from 'react';
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
import { ILabelValueEditorPropsBase, IItemProps } from './models';
import { Table, Popconfirm, Button, Form, Input, Modal, Alert, Tabs } from 'antd';
import { BorderlessTableOutlined, DeleteOutlined, MenuOutlined, PlusOutlined } from '@ant-design/icons';
import { nanoid } from 'nanoid/non-secure';
import ConditionalWrap from '../../../conditionalWrapper';
import Show from '../../../show';
import { CodeVariablesTables, ICodeExposedVariable } from '../../../codeVariablesTable';

export interface ILabelValueEditorProps extends ILabelValueEditorPropsBase {
  /**
   * Selected value
   */
  value?: object;

  /**
   * On change event handler
   */
  onChange?: any;

  /**
   * If true, when a new row has been added, both the name of the key and value will not be prefixed with 'new '
   */
  ignorePrefixesOnNewItems?: boolean;

  mode?: 'dialog' | 'inline';

  exposedVariables?: ICodeExposedVariable[];

  description?: string;

  readOnly?: boolean;
}

const EditableContext = React.createContext(null);
const DragHandleContext = React.createContext(null);

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: keyof IItemProps;
  record: IItemProps;
  handleSave: (record: IItemProps) => void;
}

const EditableCell: FC<EditableCellProps> = ({ title, editable, children, dataIndex, record, handleSave, ...restProps }) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    setEditing(!editing);
    form.setFieldsValue({
      [dataIndex]: record[dataIndex],
    });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.log('Save failed:', errInfo);
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
        <Input ref={inputRef} onPressEnter={save} onBlur={save} />
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        // style={{
        //   paddingRight: 24,
        // }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

const getItemStyle = (draggableStyle: any, isDragging: boolean): {} => ({
  padding: '2px',
  userSelect: 'none',
  background: isDragging ? 'white' : 'inherit',
  border: isDragging ? '1px dashed #000' : 'none',
  ...draggableStyle,
});

const DraggableBodyRowInner = ({ items, className, style, ...restProps }) => {
  const [form] = Form.useForm();

  // function findIndex base on Table rowKey props and should always be a right array index
  const rowKey = restProps['data-row-key'];

  if (!rowKey) return null;

  const index = items.findIndex(x => x.id === restProps['data-row-key']);

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

export const LabelValueEditor: FC<ILabelValueEditorProps> = ({
  value,
  onChange,
  labelTitle,
  labelName,
  valueTitle,
  valueName,
  ignorePrefixesOnNewItems = false,
  description,
  mode = 'dialog',
  exposedVariables,
  readOnly = false,
}) => {
  const [showModal, setShowModal] = useState(false);

  const items = (value as IItemProps[]) || [];

  const DragHandle = props => <MenuOutlined style={{ color: '#999' }} {...props} />;

  const handleDeleteRow = (id: string) => {
    const newRows = items.filter(row => row.id !== id);

    onChange(newRows);
  };

  const handleAddRow = () => {
    const newRow = {
      id: nanoid(),
      [labelName]: ignorePrefixesOnNewItems ? labelTitle : `new ${labelTitle}`,
      [valueName]: ignorePrefixesOnNewItems ? valueTitle : `new ${valueTitle}`,
    };
    const newRows = [...items, newRow];
    onChange(newRows);
  };

  const handleSaveCell = row => {
    const newData = [...items];
    const index = newData.findIndex(currentItem => row.id === currentItem.id);
    const item = newData[index];
    newData.splice(index, 1, { ...item, ...row });

    onChange(newData);
  };

  const cols = [
    readOnly
      ? null
      : {
        title: '',
        dataIndex: 'sort',
        width: '30',
        render: (_text, _record, _index) => {
          const dragHandleProps = useContext(DragHandleContext);
          return <DragHandle {...dragHandleProps} />;
        },
      },
    {
      title: labelTitle,
      dataIndex: labelName,
      editable: !readOnly,
      width: '30%',
    },
    {
      title: valueTitle,
      dataIndex: valueName,
      width: '30%',
      editable: !readOnly,
    },
    readOnly
      ? null
      : {
        title: '',
        dataIndex: 'operations',
        width: '30',
        render: (_, record) =>
          items.length >= 1 ? (
            <Popconfirm title="Are you sure want to delete this item?" onConfirm={() => handleDeleteRow(record.id)}>
              <DeleteOutlined />
            </Popconfirm>
          ) : null,
      },
  ];

  const columns = cols.filter(c => Boolean(c)).map(col => {
    if (!col.editable) {
      return col;
    }

    return {
      ...col,
      onCell: record => ({
        record,
        editable: col.editable,
        dataIndex: col.dataIndex,
        title: col.title,
        handleSave: handleSaveCell,
      }),
    };
  });

  const toggleModal = () => setShowModal(currentVisible => !currentVisible);

  const getListStyle = (_isDraggingOver: boolean) => ({
    //background: isDraggingOver ? "lightgrey" : "inherit",
    //overflow: "scroll" as "scroll",
  });

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (destination.droppableId === source.droppableId && source.index === destination.index) return;

    const reorder = (list: IItemProps[], startIndex: number, endIndex: number): IItemProps[] => {
      const orderedList = [...list];
      const [removed] = orderedList.splice(startIndex, 1);
      orderedList.splice(endIndex, 0, removed);

      return orderedList;
    };

    if (source.droppableId === destination.droppableId) {
      const newTabs = reorder(items, source.index, destination.index);

      onChange(newTabs);
    }
  };

  return (
    <ConditionalWrap
      condition={mode === 'dialog'}
      wrap={children => (
        <Fragment>
          <Button onClick={toggleModal} size="small" icon={<BorderlessTableOutlined />}>
            {readOnly ? 'Click to View Items' : 'Click to Add Items'}
          </Button>

          <Modal
            title={readOnly ? 'View Items' : 'Add Items'}
            open={showModal}
            width={650}

            onOk={toggleModal}
            okButtonProps={{ hidden: readOnly }}

            onCancel={toggleModal}
            cancelText={readOnly ? 'Close' : undefined}
          >
            <Show when={!!description}>
              <Alert type="info" message={description} />
              <br />
            </Show>

            <Tabs>
              <Tabs.TabPane tab="Key/Value pairs" key="keyValuePairs">
                {children}
              </Tabs.TabPane>
              <Tabs.TabPane tab="Variables" key="variable">
                <CodeVariablesTables data={exposedVariables} />
              </Tabs.TabPane>
            </Tabs>
          </Modal>
        </Fragment>
      )}
    >
      <div className="sha-labelvalueeditor">
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId={'keyValueItems'} isDropDisabled={readOnly}>
            {(provided: DroppableProvided, snapshot: DroppableStateSnapshot) => (
              <div ref={provided.innerRef} {...provided.droppableProps} style={getListStyle(snapshot.isDraggingOver)}>
                <Table
                  scroll={{ x: 'mex-content' }}
                  bordered
                  pagination={false}
                  dataSource={items}
                  columns={columns}
                  rowKey={r => r.id}
                  components={{
                    body: {
                      row: ({ className, style, ...restProps }) => (
                        <DraggableBodyRowInner
                          items={items}
                          mode={mode}
                          className={className}
                          style={style}
                          {...restProps}
                        />
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
          <div className="sha-labelvalueeditor-buttons">
            <Button type="default" onClick={handleAddRow} icon={<PlusOutlined />}>
              Add Item
            </Button>
          </div>
        )}
      </div>
    </ConditionalWrap>
  );
};

export default LabelValueEditor;
