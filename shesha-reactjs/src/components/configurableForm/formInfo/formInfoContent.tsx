import { ArrowsAltOutlined } from '@ant-design/icons';
import { Button, Form, Modal } from 'antd';
import { FormDesignerRenderer } from 'components/formDesigner/formDesignerRenderer';
import React, { FC, useEffect } from 'react';
import { FormProvider, useFormDesigner } from '../../../providers';
import FormInfoContentConainter from './formInfoContainer';

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

const FormInfoContentWrapper: FC<Omit<IFormInforContent, 'id'>> = ({ forwardLink, onClose, open, onMarkupUpdated }) => {
  const [form] = Form.useForm();

  const { actionFlag, setActionFlag, setToolbarRightButton, allComponents, componentRelations, formSettings } =
    useFormDesigner();

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
    onMarkupUpdated();

    onClose();
  };

  useEffect(() => {
    const { done, publish, version } = actionFlag || {};

    if (done || publish || version) reset();
  }, [actionFlag]);

  return (
    <Modal open={open} onCancel={onClose} width={'80%'} footer={null}>
      <FormProvider
        needDebug
        name="Designer Form"
        mode="designer"
        allComponents={allComponents}
        componentRelations={componentRelations}
        formSettings={formSettings}
        isActionsOwner={true}
        form={form}
      >
        <FormDesignerRenderer />
      </FormProvider>
    </Modal>
  );
};

export const FormInfoContent: FC<IFormInforContent> = ({ id, ...props }) => (
  <FormInfoContentConainter formId={id}>
    <FormInfoContentWrapper {...props} />
  </FormInfoContentConainter>
);

export default FormInfoContent;
