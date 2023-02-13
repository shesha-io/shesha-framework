import { Input, Tree, Typography } from 'antd';
import { DataNode } from 'antd/lib/tree';
import React, { useEffect, useState } from 'react';
import { FC } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { ConfigItemDataNode, ITreeState } from '../models';

const { Text } = Typography;

export interface IItemsTreeProps {
    treeState: ITreeState;
    onChangeSelection: (selectedKeys: string[]) => void;
}

interface TreeNodesWithStat {
    nodes: ConfigItemDataNode[];
    itemsCount: number;
}

export const ItemsTree: FC<IItemsTreeProps> = ({ treeState, onChangeSelection }) => {
    const [expandedKeys, setExpandedKeys] = useState<React.Key[]>([]);
    const [autoExpandParent, setAutoExpandParent] = useState(true);
    const [checkedIds, setCheckedIds] = useState<string[]>([]);
    const [searchValue, setSearchValue] = useState('');

    const [treeDataWithStat, setTreeDataWithStat] = useState<TreeNodesWithStat>(null);

    const onExpand = (newExpandedKeys: React.Key[]) => {
        setExpandedKeys(newExpandedKeys);
        setAutoExpandParent(false);
    };

    const onCheck = (_checkedKeysValue: React.Key[], { checkedNodes }) => {
        const checkedItemIds = (checkedNodes as ConfigItemDataNode[] ?? []).map(item => item.itemId).filter(id => Boolean(id));
        setCheckedIds(checkedItemIds);
        if (onChangeSelection)
            onChangeSelection(checkedItemIds);
    };

    const getTreeDataWithStat = (nodes: ConfigItemDataNode[], term: string): TreeNodesWithStat => {
        if (!nodes)
            return { nodes: [], itemsCount: 0 };

        let itemsCount = 0;
        const loop = (data: ConfigItemDataNode[], onMatched: () => void = () => { }): ConfigItemDataNode[] =>
            data.map((item) => {
                const strTitle = item.title as string;
                const index = strTitle.toLocaleLowerCase().indexOf(term.toLowerCase());
                const beforeStr = strTitle.substring(0, index);
                const afterStr = strTitle.slice(index + term.length);
                const termStr = strTitle.slice(index, index + term.length);
                const matched = index > -1;
                const title =
                    matched ? (
                        <span>
                            {beforeStr}
                            <span className="site-tree-search-value">{termStr}</span>
                            {afterStr}
                        </span>
                    ) : (
                        <span>{strTitle}</span>
                    );

                if (item.children) {
                    let childMatched = false;
                    const children = loop(item.children, () => childMatched = true);

                    if ((matched || childMatched) && Boolean(onMatched))
                        onMatched();
                    //const filteredCount = item.children.length - children.length;
                    // if (filteredCount > 0)
                    //     children.push({ title: `hidden ${filteredCount} items`, key: item.key + 'hidden', checkable: false });


                    return matched || childMatched
                        ? { title, key: item.key, children: children, itemId: item.itemId }
                        : null;
                }

                if (matched) {
                    itemsCount++;

                    if (Boolean(onMatched))
                        onMatched();

                    return {
                        title,
                        key: item.key,
                        itemId: item.itemId,
                    };
                } else
                    return null;
            }).filter(node => Boolean(node));

        const filtered = loop(nodes);
        return {
            nodes: filtered,
            itemsCount: itemsCount,
        };
    }

    useEffect(() => {
        const withStat: TreeNodesWithStat = !Boolean(treeState.treeNodes)
            ? null
            : searchValue
                ? getTreeDataWithStat(treeState.treeNodes, searchValue)
                : { nodes: treeState.treeNodes, itemsCount: treeState.itemsCount };

        setTreeDataWithStat(withStat);
    }, [treeState.treeNodes, searchValue]);

    const getParentKey = (key: React.Key, tree: DataNode[]): React.Key => {
        let parentKey: React.Key;
        for (let i = 0; i < tree.length; i++) {
            const node = tree[i];
            if (node.children) {
                if (node.children.some((item) => item.key === key)) {
                    parentKey = node.key;
                } else if (getParentKey(key, node.children)) {
                    parentKey = getParentKey(key, node.children);
                }
            }
        }
        return parentKey!;
    };

    const debouncedSearch = useDebouncedCallback<(value: string) => void>(
        localValue => {
            console.time('filter');
            const newExpandedKeys = localValue
                ? treeState.indexes
                    .map((item) => {
                        if (item.title.indexOf(localValue) > -1) {
                            return getParentKey(item.key, treeState.treeNodes);
                        }
                        return null;
                    })
                    .filter((item, i, self) => item && self.indexOf(item) === i)
                : [];
            console.timeEnd('filter');

            setExpandedKeys(newExpandedKeys as React.Key[]);
            setSearchValue(localValue);
            setAutoExpandParent(true);
        },
        // delay in ms
        100
    );

    const onSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { value } = e.target;

        debouncedSearch(value);
    };

    return (
        <>
            <Input.Search style={{ marginBottom: 8 }} placeholder="Search" onChange={onSearchChange} allowClear />
            <div style={{ maxHeight: '70vh', overflowY: 'auto' }}>
                <Tree<ConfigItemDataNode>
                    showLine
                    checkable
                    onExpand={onExpand}
                    expandedKeys={expandedKeys}
                    autoExpandParent={autoExpandParent}
                    treeData={treeDataWithStat?.nodes}
                    onCheck={onCheck}
                    checkedKeys={checkedIds}
                />
                {treeDataWithStat && (treeDataWithStat.itemsCount !== treeState.itemsCount) && (
                    <>
                        <Text type="secondary">Displayed:  {treeDataWithStat.itemsCount} of {treeState.itemsCount}</Text>
                        <br />
                    </>
                )}
                {checkedIds.length > 0 && (
                    <Text type="secondary">Selected:  {checkedIds.length} of {treeState.itemsCount}</Text>
                )}
            </div>
        </>
    );
}

export default ItemsTree;