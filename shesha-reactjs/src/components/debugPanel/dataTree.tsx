import React, { FC } from "react";
import { Col, Input, Row, Tree } from "antd";
import { DataNode } from "antd/lib/tree";

function getFnParamNames(fn: Function) {
    var fstr = fn.toString();
    return fstr.match(/\(.*?\)/)[0].replace(/[()]/gi,'').replace(/\s/gi,'').split(',');
}

export interface DebugDataTreeProps {
    name: string;
    data: any;
    onChange: (propName: string, val: any) => void;
}

interface DebugDataTreeItemProps {
    name: string;
    value: any;
    onChange?: (val: any) => void;
}

const DebugDataTreeProp: FC<DebugDataTreeItemProps> = (props) => {
    return <Row >
        <Col span={6}>{props.name}{props.onChange ? ':' : ''}</Col>
        <Col span={18}>
            {props.onChange && <> 
                <Input 
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
    return <>
        <span style={{ color: 'green', fontStyle: 'italic' }}>{props.name}</span>
        <span style={{ color: 'black' }}>(</span>
        <span style={{ color: 'blue' }}>{getFnParamNames(props.value).join(', ')}</span>
        <span style={{ color: 'balck' }}>)</span>
    </>;
};


export const DebugDataTree: FC<DebugDataTreeProps> = ({name, data, onChange}) => {

    const treeData: DataNode[] = [{ title: name, key: 'root', children: []}];

    let node = treeData[0];

    const onPropChange = (propName: string, val: any) => {
        const parts = propName.split('.');
        onChange(parts.slice(1).join('.'), val);
    };

    const addProps = (node: DataNode, prop: any, pkey: string) => {
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
    };

    addProps(node, data, '');

    return (
        <Tree
            style={{fontFamily: 'Courier'}}
            treeData={treeData}
            blockNode
        />
    );
};