import React, { FC, useState } from 'react';
import { FormIdentifier } from '@/interfaces';
import { Modal } from 'antd';
import { FormDesigner } from '../index';
import { DesignerMainArea } from '../designerMainArea/index';
import { QuickEditToolbar } from './quickEditToolbar';
import { FormConfigurationDto } from '@/providers/form/api';
import { useMainStyles } from '../styles/styles';

export interface IQuickEditDialogProps {
    open: boolean;
    onCancel: () => void;
    onUpdated: () => void;
    formId: FormIdentifier;
}

export const QuickEditDialog: FC<IQuickEditDialogProps> = (props) => {
    const { styles } = useMainStyles();
    const { open, onCancel, onUpdated, formId } = props;
    const [latestFormId, setLatestFormId] = useState(null);

    const onNewVersionCreated = (newVersion: FormConfigurationDto) => {
        setLatestFormId(newVersion.id);
    };

    return !open
        ? null
        : (
            <Modal
                open={open}
                onCancel={onCancel}
                width={'calc(100vw)'}
                footer={null}
                className={styles.quickEditModal}
            >
                <FormDesigner.NonVisual formId={latestFormId ?? formId}>
                    <div className={styles.formDesigner}>
                        <QuickEditToolbar 
                            renderSource='modal'
                            onUpdated={onUpdated}
                            onNewVersionCreated={onNewVersionCreated}
                        />
                        <DesignerMainArea />
                    </div>
                </FormDesigner.NonVisual>
            </Modal>
        );
};