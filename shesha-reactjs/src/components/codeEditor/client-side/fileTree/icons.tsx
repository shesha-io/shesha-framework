import React, { ReactNode } from 'react';
import { SiHtml5, SiCss3, SiJavascript, SiTypescript, SiJson } from "react-icons/si";
import { FcFolder, FcOpenedFolder, FcPicture, FcFile } from "react-icons/fc";
import { AiFillFileText } from "react-icons/ai";
import { AntdTreeNodeAttribute } from 'antd/lib/tree';
import { getLastSection } from '@/utils/string';

function getIconHelper() {
    const cache = new Map<string, ReactNode>();
    cache.set("js", <SiJavascript color="#fbcb38" />);
    cache.set("jsx", <SiJavascript color="#fbcb38" />);
    cache.set("ts", <SiTypescript color="#378baa" />);
    cache.set("tsx", <SiTypescript color="#378baa" />);
    cache.set("css", <SiCss3 color="purple" />);
    cache.set("json", <SiJson color="#5656e6" />);
    cache.set("html", <SiHtml5 color="#e04e2c" />);
    cache.set("png", <FcPicture />);
    cache.set("jpg", <FcPicture />);
    cache.set("ico", <FcPicture />);
    cache.set("txt", <AiFillFileText color="white" />);
    return function (extension: string): ReactNode {
        if (cache.has(extension))
            return cache.get(extension);
        else
            return <FcFile />;
    };
}

const getFileIcon = getIconHelper();

export const getNodeIcon = (nodeProps: AntdTreeNodeAttribute) => {
    if (!nodeProps.isLeaf)
        return nodeProps.expanded ? <FcOpenedFolder /> : <FcFolder />;
    
    const extension = getLastSection('.', nodeProps.title?.toString());

    return extension ? getFileIcon(extension) : <FcFile />;
};