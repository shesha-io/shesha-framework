import React, { useState } from 'react';
import { Button, Dropdown, Popconfirm } from 'antd';
import { ReactSortable } from 'react-sortablejs';
import { PlusOutlined, MoreOutlined, RightOutlined, LeftOutlined, SettingFilled } from '@ant-design/icons';
import { ConfigurableForm } from '@/index';
import { MenuProps } from 'antd';
import { Flex } from 'antd';
import { CSSProperties } from 'react';

interface KanbanColumnProps {
  column: any;
  columnTasks: any[];
  groupingProperty: string;
  readonly: boolean;
  externalColumnStyle: CSSProperties;
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

const RenderColumn: React.FC<KanbanColumnProps> = ({
  column,
  columnTasks,
  readonly,
  externalColumnStyle,
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
    // const { mutate } = useMutate<any>();
  const [isCollapsed, setIsCollapsed] = useState(false);


//   const updateSettings = (columnItemValue: any, isCollapsed: boolean) => {
//     mutate(
//       {
//         url: '/api/services/app/Settings/UpdateUserValue',
//         httpVerb: 'POST',
//       },
//       {
//         name: `refListItems.${columnItemValue}`,
//         module: 'Shesha',
//         value: isCollapsed, // Store collapsed state
//           "datatype": "boolean"
//       }
//     )
//       .then((resp: any) => {
//         if (resp.success) {
//           console.log('Collapse state updated successfully');
//         }
//       })
//       .catch((error: any) => {
//         console.error('Error updating collapse state:', error);
//       });
//   };
  

//   useEffect(() => {
//     if (column.itemValue) {
//       updateSettings(column.itemValue, isCollapsed);
//     }
//   }, [isCollapsed]);

  // Toggle the fold/unfold state
  const toggleFold = () => {
    setIsCollapsed(!isCollapsed);
  };

  const columnDropdownItems: MenuProps['items'] = [
    {
      key: '1',
      label: 'Add',
      onClick: () => handleCreateClick(column.itemValue),
      icon: <PlusOutlined />,
    },
    {
      key: '2',
      label: isCollapsed? 'Uncollapse' : 'Collapse',
      onClick: toggleFold,
      icon: isCollapsed ? <RightOutlined /> : <LeftOutlined />
    },
  ];

  const columnStyle: CSSProperties = {
    flex: '1 0 100px',
    justifyContent: 'space-between',
    margin: '0 10px',
    padding: '0px',
    border: '1px solid #ddd',
    marginBottom: '10px',
    backgroundColor: '#f5f5f5',
    transition: 'background-color 0.3s, width 0.9s ease', // Smooth transition for width    flexGrow: 1,
    boxSizing: 'border-box',
    width: '250px',
    maxWidth: '250px',
    height: '300px', 
    display: 'flex',
    flexDirection: 'column', 
    scrollbarWidth: 'none',  
    msOverflowStyle: 'none',
  };

 const collapseColumnStyle: CSSProperties = {
    ...columnStyle,
    width: 35, 
    backgroundColor:  '#f0f0f0',
    transition: 'width 0.9s ease',
    position: 'relative',
    flex: '0 0 auto',
 };
 console.log('collapseColumnStyle', collapseColumnStyle);

 const headerStyle: CSSProperties ={
    ...newHeaderStyle,
    transition: 'width 0.9s ease',
    writingMode: 'vertical-rl',
    transform: 'rotate(180deg)', 
    textAlign: 'center',
    width: '35px',
    height: '100%',
    padding: '10px 0',
 };

  return (
    <>
      {column.hidden ? null : (
        <div key={column.id} style={isCollapsed ? collapseColumnStyle : columnStyle} data-column-id={column.id}>
          {/* Header with Add button and dropdown */}
          <Flex justify="space-between" align="center" style={isCollapsed ? headerStyle : newHeaderStyle}>
            <h3>
              {column.item} ({columnTasks.length})
            </h3>
            <Flex align="center">
              {/* Dropdown for Add and Fold/Unfold */}
              <Dropdown trigger={['click']} menu={{ items: columnDropdownItems }} placement="bottomRight">
                <Button type="text" icon={< SettingFilled />} />
              </Dropdown>
              
            </Flex>
          </Flex>

          {/* Sortable list of tasks */}
          {!isCollapsed && (
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
              className={styles.container}
              style={{ 
                flex: '1',  // Let the sortable task list take the remaining column height
                overflowY: 'auto',  // Scrollable when it overflows
                minHeight: '400px',
                maxHeight: '400px',  // Optional, you can adjust this based on the column's height
                padding: '10px'
              }}
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
                  const taskDropdownItems: MenuProps['items'] = [
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
                        className={styles.container}
                      />
                      <Dropdown trigger={['click']} menu={{ items: taskDropdownItems }} placement="bottomRight">
                        <Button type="text" className={`${styles.threeDotsStyle} three-dots`} icon={<MoreOutlined />} />
                      </Dropdown>
                    </div>
                  );
                })
              )}
            </ReactSortable>
          )}
        </div>
      )}
    </>
  );
};

export default RenderColumn;
