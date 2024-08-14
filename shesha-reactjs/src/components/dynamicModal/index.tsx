import _ from 'lodash';
import React, { FC } from 'react';
import { ButtonGroup } from '@/designer-components/button/buttonGroup/buttonGroup';
import { ConfigurableForm, IConfigurableFormProps, Show } from '@/components/';
import { Form, Modal } from 'antd';
import { IModalWithConfigurableFormProps, IModalWithContentProps } from '@/providers/dynamicModal/models';
import { useDynamicModals } from '@/providers';
import { useMedia } from 'react-use';

export interface IDynamicModalWithContentProps extends IModalWithContentProps {
  isVisible: boolean;
  onCancel?: () => void;
  onOk?: () => void;
}
export const DynamicModalWithContent: FC<IDynamicModalWithContentProps> = (props) => {
  const { id, title, isVisible, width, onCancel, onOk, content, footer, onClose } = props;

  const { removeModal } = useDynamicModals();
  const isSmall = useMedia('(max-width: 480px)');

  const hideForm = () => {
    if (onClose) onClose();
    if (Boolean(onCancel)) {
      onCancel();
    } else {
      removeModal(id);
    }

  };

  return (
    <Modal
      key={id}
      title={title}
      open={isVisible}
      onOk={onOk}
      onCancel={hideForm}
      footer={footer}
      destroyOnClose
      width={isSmall ? '90%' : width || 900}
      maskClosable={false}
    >
      {content}
    </Modal>
  );
};

export interface IDynamicModalWithFormProps extends Omit<IModalWithConfigurableFormProps, 'fetchUrl'> {
  isVisible: boolean;
}
export const DynamicModalWithForm: FC<IDynamicModalWithFormProps> = (props) => {
  const {
    id,
    title,
    isVisible,
    formId,
    showModalFooter,
    formArguments,
    initialValues,
    parentFormValues,
    width,
    onFailed,
    mode = 'edit',
    onCancel,
    buttons = [],
    footerButtons = 'default',
  } = props;

  const [form] = Form.useForm();
  const { removeModal } = useDynamicModals();

  // `showModalFooter` for now is for backward compatibility
  const showDefaultSubmitButtons = showModalFooter || footerButtons === 'default';

  const closeModal = () => {
    removeModal(id);
  };

  const onSubmitted = (_values: any, response: any) => {
    console.log('LOG: dialog onSubmitted 🔥', { _values, response });

    if (props.onSubmitted) {
      props.onSubmitted(response);
    }

    closeModal();

    form.resetFields();
  };

  const handleCancel = () => {
    closeModal();
    if (onCancel) {
      onCancel();
    }
  };

  const onOk = () => {
    if (showDefaultSubmitButtons) {
      form?.submit();
    } else {
      closeModal();
    }
  };

  const formProps: IConfigurableFormProps = {
    formId: formId,
    formArguments: formArguments,
    form: form,
    mode: mode,
    onSubmitted: onSubmitted,
    onFinishFailed: onFailed,
    initialValues: initialValues,
    parentFormValues: parentFormValues,

    logEnabled: true,
  };

  console.log('LOG: dialog formProps 🔥', formProps);

  return (
    <DynamicModalWithContent
      key={id}
      id={id}
      title={title}
      width={width}
      isVisible={isVisible}
      onOk={onOk}
      onCancel={handleCancel}
      footer={showDefaultSubmitButtons ? undefined : null}
      content={
        <ConfigurableForm {...formProps}>
          <Show when={footerButtons === 'custom' && Boolean(buttons?.length)}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <ButtonGroup items={buttons || []} id={''} size="middle" isInline noStyles form={form} />
            </div>
          </Show>
        </ConfigurableForm>
      }
    />
  );
};

type DynamicModalProps = IDynamicModalWithContentProps | IDynamicModalWithFormProps;
export const DynamicModal: FC<DynamicModalProps> = (props) => {
  const withFormProps = props as IDynamicModalWithFormProps;
  if (withFormProps.formId) {
    return <DynamicModalWithForm {...withFormProps} />;
  }

  const withContentProps = props as IDynamicModalWithContentProps;
  return <DynamicModalWithContent {...withContentProps} />;
};

export default DynamicModal;
