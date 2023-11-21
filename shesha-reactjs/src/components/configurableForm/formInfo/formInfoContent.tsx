import { ArrowsAltOutlined } from '@ant-design/icons';
import { Button, Form, Modal } from 'antd';
import { FormDesignerRenderer } from 'components/formDesigner/formDesignerRenderer';
import React, { FC, useEffect, useState } from 'react';
import { FormProvider, useFormDesigner } from '../../../providers';
import FormInfoContentConainter from './formInfoContainer';

interface IState {
  done?: boolean;
  publish?: boolean;
  version?: boolean;
}

interface IFormInforContent extends IState {
  id: string;
  forwardLink: string;
  onClose: () => void;
  open: boolean;
  /**
   * Is used for update of the form markup. If value of this handler is not defined - the form is read-only
   */
  onMarkupUpdated?: () => void;
}

const INIT_STATE: IState = { done: false, publish: false, version: false };

const FormInfoContentWrapper: FC<Omit<IFormInforContent, 'id'>> = ({
  onClose,
  open,
  onMarkupUpdated,
  done,
  publish,
  version,
}) => {
  const [form] = Form.useForm();

  const { allComponents, componentRelations, formSettings } = useFormDesigner();

  useEffect(() => {
    if (done || publish || version) {
      if (onMarkupUpdated) onMarkupUpdated();

      onClose();
    }
  }, [done, publish, version]);

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
  const [state, setState] = useState<IState>(INIT_STATE);

  const onAfterDone = () => setState((s) => ({ ...s, done: true }));

  const onAfterPublish = () => setState((s) => ({ ...s, publish: true }));

  const onAfterVersion = () => setState((s) => ({ ...s, version: true }));

  const onFinish = () => {
    if (props?.onClose) props.onClose();

    setState(INIT_STATE);
  };

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
      <FormInfoContentWrapper {...props} {...state} onClose={onFinish} />
    </FormInfoContentConainter>
  );
};

export default FormInfoContent;
