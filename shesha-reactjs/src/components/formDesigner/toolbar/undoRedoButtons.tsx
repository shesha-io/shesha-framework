import React, { FC } from 'react';
import { Button } from 'antd';
import { RedoOutlined, UndoOutlined } from '@ant-design/icons';
import { useFormDesigner } from '@/providers/formDesigner';

export interface IUndoRedoButtonsProps {

}

export const UndoRedoButtons: FC<IUndoRedoButtonsProps> = () => {
    const { undo, redo, canUndo, canRedo } = useFormDesigner();
    return (
        <>
            <Button key="undo" shape="circle" onClick={undo} disabled={!canUndo} title="Undo">
                <UndoOutlined />
            </Button>
            <Button key="redo" shape="circle" onClick={redo} disabled={!canRedo} title="Redo">
                <RedoOutlined />
            </Button>
        </>
    );
};