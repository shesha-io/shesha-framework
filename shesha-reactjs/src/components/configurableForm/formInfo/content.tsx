import { ArrowsAltOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import { FormDesigner } from 'components';
import { nanoid } from 'nanoid';
import React, { FC, ReactNode, useEffect } from 'react';
import { useGlobalState } from '../../../providers';
import { ActionFlag, IFormDesignerActionFlag } from '../../../providers/globalState/models';

interface IFormInforContent {
  id: string;
  forwardLink: string;
  onClose: () => void;
  open: boolean;
}

const Content: FC<IFormInforContent> = ({ id, forwardLink, onClose, open }) => {
  const { globalState, setState } = useGlobalState();
  const actionFlag = globalState?.[ActionFlag.name] as { [key in IFormDesignerActionFlag]: boolean };

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
    onClose();
    setState({ key: ActionFlag.name, data: null });
    //window.location.reload();
  };

  const setToolbarRightButton = (data: ReactNode) =>
    setState({ key: ActionFlag.render, data: data ? { [nanoid()]: data } : null, spread: !!data });

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
