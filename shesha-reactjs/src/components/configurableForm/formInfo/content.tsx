import { ArrowsAltOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import { FormDesigner } from 'components';
import React, { FC, useEffect } from 'react';
import { useFormInfoContent } from '../../../providers';

interface IFormInforContent {
  id: string;
  forwardLink: string;
  onClose: () => void;
  open: boolean;
}

const Content: FC<IFormInforContent> = ({ id, forwardLink, onClose, open }) => {
  const { actionFlag, setActionFlag, setToolbarRightButton } = useFormInfoContent();

  useEffect(() => {
    if (open)
      setToolbarRightButton(
        <Button onClick={() => window?.open(forwardLink, '_blank')} type={'default'} shape="circle" title="Expand">
          <ArrowsAltOutlined />
        </Button>
      );

    return () => setToolbarRightButton(null);
  }, [open]);

  const reset = () => {
    setActionFlag(null);

    onClose();
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
