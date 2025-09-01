import React, { FC } from 'react';
import { Button } from 'antd';
import { RedoOutlined, UndoOutlined } from '@ant-design/icons';
import { useFormDesignerActions, useFormDesignerUndoableState } from '@/providers/formDesigner';

export interface IUndoRedoButtonsProps {

}

export const UndoRedoButtons: FC<IUndoRedoButtonsProps> = () => {
    const { canUndo, canRedo } = useFormDesignerUndoableState();
    const { undo, redo } = useFormDesignerActions();
    
    return (
        <>
            <Button key="undo" icon={<UndoOutlined />} size='small' onClick={undo} disabled={!canUndo} title="Undo"/>
            <Button key="redo" icon={<RedoOutlined />} size='small' onClick={redo} disabled={!canRedo} title="Redo"/>
        </>
    );
};