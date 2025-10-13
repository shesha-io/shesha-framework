import { Typography } from "antd";
import React, { ReactNode } from "react";
import { TreeNode } from "./models";
import { isNullOrWhiteSpace } from "../utils/nullables";

const { Text } = Typography;

const replaceWithHighLight = (str: string, searchStr: string, replacement: (value: string) => ReactNode): ReactNode[] => {
  if (!str || !searchStr)
    return [];
  const searchStrLen = searchStr.length;
  if (searchStrLen === 0)
    return [];

  const strLower = str.toLowerCase();
  const searchStrLower = searchStr.toLowerCase();

  let index = -1;
  let startIndex = 0;
  const result: ReactNode[] = [];

  while ((index = strLower.indexOf(searchStrLower, startIndex)) > -1) {
    if (index > 0)
      result.push(str.substring(startIndex, index));

    const occ = str.substring(index, index + searchStrLen);
    const newContent = replacement(occ);
    result.push(newContent);

    startIndex = index + searchStrLen;
  }
  if (startIndex < str.length)
    result.push(str.substring(startIndex));

  return result;
};

export const getTitleWithHighlight = (node: TreeNode, searchString?: string): ReactNode | undefined => {
  if (isNullOrWhiteSpace(searchString))
    return undefined;

  const strTitle = node.name;
  const index = strTitle.toLowerCase().indexOf(searchString.toLowerCase());
  if (index <= -1)
    return undefined;

  const parts = replaceWithHighLight(strTitle, searchString, (str) => (<Text type="success">{str}</Text>));
  return (
    <>
      {parts.map((part, index) => (
        <React.Fragment key={index}>{part}</React.Fragment>
      ))}
    </>
  );
};
