import React, { FC, useEffect, useState } from "react";
import { Tree } from "antd";
import { DataNode } from "antd/lib/tree";
import { IPropertyMetadata, isDataPropertyMetadata, isPropertiesArray } from "@/interfaces/metadata";
import { toCamelCase } from "@/utils/string";
import { IDebugDataTreeProps } from "./model";
import { DebugDataTreeProp } from "./debugDataTreeProp";
import { DebugDataTreeFunc } from "./debugDataTreeFunc";
import { useLocalStorage } from "@/hooks";

export const DebugDataTree: FC<IDebugDataTreeProps> = ({ editAll, name, data, lastUpdated, metadata, onChange }) => {
  const metadataProperties = isPropertiesArray(metadata?.properties) ? metadata.properties : undefined;

  const title = name + (metadata?.name ? `(${metadata?.name})` : '');

  const initTreeData: DataNode = { title, key: 'root', isLeaf: false };

  const [treeData, setTreeData] = useState([initTreeData]);

  const [expanded, setExpanded] = useLocalStorage(`debug_panel_${name}`, []);
  const [loaded, setLoaded] = useState([]);

  const onPropChange = (propName: string, val: any): void => {
    const parts = propName.split('.');
    onChange(parts.slice(1).join('.'), val);
  };

  const getChildren = (prop: any, pkey: string, meta: IPropertyMetadata[]): DataNode[] => {
    if (!prop)
      return null;

    let parts = pkey.split('.').slice(1);

    let p = prop;
    let pm: IPropertyMetadata = null;
    let pl: IPropertyMetadata[] = meta;

    while (parts.length > 0) {
      p = p[parts[0]];
      pm = pl?.find((x) => toCamelCase(x.path) === parts[0]);
      pl = isDataPropertyMetadata(pm) && isPropertiesArray(pm.properties) ? pm.properties : undefined;
      parts = parts.slice(1);
    }

    if (!p) return null;

    const members = Object.getOwnPropertyNames(p);

    const res: DataNode[] = [];

    const properties = members.filter((item) => typeof p[item] !== 'function').sort((a, b) => a < b ? -1 : a > b ? 1 : 0);
    const functions = members.filter((item) => typeof p[item] === 'function').sort((a, b) => a < b ? -1 : a > b ? 1 : 0);

    properties.forEach((item) => {
      const key = pkey + '.' + item;
      pm = pl?.find((x) => toCamelCase(x.path) === item);

      if (p[item] && typeof p[item] === 'object') {
        const n: DataNode = { title: <DebugDataTreeProp name={item} metadata={pm} value={JSON.stringify(p[item])} />, key, isLeaf: false };
        res.push(n);
      } else {
        const readonly = !editAll && (!pm || (isDataPropertyMetadata(pm) && pm?.readonly));
        res.push({ title: (
          <DebugDataTreeProp
            name={item}
            metadata={pm}
            value={p[item]}
            onChange={(val) => onPropChange(key, val)}
            readonly={readonly}
          />
        ), key, children: [], isLeaf: true });
      }
    });

    functions.forEach((item) => {
      res.push({ title: <DebugDataTreeFunc name={item} value={p[item]} />, key: pkey + '.' + item, isLeaf: true });
    });

    return res?.length > 0 ? res : null;
  };

  const loadTreeData = (list: DataNode[], key: React.Key, children: DataNode[]): DataNode[] =>
    list?.map((node) => {
      if (node.key === key)
        return { ...node, children };
      if (node.children)
        return { ...node, children: loadTreeData(node.children, key, children) };
      return node;
    });

  const onLoadData = ({ key, children }: any): Promise<void> =>
    new Promise<void>((resolve) => {
      if (loaded.filter((x) => x === key)?.length === 0)
        setLoaded([...loaded, key]);

      if (!children) {
        const c = getChildren(data, key, metadataProperties);
        setTreeData((prev) => loadTreeData(prev, key, c));
      }
      resolve();
    });

  const updateTreeData = (list: DataNode[], nodedata: any): void =>
    list?.forEach((node) => {
      if (expanded.filter((x) => x === node.key)?.length > 0 || loaded.filter((x) => x === node.key)?.length > 0) {
        const c = getChildren(nodedata, node.key.toString(), metadataProperties);
        node.children = c;
        updateTreeData(node.children, nodedata);
      }
    });

  useEffect(() => {
    const n = treeData[0];
    if (expanded.filter((x) => x === 'root')?.length > 0 || loaded.filter((x) => x === 'root')?.length > 0) {
      const c = getChildren(data, 'root', metadataProperties);
      n.children = c;
      updateTreeData(n.children, data);
    }
    setTreeData([n]);
  }, [data, metadata, lastUpdated]);

  return (
    <Tree
      style={{ fontFamily: 'Courier', fontSize: 14, padding: 0 }}
      treeData={treeData}
      loadData={onLoadData}
      blockNode
      defaultExpandedKeys={expanded}
      onExpand={(e) => setExpanded(e)}
    />
  );
};
