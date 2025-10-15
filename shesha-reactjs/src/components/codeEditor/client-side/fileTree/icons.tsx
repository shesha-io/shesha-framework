import React from 'react';
import { SiHtml5, SiCss3, SiJavascript, SiTypescript, SiJson } from "react-icons/si";
import { FcFolder, FcOpenedFolder, FcPicture, FcFile } from "react-icons/fc";
import { AiFillFileText } from "react-icons/ai";
import { AntdTreeNodeAttribute } from 'antd/lib/tree';
import { getLastSection } from '@/utils/string';

export const getNodeIcon = (nodeProps: AntdTreeNodeAttribute): JSX.Element => {
  if (!nodeProps.isLeaf)
    return nodeProps.expanded ? <FcOpenedFolder /> : <FcFolder />;

  const extension = getLastSection('.', nodeProps.title?.toString());
  switch (extension) {
    case "js": return <SiJavascript color="#fbcb38" />;
    case "jsx": return <SiJavascript color="#fbcb38" />;
    case "ts": return <SiTypescript color="#378baa" />;
    case "tsx": return <SiTypescript color="#378baa" />;
    case "css": return <SiCss3 color="purple" />;
    case "json": return <SiJson color="#5656e6" />;
    case "html": return <SiHtml5 color="#e04e2c" />;
    case "png": return <FcPicture />;
    case "jpg": return <FcPicture />;
    case "ico": return <FcPicture />;
    case "txt": return <AiFillFileText color="white" />;
  }

  return <FcFile />;
};
