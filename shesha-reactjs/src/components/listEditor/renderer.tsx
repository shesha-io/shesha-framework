import React, { useMemo } from 'react';
import { Button } from 'antd';
import { IListEditorContext } from './contexts';
import { ListEditorChildrenFn } from '.';
import { ListItem, SortableItem } from './models';
import { PlusCircleOutlined } from '@ant-design/icons';
import { ReactSortable } from 'react-sortablejs';
import { useStyles } from './styles/styles';
import { ListItemWrapper } from './listItemWrapper';

export interface IListEditorRendererProps<TItem = any> {
    contextAccessor: () => IListEditorContext<TItem>;
    children: ListEditorChildrenFn<TItem>;
}

export const ListEditorRenderer = <TItem extends ListItem,>(props: IListEditorRendererProps<TItem>) => {
    const { styles } = useStyles();
    const { contextAccessor, children } = props;
    const { value, deleteItem, addItem, insertItem, updateItem, updateList, readOnly } = contextAccessor();

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
        <div className={styles.list}>
            <div className={styles.listHeader}>
                <Button icon={<PlusCircleOutlined />} shape="round" onClick={onAddClick} size="small" disabled={readOnly}>Add</Button>
            </div>
            <div className={styles.listContainer}>
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
                        draggable={`.${styles.listItem}`}
                        animation={75}
                        ghostClass={styles.listItemGhost}
                        emptyInsertThreshold={20}
                        handle={`.${styles.dragHandle}`}
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
                                    onInsert={(insertPosition) => {
                                        const newIndex = index + (insertPosition === 'before' ? 0 : 1);
                                        insertItem(newIndex);
                                    }}
                                    readOnly={readOnly}
                                    isLast={index === value.length - 1}
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