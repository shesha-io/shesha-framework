import React from 'react';
import { Button, Card, Dropdown, Popconfirm } from 'antd';
import { ReactSortable } from 'react-sortablejs'; // Import MoveEvent for typing
import { PlusOutlined, MoreOutlined } from '@ant-design/icons';
import { ConfigurableForm } from '@/index';
import { MenuProps } from 'antd';
import { Flex } from 'antd';
import { CSSProperties } from 'react';

interface KanbanColumnProps {
  column: any;
  columnTasks: any[];
  groupingProperty: string;
  readonly: boolean;
  newStyle: CSSProperties;
  newHeaderStyle: CSSProperties;
  handleUpdate: (newTasks: any[], columnValue: any) => void;
  onEnd: (evt: any, column: any) => void;
  handleEditClick: (item: any) => void;
  handleDelete: (id: string) => void;
  handleCreateClick: (columnValue: any) => void;
  styles: any;
  selectedItem: any;
  modalFormId: string;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({
  column,
  columnTasks,
  readonly,
  newStyle,
  newHeaderStyle,
  handleUpdate,
  onEnd, 
  handleEditClick,
  handleDelete,
  handleCreateClick,
  styles,
  selectedItem,
  modalFormId,
}) => {
  const header = (
    <Flex justify="space-between" align="center" style={{ width: '100%', ...newHeaderStyle }}>
      <h3>
        {column.item} ({columnTasks.length})
      </h3>
      <Button type="text" onClick={() => handleCreateClick(column.itemValue)} icon={<PlusOutlined />} />
    </Flex>
  );


  return (
    <>
      {column.hidden ? null : (
        <Card title={header} key={column.id} style={newStyle} data-column-id={column.id}>
          <ReactSortable
            list={columnTasks}
            setList={(newTasks) => handleUpdate(newTasks, column)}
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
            onEnd={(evt) => onEnd(evt, column)}
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
              columnTasks.map((t) => {
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
                  <div key={t.id} className={styles.container} data-id={t.id}>
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
        </Card>
      )}
    </>
  );
};

export default KanbanColumn;
