import React, { FC } from 'react';
import { Button, ButtonProps, Space } from 'antd';
import { RedoOutlined, UndoOutlined } from '@ant-design/icons';
import { useFormDesignerActions, useFormDesignerUndoableState } from '@/providers/formDesigner';

export type IUndoRedoButtonsProps = Pick<ButtonProps, 'size' | 'type'>;

export const UndoRedoButtons: FC<IUndoRedoButtonsProps> = (props) => {
  const { canUndo, canRedo } = useFormDesignerUndoableState();
  const { undo, redo } = useFormDesignerActions();

  return (
    <Space direction="horizontal" size={2}>
      <Button
        icon={<UndoOutlined />}
        key="undo"
        onClick={undo}
        disabled={!canUndo}
        title="Undo"
        size={props.size}
      />
      <Button
        icon={<RedoOutlined />}
        key="redo"
        onClick={redo}
        disabled={!canRedo}
        title="Redo"
        size={props.size}
      />
    </Space>
  );
};
