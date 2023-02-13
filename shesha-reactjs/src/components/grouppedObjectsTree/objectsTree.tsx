import React, { useState, useEffect, ReactNode } from 'react';
import { Tree } from 'antd';
import { DataNode } from 'antd/lib/tree';
import ShaIcon, { IconType } from '../shaIcon';

export interface IProps<TItem> {
    items: TItem[];
    defaultExpandAll: boolean;
    defaultSelected?: string;
    searchText?: string;
    onChange: (item: TItem) => void;
    idFieldName?: string;
    nameFieldName?: string
    getChildren?: (item: TItem) => TItem[];
    getIsLeaf?: (item: TItem) => boolean;
    getIcon?: (item: TItem) => IconType;
    onRenterItem?: (item: TItem) => ReactNode;
}

interface DataNodeWithObject<TItem> extends DataNode {
    object: TItem;
}

export const ObjectsTree = <TItem,>(props: IProps<TItem>) => {
    
    const [manuallyExpanded, setManuallyExpanded] = useState<string[]>([]);
    const [scrollId, setScrollId] = useState<string>(null);
    //const [nodes, setNodes] = useState<DataNode[]>([]);
    const [nodes, setNodes] = useState<DataNodeWithObject<TItem>[]>([]);
    
    const getName = (item: TItem) => { return Boolean(props.nameFieldName) ? item[props.nameFieldName] : item['name'] ?? item['className'] ?? item }
    const getId = (item: TItem) => { return Boolean(props.idFieldName) ? item[props.idFieldName] : item['id'] ?? item['key'] ?? item }

    const getTreeData = (item: TItem, onAddItem: (item: TItem) => void): DataNodeWithObject<TItem> => {
        const nested = Boolean(props.getChildren) ? props.getChildren(item) : item['children'];
        const node: DataNodeWithObject<TItem> = {
            key: (getId(item))?.toLowerCase(),
            title: getName(item),
            isLeaf: Boolean(props.getIsLeaf) ? props.getIsLeaf(item) : (!Boolean(nested) || Array.isArray(nested) || nested.length === 0),
            selectable: false,
            object: item,
        };
        if (Boolean(nested) && Array.isArray(nested)) {
            node.children = nested.map<DataNodeWithObject<TItem>>(childObj => getTreeData(childObj, onAddItem));
        }
    
        onAddItem(item);
        return node;
    }
    
    useEffect(() => {
        // update experiments
        /*setNodes((ns) =>{
            ns = ns.filter(n => props.items.find(p => getId(p) === getId(n.object)));
            props.items.filter(n => !ns.find(p => getId(n) === getId(p.object)))
                .forEach(p => ns.push(getTreeData(p, (item) => { 
                    setManuallyExpanded((state) => {
                            state.push(getId(item));
                            return state;
                        })
                    })));

            return [...ns];
        });*/

        /*setNodes(ns => {
            const nss =  props.items.map(i => {
                const n = ns.find(p => getId(i) === p.key);
                return n 
                    ? n 
                    : getTreeData(i, (item) => { 
                        setManuallyExpanded((state) => {
                            state.push(getId(item));
                            return state;
                        })
                    }) as DataNode;
            });
            return nss;
        })*/

        setNodes([...props.items.map(item => 
            getTreeData(item, (item) => { 
                setManuallyExpanded((state) => {
                        state?.push(getId(item));
                        return state;
                    })
                })
            )]
        );
    }, [props.items])

    useEffect(() => {
        if (props.defaultExpandAll)
            setManuallyExpanded(null);
    }, [props.defaultExpandAll]);

    const getTitle = (item: TItem) => {
        const name = getName(item);
        const index = name.toLowerCase().indexOf(props.searchText);
        if (index === -1)
            return <span>{name}</span>;

        const beforeStr = name.substring(0, index);
        const str = name.substring(index, index + props.searchText.length);
        const afterStr = name.substring(index + props.searchText.length, name.length);
        return (
            <span>
                {beforeStr}
                <span className="site-tree-search-value">{str}</span>
                {afterStr}
            </span>
        );
    }

    const refs = nodes.reduce((ref, value) => {
      ref[value.key] = React.createRef();
      return ref;
    }, {});

    useEffect(() => {
      // ToDo: find another way to scrolling after expand
      if (scrollId) {
        const timeout = setTimeout(() => {
          refs[scrollId?.toLowerCase()]?.current?.scrollIntoView({
            behavior: "auto",
            block: "center"
          });
          clearTimeout(timeout);
        }, 500);
      }
      return null;
    }, [scrollId]);

    useEffect(() => { if(!scrollId) { setScrollId(props.defaultSelected); }}, [props.defaultSelected])

    const renderTitle = (node: DataNodeWithObject<TItem>): React.ReactNode => {
        const icon = Boolean(props.getIcon) ? props.getIcon(node.object) : 'BookOutlined' as IconType
        const markup = (
            <div className='sha-toolbox-component' key={node.key} ref={refs[node.key]}>
                { props.onRenterItem
                    ? props.onRenterItem(node.object)
                    : <>
                        {icon && <ShaIcon iconName={icon}></ShaIcon>}
                        <span className='sha-component-title'> {getTitle(node.object)}</span>
                    </>
                }
            </div>
        );
        return markup;
    }

    const onExpand = (expandedKeys) => {
        setManuallyExpanded(expandedKeys);
    };

    useEffect(() => {console.log("Mount ")} , [])
//DataNodeWithObject<TItem>>
    return (
        <Tree<DataNodeWithObject<TItem>> 
            className='sha-datasource-tree'
            showIcon
            treeData={nodes}
            expandedKeys={manuallyExpanded}
            onExpand={onExpand}
            draggable={false}
            selectable={true}
            titleRender={renderTitle}
            onClick={ (_, node) => { props.onChange(node['object']) }}//props.items.find(x => getId(x) == node.key)) } }
            selectedKeys={props.defaultSelected != '' ? [props.defaultSelected?.toLowerCase()] : null}
        />
    );
};
