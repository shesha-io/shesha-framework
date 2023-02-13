import { DataNode } from "antd/lib/tree";
import { DataIndex } from "./models";

const generateIndexesList = (data: DataNode[], indexes: DataIndex[]) => {
    for (let i = 0; i < data.length; i++) {
        const node = data[i];
        const { key } = node;
        indexes.push({ key, title: node.title.toString() /*key as string*/ });
        if (node.children) {
            generateIndexesList(node.children, indexes);
        }
    }
};

export const getIndexesList = (data: DataNode[]): DataIndex[] => {
    const result: DataIndex[] = [];
    generateIndexesList(data, result);
    return result;
}