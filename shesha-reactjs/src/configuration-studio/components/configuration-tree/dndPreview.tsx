import { TreeNode } from "@/configuration-studio/models";
import React from "react";
import { getDropPositionText } from "./models";

export interface DndPreviewProps {
  dragNode: TreeNode;
  dropNode: TreeNode;
  dropPosition: number;
  allowed: boolean;
}

export const DndPreview: React.FC<DndPreviewProps> = ({ allowed, dragNode, dropNode, dropPosition }) => {
  const targetText = getDropPositionText(dropPosition);
  return (
    <div style={{ position: 'absolute', right: 0, bottom: 0, backgroundColor: 'white', padding: '5px', border: '1px solid gray' }}>
      <div> drag node: {dragNode.name}</div>
      <div> drag parentId: {dragNode.parentId}</div>
      <div> drag moduleId: {dragNode.moduleId}</div>

      <div> target: {targetText} </div>
      <div> drop: {dropNode.name} </div>
      <div> drop Id: {dropNode.id} </div>
      <div> drop moduleId: {dropNode.moduleId} </div>

      <div> allowed: {allowed ? "✅" : "🟥"} </div>
    </div>
  );
};
