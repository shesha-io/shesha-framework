import { DeleteFilled, MenuOutlined, PlusCircleOutlined } from '@ant-design/icons';
import { Button } from 'antd';
import React, { FC, PropsWithChildren, useMemo } from 'react';
import { ReactSortable } from 'react-sortablejs';
import { ListEditorChildrenFn } from '.';
import { IListEditorContext } from './contexts';
import { ListItem, SortableItem } from './models';

export interface IListEditorRendererProps<TItem = any> {
    contextAccessor: () => IListEditorContext<TItem>;
    children: ListEditorChildrenFn<TItem>;
}

export const ListEditorRenderer = <TItem extends ListItem,>(props: IListEditorRendererProps<TItem>) => {
    const { contextAccessor, children } = props;
    const { value, deleteItem, addItem, updateItem, updateList, readOnly } = contextAccessor();
    
    const onAddClick = () => {
        addItem();
    };

    const itemOnChange = (index: number, newValue: TItem) => {
        updateItem(index, newValue);
    };

    const sortableItems = useMemo(() => {
        return Boolean(value) && Array.isArray(value)
            ? value.map<SortableItem<TItem>>((item, index) => ({ data: item, id: index }))
            : undefined;
    }, [value]);

    const onSetList = (newState: SortableItem<TItem>[], _sortable, _store) => {
        const chosen = newState.some(item => item.chosen === true);
        if (chosen)
            return;

        if (value.length === newState.length) {
            const changedIndex = newState.find((item, index) => {
                //return item.id !== value[index].id;
                return item.data !== value[index];
            });
            if (changedIndex) {
                const rawItems = newState.map<TItem>(m => m.data);
                updateList(rawItems);
            };
        };
    };

    return (
        <div className="sha-list">
            <div className="sha-list-header">
                <Button icon={<PlusCircleOutlined />} shape="round" onClick={onAddClick} size="small" disabled={readOnly}>Add</Button>
            </div>
            <div className="sha-list-container">
                {sortableItems && (
                    <ReactSortable<SortableItem<TItem>>
                        list={sortableItems}
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
                        disabled={readOnly}
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
                                    readOnly={readOnly}
                                >
                                    {children({ 
                                        item, 
                                        itemOnChange: localItemChange, 
                                        index, 
                                        readOnly: readOnly === true 
                                    })}
                                </ListItemWrapper>);
                        })}
                    </ReactSortable>
                )}
            </div>
        </div>
    );
};

export interface IListItemWrapperProps extends PropsWithChildren {
    onDelete: () => void;
    readOnly?: boolean;
}
export const ListItemWrapper: FC<IListItemWrapperProps> = ({ children, onDelete, readOnly }) => {
    const onDeleteClick = () => {
        onDelete();
    };

    return (
        <div className='sha-list-item'>
            {!readOnly && (
                <span className="sha-drag-handle">
                    <MenuOutlined />
                </span>
            )}
            <div className='sha-list-item-content'>
                {children}
            </div>
            {!readOnly && (
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
            )}
        </div>
    );
};


export default ListEditorRenderer;