import { Tree } from 'antd';
import { DataNode } from 'antd/lib/tree';
import React, { FC, useMemo, useState, useEffect } from 'react';
import { PermissionedObjectDto } from '../../../apis/permissionedObject';
import ShaIcon, { IconType } from '../../shaIcon';

export interface IProps {
    items: PermissionedObjectDto[];
    defaultExpandAll: boolean;
    defaultSelected?: string;
    searchText?: string;
    onChange: (id: string) => void;    
}

const getTreeData = (prop: PermissionedObjectDto, onAddItem: (prop: PermissionedObjectDto) => void): DataNodeWithObject => {
    const node: DataNodeWithObject = {
        key: prop.id,
        title: prop.name,
        isLeaf: prop.child.length === 0,
        selectable: false,
        object: prop,
    };
    node.children = prop.child.map<DataNodeWithObject>(childObj => getTreeData(childObj, onAddItem));

    onAddItem(prop);

    return node;
}

interface DataNodeWithObject extends DataNode {
    object: PermissionedObjectDto;
}

interface NodesWithExpanded {
    nodes: DataNodeWithObject[],
    expandedKeys: string[],
}

const ObjectTree: FC<IProps> = (props) => {
    
    const [manuallyExpanded, setManuallyExpanded] = useState<string[]>(null);
    
    const treeData = useMemo<NodesWithExpanded>(() => {
        const expanded: string[] = [];
        const nodes = props.items.map(item => getTreeData(item, (item) => { expanded.push(item.id); }));

        return { nodes: nodes, expandedKeys: expanded };
    }, [props.items]);

    useEffect(() => {
        if (props.defaultExpandAll)
            setManuallyExpanded(null);
    }, [props.defaultExpandAll]);

    const getTitle = (prop: PermissionedObjectDto) => {
        const { name } = prop;
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

    const renderTitle = (node: DataNodeWithObject): React.ReactNode => {
        let icon  = 'BookOutlined' as IconType;

        switch (node.object.type){
            case "Shesha.WebApi": icon = 'SettingFilled'; break;
            case "Shesha.WebApi.Action": icon = 'ApiFilled'; break;
            case "Shesha.WebCrudApi": icon = 'SettingFilled'; break;
            case "Shesha.WebCrudApi.Action": icon = 'ApiFilled'; break;
            default: icon = node.object.child && node.object.child.length > 0 ? 'BookOutlined' : 'FileFilled'; break;
        }

        return (
            <div className='sha-toolbox-component' key={node.object.id}>
                {icon && <ShaIcon iconName={icon}></ShaIcon>}
                <span className='sha-component-title'> {getTitle(node.object)}</span>
            </div>
        );
    }

    const onExpand = (expandedKeys) => {
        setManuallyExpanded(expandedKeys);
    };

    return (
        <Tree<DataNodeWithObject>
            className='sha-datasource-tree'
            showIcon
            treeData={treeData.nodes}
            expandedKeys={props.defaultExpandAll && !Boolean(manuallyExpanded) ? treeData.expandedKeys : manuallyExpanded}
            onExpand={onExpand}
            draggable={false}
            selectable={true}
            titleRender={renderTitle}
            onClick={ (_, node) => { props.onChange(node.key.toString()) } }
            selectedKeys={[props.defaultSelected]}
        />
    );
};

export default ObjectTree;
