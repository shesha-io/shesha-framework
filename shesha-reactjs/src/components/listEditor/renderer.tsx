import React, { useMemo } from 'react';
import { Button } from 'antd';
import { IListEditor, IListEditorContext } from './contexts';
import { ItemChangeDetails, ListEditorChildrenFn, ListEditorSectionRenderingFn } from '.';
import { ListItem, SortableItem } from './models';
import { PlusCircleOutlined } from '@ant-design/icons';
import { ReactSortable } from 'react-sortablejs';
import { useStyles } from './styles/styles';
import { ListItemWrapper } from './listItemWrapper';
import { ListItemFactory } from './provider';

export interface IListEditorRendererProps<TItem = any> {
    contextAccessor: () => IListEditorContext<TItem>;
    children: ListEditorChildrenFn<TItem>;
    level?: number;
    header?: ListEditorSectionRenderingFn<TItem>;
    parentItem?: TItem;
    maxItemsCount?: number;
}

export interface MakeListContextArgs<TItem = any> {
    value: TItem[];
    onChange: (value: TItem[]) => void;
    onReorder: (value: TItem[], prevValue: TItem[]) => void;
    initNewItem: (items: TItem[]) => TItem;
    selectedItem?: TItem;
    setSelectedItem?: (item: TItem) => void;
}

export const makeListContext = <TItem = any>({ value, onChange, initNewItem, selectedItem, setSelectedItem, onReorder }: MakeListContextArgs<TItem>): IListEditor<TItem> => {
    const context: IListEditor<TItem> = {
        value,
        deleteItem: function (index: number): void {
            if (!value)
                return;
            const newValue = [...value];

            const deletedItem = newValue.splice(index, 1);
            if (setSelectedItem && selectedItem && selectedItem === deletedItem[0]) {
                setSelectedItem(undefined);
            }

            onChange(newValue);
        },
        addItem: function (factory?: ListItemFactory<TItem>): void {
            const factoryToUse = factory || initNewItem;
            const newItem = factoryToUse(value);
            const newValue = value ? [...value] : [];
            newValue.push(newItem);

            setSelectedItem?.(newItem);
            onChange(newValue);
        },
        insertItem: function (index: number): void {
            const newItem = initNewItem(value);
            const newValue = value ? [...value] : [];
            newValue.splice(index, 0, newItem);

            //setSelectedItem(newItem);
            onChange(newValue);
        },
        updateItem: function (index: number, item: TItem): void {
            const newValue = [...value];
            newValue[index] = { ...item } as TItem;
            onChange(newValue);
        },
        updateList: function (newItems: TItem[]): void {
            onReorder(newItems, value);
        }
    };
    return context;
};

export const ListEditorRenderer = <TItem extends ListItem,>(props: IListEditorRendererProps<TItem>) => {
    const { styles } = useStyles();
    const { contextAccessor, children, header, level = 1, parentItem, maxItemsCount } = props;
    const {
        value,
        deleteItem,
        addItem,
        insertItem,
        updateList,
        readOnly,
        selectedItem,
        setSelectedItem,
        refresh,
    } = contextAccessor();

    const onAddClick = () => {
        addItem();
    };

    const sortableItems = useMemo(() => {
        return Boolean(value) && Array.isArray(value) /*&& value.length > 0*/
            ? value.map<SortableItem<TItem>>((item, index) => ({ data: item, id: index }))
            : undefined;
    }, [value]);

    const listHasChanged = (newState: SortableItem<TItem>[]): boolean => {
        if (value.length !== newState.length)
            return true;

        const changedIndex = newState.find((item, index) => {
            return item.data !== value[index];
        });
        return Boolean(changedIndex);
    };

    const onSetList = (newState: SortableItem<TItem>[], _sortable, _store) => {
        const chosen = newState.some(item => item.chosen === true);
        if (chosen)
            return;

        if (listHasChanged(newState)) {
            const rawItems = newState.map<TItem>(m => m.data);
            updateList(rawItems);
        }
    };

    const headerRenderer = header
        ? header
        : header === null
            ? () => (null)
            : () => ((!maxItemsCount || (sortableItems?.length ?? 0) < maxItemsCount) && <Button icon={<PlusCircleOutlined />} shape="round" onClick={onAddClick} size="small" disabled={readOnly}>Add</Button>);

    return (
        <div className={styles.list}>
            <div className={styles.listHeader}>
                {headerRenderer({ contextAccessor, level, parentItem })}
            </div>
            {sortableItems && (
                <div className={styles.listContainer}>

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
                            const localItemChange = (newValue: TItem, changeDetails: ItemChangeDetails) => {
                                Object.assign(item, newValue);

                                const skipValueUpdate = changeDetails && changeDetails.isReorder && changeDetails.childsLengthDelta < 0;
                                refresh(!skipValueUpdate);
                            };

                            return (
                                <ListItemWrapper
                                    key={index}
                                    onDelete={() => {
                                        deleteItem(index);
                                    }}
                                    onDragHandleClick={() => {
                                        setSelectedItem(item);
                                    }}
                                    onInsert={(insertPosition) => {
                                        const newIndex = index + (insertPosition === 'before' ? 0 : 1);
                                        insertItem(newIndex);
                                    }}
                                    readOnly={readOnly}
                                    isLast={index === value.length - 1}
                                    className={selectedItem && item.id === selectedItem.id ? styles.listItemSelected : undefined}
                                >
                                    {children({
                                        item,
                                        itemOnChange: localItemChange,
                                        index,
                                        readOnly: readOnly === true,
                                        nestedRenderer: ({ items, onChange, initNewItem }) => {
                                            const childListContext = makeListContext({
                                                value: items,
                                                onChange: (newItems) => {
                                                    onChange(newItems);
                                                },
                                                onReorder: (newItems, prevValue) => {
                                                    onChange(newItems, { isReorder: true, childsLengthDelta: newItems.length - prevValue.length });

                                                    const gotItem = prevValue.length < newItems.length;
                                                    refresh(gotItem);
                                                },
                                                initNewItem: (items) => {
                                                    return initNewItem(items);
                                                },
                                                selectedItem,
                                                setSelectedItem,
                                            });
                                            const itemContextAccessor = () => {
                                                const accessor: IListEditorContext<TItem> = {
                                                    ...childListContext,
                                                    refresh: refresh,
                                                    readOnly: readOnly === true,
                                                    selectedItem,
                                                    setSelectedItem,
                                                };
                                                return accessor;
                                            };
                                            const itemLevel = level + 1;
                                            return (
                                                <ListEditorRenderer
                                                    level={itemLevel}
                                                    parentItem={item}
                                                    contextAccessor={itemContextAccessor}
                                                    children={props.children}
                                                    header={headerRenderer}
                                                >
                                                </ListEditorRenderer>
                                            );
                                        },
                                    })}
                                </ListItemWrapper>);
                        })}
                    </ReactSortable>

                </div>
            )}
        </div>
    );
};