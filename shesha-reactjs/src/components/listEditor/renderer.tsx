import { DeleteFilled, MenuOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React, { FC, PropsWithChildren } from 'react';
import { ReactSortable } from 'react-sortablejs';
import { ListEditorChildrenFn } from '.';
import { IListEditorContext } from './contexts';
import { ListItemType } from './models';

export interface IListEditorRendererProps<TItem = any> {
    contextAccessor: () => IListEditorContext<TItem>;
    children: ListEditorChildrenFn<TItem>;
}

export const ListEditorRenderer = <TItem extends ListItemType,>(props: IListEditorRendererProps<TItem>) => {
    const { contextAccessor, children } = props;
    const { value, deleteItem, addItem, updateItem, updateList } = contextAccessor();

    const onAddClick = () => {
        addItem();
    };

    const itemOnChange = (index: number, newValue: TItem) => {
        updateItem(index, newValue);
    };

    const onSetList = (newState: TItem[], _sortable, _store) => {
        const chosen = newState.some(item => item.chosen === true);
        if (chosen)
            return;

        if (value.length === newState.length) {
            const changedIndex = newState.find((item, index) => {
                return item.id !== value[index].id;
            });
            if (changedIndex) {
                // reorder!
                updateList(newState);
            };
        };
    };

    return (
        <div className="sha-list">
            <div className="sha-list-header">
                <Button icon={<PlusCircleOutlined />} shape="round" onClick={onAddClick} size="small">Add</Button>
            </div>
            <div className="sha-list-container">
                <ReactSortable<TItem>
                    list={value}
                    setList={onSetList}
                    fallbackOnBody={true}
                    swapThreshold={0.5}
                    group={{
                        name: 'rows',
                    }}
                    sort={true}
                    draggable=".sha-list-item"
                    animation={75}
                    ghostClass="sha-list-item-ghost"
                    emptyInsertThreshold={20}
                    handle=".sha-drag-handle"
                    scroll={true}
                    bubbleScroll={true}
                >
                    {value.map((item, index) => {
                        const localItemChange = (newValue: TItem) => {
                            itemOnChange(index, newValue);
                        };
                        return (
                            <ListItemWrapper
                                key={index}
                                onDelete={() => {
                                    deleteItem(index);
                                }}
                            >
                                {children(item, localItemChange, index)}
                            </ListItemWrapper>);
                    })}
                </ReactSortable>
            </div>
        </div>
    );
};

export interface IListItemWrapperProps extends PropsWithChildren {
    onDelete: () => void;
}
export const ListItemWrapper: FC<IListItemWrapperProps> = ({ children, onDelete }) => {
    const onDeleteClick = () => {
        onDelete();
    };

    return (
        <div className='sha-list-item'>
            <span className="sha-drag-handle">
                <MenuOutlined />
            </span>
            <div className='sha-list-item-content'>
                {children}
            </div>
            <div className='sha-list-item-controls'>
                <Button
                    icon={<DeleteFilled color="red" />}
                    onClick={onDeleteClick}
                    size="small"
                    shape="circle"
                    danger
                    type="link"
                />
            </div>
        </div>
    );
};


export default ListEditorRenderer;