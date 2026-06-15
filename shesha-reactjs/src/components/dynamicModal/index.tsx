import React, { FC, ReactNode, useState } from 'react';
import { ButtonGroup } from '@/designer-components/button/buttonGroup/buttonGroup';
import { ConfigurableForm, IConfigurableFormProps, Show } from '@/components/';
import { Form, Modal } from 'antd';
import { IModalWithConfigurableFormProps, IModalWithContentProps } from '@/providers/dynamicModal/models';
import { useDynamicModals } from '@/providers';
import { useMedia } from 'react-use';
import { useStyles } from './styles';
import DOMPurify from 'dompurify';
import { isDefined } from '@/utils/nullables';

export interface IDynamicModalWithContentProps extends IModalWithContentProps {
  isVisible: boolean;
  isSubmitted?: boolean | undefined;
  onCancel?: (() => void) | undefined;
  onOk?: (() => void) | undefined;
  showCloseIcon?: boolean | undefined;
}

const renderContent = (content: ReactNode): ReactNode => {
  return typeof content == 'string'
    ? <div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} />
    : content;
};

export const DynamicModalWithContent: FC<IDynamicModalWithContentProps> = (props) => {
  const { id, title, isVisible, width, isSubmitted = false, onCancel, onOk, content, footer, onClose, showCloseIcon } = props;

  const { removeModal } = useDynamicModals();
  const isSmall = useMedia('(max-width: 480px)');
  const { styles } = useStyles();

  const hideForm = (): void => {
    if (onClose) onClose();
    if (isDefined(onCancel)) {
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
      {...(onOk ? { onOk } : {})}
      onCancel={hideForm}
      footer={renderContent(footer)}
      destroyOnHidden
      width={isSmall ? '90%' : width ?? '80vw'}
      centered
      classNames={{ body: styles.dynamicModalBody }}
      mask={{ closable: false }}
      closable={showCloseIcon ?? true}
      okButtonProps={{ disabled: isSubmitted, loading: isSubmitted }}
    >
      {renderContent(content)}
    </Modal>
  );
};

export interface IDynamicModalWithFormProps<Values extends object = object> extends Omit<IModalWithConfigurableFormProps<Values>, 'fetchUrl'> {
  isVisible: boolean;
}
export const DynamicModalWithForm = <Values extends object = object>(props: IDynamicModalWithFormProps<Values>): ReactNode => {
  const {
    id,
    title,
    isVisible,
    formId,
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
    showCloseIcon = false,
  } = props;

  const [form] = Form.useForm();
  const { removeModal } = useDynamicModals();
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const showDefaultSubmitButtons = footerButtons === 'default';

  const closeModal = (): void => {
    removeModal(id);
  };

  const onSubmitted: IConfigurableFormProps<Values>["onSubmitted"] = (_values, response): void => {
    if (props.onSubmitted) {
      props.onSubmitted(response as Values);
    }

    closeModal();

    form.resetFields();
  };

  const handleCancel = (): void => {
    closeModal();
    if (onCancel) {
      onCancel();
    }
  };

  const onOk = (): void => {
    if (showDefaultSubmitButtons) {
      form.submit();
      void form.validateFields().then(() => {
        form.submit();
        setIsSubmitted(true);
      });
    } else {
      closeModal();
    }
  };

  const formProps: IConfigurableFormProps<Values> = {
    formId: formId,
    formArguments: formArguments,
    form: form,
    mode: mode,
    onSubmitted: onSubmitted,
    onFinishFailed: onFailed,
    onSubmittedFailed: () => setIsSubmitted(false),
    initialValues: initialValues,
    parentFormValues: parentFormValues,
    isActionsOwner: true,
    formName: id,
    // logEnabled: true,
  };

  const content = (
    <Show when={footerButtons === 'custom' && Boolean(buttons.length)}>
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <ButtonGroup items={buttons} id="" size="middle" isInline noStyles form={form} />
      </div>
    </Show>
  );
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
      showCloseIcon={showCloseIcon}
      content={(
        <ConfigurableForm<Values> {...formProps}>
          {isDefined(wrapper) ? wrapper({ children: content }) : content}
        </ConfigurableForm>
      )}
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
