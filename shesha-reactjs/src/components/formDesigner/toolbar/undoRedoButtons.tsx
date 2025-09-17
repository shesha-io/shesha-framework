import React, { FC } from 'react';
import { Button, ButtonProps } from 'antd';
import { RedoOutlined, UndoOutlined } from '@ant-design/icons';
import { useFormDesignerActions, useFormDesignerUndoableState } from '@/providers/formDesigner';

export interface IUndoRedoButtonsProps extends Pick<ButtonProps, 'size' | 'type'> {

}

export const UndoRedoButtons: FC<IUndoRedoButtonsProps> = (props) => {
    const { canUndo, canRedo } = useFormDesignerUndoableState();
    const { undo, redo } = useFormDesignerActions();
    
    return (
        <>
            <Button key="undo" icon={<UndoOutlined />} size={props.size} onClick={undo} disabled={!canUndo} title="Undo"/>
            <Button key="redo" icon={<RedoOutlined />} size={props.size} onClick={redo} disabled={!canRedo} title="Redo"/>
        </>
    );
};