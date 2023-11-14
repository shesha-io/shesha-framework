import { ArrowsAltOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import React, { FC, useEffect, useState } from 'react';
import { FormMode, useForm } from '../../../providers';
import FormDesigner from './designer';

interface IFormInforContent {
  id: string;
  forwardLink: string;
  onClose: () => void;
  open: boolean;
  /**
   * Is used for update of the form markup. If value of this handler is not defined - the form is read-only
   */
  onMarkupUpdated?: () => void;
}

const Content: FC<IFormInforContent> = ({ id, forwardLink, onClose, open, onMarkupUpdated }) => {
  const { actionFlag, setActionFlag, setToolbarRightButton, formMode, setFormMode } = useForm();

  const [mode, setMode] = useState<FormMode>();

  useEffect(() => setMode(formMode), []);

  useEffect(() => {
    if (open) {
      setFormMode('designer');

      setToolbarRightButton(
        <Button onClick={() => window?.open(forwardLink, '_blank')} type={'default'} shape="circle" title="Expand">
          <ArrowsAltOutlined />
        </Button>
      );
    }

    return () => {
      setFormMode(mode);
      setToolbarRightButton(null);
    };
  }, [open]);

  const reset = () => {
    setActionFlag(null);
    onClose();
    onMarkupUpdated();
  };

  useEffect(() => {
    if (actionFlag?.done) reset();
  }, [actionFlag?.done]);

  return (
    <Modal open={open} onCancel={onClose} width={'80%'} footer={null}>
      <FormDesigner formId={id} />
    </Modal>
  );
};

export default Content;
