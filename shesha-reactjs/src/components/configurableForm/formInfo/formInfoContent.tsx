import { ArrowsAltOutlined } from '@ant-design/icons';
import { Button, Form, Modal } from 'antd';
import { FormDesignerRenderer } from 'components/formDesigner/formDesignerRenderer';
import React, { FC } from 'react';
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

const FormInfoContentWrapper: FC<Omit<IFormInforContent, 'id'>> = ({ onClose, open }) => {
  const [form] = Form.useForm();

  const { allComponents, componentRelations, formSettings } = useFormDesigner();

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

export const FormInfoContent: FC<IFormInforContent> = ({ id, ...props }) => {
  const onFinsih = () => {
    if (props.onMarkupUpdated) props.onMarkupUpdated();

    props?.onClose();
  };

  const onAfterDone = onFinsih;

  const onAfterPublish = onFinsih;

  const onAfterVersion = onFinsih;

  const containerPorps = {
    onAfterDone,
    onAfterPublish,
    onAfterVersion,
    toolbarRightButton: (
      <Button onClick={() => window?.open(props.forwardLink, '_blank')} type={'default'} shape="circle" title="Expand">
        <ArrowsAltOutlined />
      </Button>
    ),
  };

  return (
    <FormInfoContentConainter formId={id} {...containerPorps}>
      <FormInfoContentWrapper {...props} onClose={onFinsih} />
    </FormInfoContentConainter>
  );
};

export default FormInfoContent;
