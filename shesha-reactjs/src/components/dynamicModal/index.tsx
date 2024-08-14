import _ from 'lodash';
import React, { FC, useState } from 'react';
import { ButtonGroup } from '@/designer-components/button/buttonGroup/buttonGroup';
import { ConfigurableForm, IConfigurableFormProps, Show } from '@/components/';
import { Form, Modal } from 'antd';
import { IModalWithConfigurableFormProps, IModalWithContentProps } from '@/providers/dynamicModal/models';
import { useDynamicModals } from '@/providers';
import { useMedia } from 'react-use';
import ConditionalWrap from '../conditionalWrapper';

export interface IDynamicModalWithContentProps extends IModalWithContentProps {
  isVisible: boolean;
  isSubmitted?: boolean;
  onCancel?: () => void;
  onOk?: () => void;
}
export const DynamicModalWithContent: FC<IDynamicModalWithContentProps> = (props) => {
  const { id, title, isVisible, width, isSubmitted, onCancel, onOk, content, footer, onClose } = props;

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
      okButtonProps={{ disabled: isSubmitted, loading: isSubmitted }}
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
    wrapper,
  } = props;

  const [form] = Form.useForm();
  const { removeModal } = useDynamicModals();
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);


  // `showModalFooter` for now is for backward compatibility
  const showDefaultSubmitButtons = showModalFooter || footerButtons === 'default';

  const closeModal = () => {
    removeModal(id);
  };

  const onSubmitted = (_values: any, response: any) => {
    console.log('LOG: dialog onSubmitted ??', { _values, response });

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
        form?.validateFields().then(() => {
          form?.submit();
          setIsSubmitted(true);
        });
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
    onSubmittedFailed: () => setIsSubmitted(false),
    initialValues: initialValues,
    parentFormValues: parentFormValues,

    logEnabled: true,
  };

  console.log('LOG: dialog formProps ??', formProps);

  return (
    <DynamicModalWithContent
      key={id}
      id={id}
      title={title}
      width={width}
      isVisible={isVisible}
      isSubmitted={isSubmitted}
      onOk={onOk}
      onCancel={handleCancel}
      footer={showDefaultSubmitButtons ? undefined : null}
      content={
        <ConditionalWrap
          condition={Boolean(wrapper)}
          wrap={(content) => (wrapper({ children: content }))}
        >
        <ConfigurableForm {...formProps}>
          <Show when={footerButtons === 'custom' && Boolean(buttons?.length)}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <ButtonGroup items={buttons || []} id={''} size="middle" isInline noStyles form={form} />
            </div>
          </Show>
        </ConfigurableForm>
        </ConditionalWrap>
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
