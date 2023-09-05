import React, { FC, useEffect, useState } from "react";
import { Col, Input, Popover, Row, Tree } from "antd";
import { DataNode } from "antd/lib/tree";

function getFnParamNames(fn: Function) {
    var fstr = fn.toString();
    return fstr.match(/\(.*?\)/)[0].replace(/[()]/gi,'').replace(/\s/gi,'').split(',');
}

export interface DebugDataTreeProps {
    name: string;
    data: any;
    onChange: (propName: string, val: any) => void;
    onFunctionExecute?: (path: string) => void;
}

interface DebugDataTreeItemProps {
    name: string;
    value: any;
    onChange?: (val: any) => void;
    onClick?: () => void;
}

const DebugDataTreeProp: FC<DebugDataTreeItemProps> = (props) => {
    return <Row >
        <Col span={6}><Popover content={props.name}>{props.name}{props.onChange ? ':' : ''}</Popover></Col>
        <Col span={18}>
            {props.onChange && <> 
                <Input 
                    style={{fontSize: 14}}
                    value={props.value?.toString()} 
                    onChange={(e) => {
                        if (props.onChange)
                            props.onChange(e.target.value);
                    }}
                />
            </>}
        </Col>
    </Row>;
};

const DebugDataTreeFunc: FC<DebugDataTreeItemProps> = (props) => {

    const onClick = (_e) => {
        //alert(props.name);
        if (props.value)
            props.value();
    };

    return <>
        <span style={{ color: 'green', fontWeight: 'bold' }} onClick={onClick}>{props.name}</span>
        <span style={{ color: 'black' }} >(</span>
        <span style={{ color: 'blue' }}>{getFnParamNames(props.value).join(', ')}</span>
        <span style={{ color: 'balck' }}>)</span>
    </>;
};

export const DebugDataTree: FC<DebugDataTreeProps> = ({name, data, onChange}) => {

    const initTreeData: DataNode = { title: name, key: 'root', isLeaf: false};

    const [treeData, setTreeData] = useState([initTreeData]);

    const [expanded, setExpanded] = useState([]);

    //let node = treeData[0];

    const onPropChange = (propName: string, val: any) => {
        const parts = propName.split('.');
        onChange(parts.slice(1).join('.'), val);
    };

    /*const addProps = (node: DataNode, prop: any, pkey: string) => {
        if (!prop)
            return;
        const members = Object.getOwnPropertyNames(prop);
        const properties =  members.filter(item => typeof prop[item] !== 'function').sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
        const functions =  members.filter(item => typeof prop[item] === 'function').sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
        
        properties.forEach(item => {
            const key = pkey + '.' + item;

            if (typeof prop[item] === 'object') {
                const n = {title: <DebugDataTreeProp name={item} value={undefined}/>, key, children:[]};
                node.children.push(n);
                addProps(n, prop[item], n.key);
            } else {
                node.children.push({title: <DebugDataTreeProp name={item} value={prop[item]} onChange={(val) => onPropChange(key, val)}/>, key, children:[]});
            }
        });

        functions.forEach(item => {
            node.children.push({title: <DebugDataTreeFunc name={item} value={prop[item]}/>, key: pkey + '.' + item});
        });
    };*/
    
    //addProps(node, data, '');

    const getChildren = (prop: any, pkey: string): DataNode[] => {
        if (!prop)
            return undefined;

        let parts = pkey.split('.').slice(1);
        
        let p = prop;

        while (parts.length > 0) {
            p = p[parts[0]];
            parts = parts.slice(1);
        }

        if (!p) return undefined;

        const members = Object.getOwnPropertyNames(p);
        
        const res: DataNode[] = [];

        const properties = members.filter(item => typeof p[item] !== 'function').sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
        const functions =  members.filter(item => typeof p[item] === 'function').sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
        
        properties.forEach(item => {
            const key = pkey + '.' + item;

            if (typeof p[item] === 'object') {
                const n: DataNode = {title: <DebugDataTreeProp name={item} value={undefined}/>, key, isLeaf: false };
                res.push(n);
            } else {
                res.push({title: <DebugDataTreeProp name={item} value={p[item]} onChange={(val) => onPropChange(key, val)}/>, key, children:[], isLeaf: true});
            }
        });

        functions.forEach(item => {
            res.push({title: <DebugDataTreeFunc name={item} value={p[item]}/>, key: pkey + '.' + item, isLeaf: true});
        });

        return res.length === 0 ? undefined : res; // return undefined to refresh node on next expand
    };

    const loadTreeData = (list: DataNode[], key: React.Key, children: DataNode[]): DataNode[] =>
        list.map(node => {
            if (node.key === key)
                return { ...node, children };
            if (node.children) 
                return { ...node, children: loadTreeData(node.children, key, children )};
            return node;
        });
        
    const onLoadData = ({ key, children }: any) =>
        new Promise<void>(resolve => {
            if (!children) {
                const c = getChildren(data, key);
                if (c)
                    setTreeData(origin => loadTreeData(origin, key, c));
            }
            resolve();
        });

    const updateTreeData = (list: DataNode[], data: any) =>
        list.forEach(node => {
            if (expanded.filter(x => x === node.key)?.length > 0) {
                const c = getChildren(data, node.key.toString());
                if (c) {
                    node.children = c;
                    updateTreeData(node.children, data);
                }
            }
        });

    useEffect(() => {
        if (expanded.filter(x => x === 'root')?.length > 0) {

            const n = {...initTreeData};

            const c = getChildren(data, 'root');
            if (c) {
                n.children = c;
                updateTreeData(n.children, data);
            }
            setTreeData([n]);
        }
    }, [data]);

    return (
        <Tree
            style={{fontFamily: 'Courier', fontSize: 14}}
            treeData={treeData}
            loadData={onLoadData}
            blockNode
            onExpand={(e) => setExpanded(e)}
        />
    );
};