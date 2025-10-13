import React, { FC } from 'react';
import { FormIdentifier } from '@/interfaces';
import { Modal } from 'antd';
import { FormDesigner } from '../index';
import { DesignerMainArea } from '../designerMainArea/index';
import { QuickEditToolbar } from './quickEditToolbar';
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

  return !open
    ? null
    : (
      <Modal
        open={open}
        onCancel={onCancel}
        width="calc(100vw)"
        footer={null}
        className={styles.quickEditModal}
      >
        <FormDesigner.NonVisual formId={formId}>
          <div className={styles.formDesigner}>
            <QuickEditToolbar
              renderSource="modal"
              onUpdated={onUpdated}
            />
            <DesignerMainArea />
          </div>
        </FormDesigner.NonVisual>
      </Modal>
    );
};
