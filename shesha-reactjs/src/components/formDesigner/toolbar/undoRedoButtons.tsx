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
            <Button
                icon={<UndoOutlined />}
                key="undo"
                shape="circle"
                onClick={undo}
                disabled={!canUndo}
                title="Undo"
                size={props.size}
            />
            <Button
                icon={<RedoOutlined />}
                key="redo"
                shape="circle"
                onClick={redo}
                disabled={!canRedo}
                title="Redo"
                size={props.size}
            />
        </>
    );
};