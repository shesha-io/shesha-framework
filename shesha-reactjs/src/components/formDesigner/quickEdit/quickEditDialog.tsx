import React, { FC } from 'react';
import { FormIdentifier } from '@/interfaces';
import { Modal } from 'antd';
import { FormDesigner } from '../index';

export interface IQuickEditDialogProps {
    open: boolean;
    onCancel: () => void;
    onUpdated: () => void;
    formId: FormIdentifier;
}

export const QuickEditDialog: FC<IQuickEditDialogProps> = (props) => {
    const { open, onCancel, formId } = props;

    return !open
        ? null
        : (
            <Modal open={open} onCancel={onCancel} width={'80%'} footer={null}>
                <FormDesigner formId={formId} />
            </Modal>
        );
};