import React, { FC } from 'react';
import { Modal, Form } from 'antd';
import { useDynamicModals } from '../../providers';
import { ConfigurableForm, IConfigurableFormProps, Show } from '../';
import { IModalWithConfigurableFormProps, IModalWithContentProps } from '../../providers/dynamicModal/models';
import { evaluateString, useGlobalState, useShaRouting } from '../..';
import _ from 'lodash';
import { useMedia } from 'react-use';
import { StandardEntityActions } from '../../interfaces/metadata';
import { MODAL_DATA } from '../../shesha-constants';
import { ButtonGroup } from 'components/formDesigner/components/button/buttonGroup/buttonGroup';

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
    submitHttpVerb,
    onSuccessRedirectUrl,
    initialValues,
    parentFormValues,
    width,
    modalConfirmDialogMessage,
    onFailed,
    prepareInitialValues,
    mode = 'edit',
    skipFetchData,
    submitLocally,
    onCancel,
    buttons = [],
    footerButtons = 'default',
  } = props;

  const [form] = Form.useForm();
  const { removeModal } = useDynamicModals();
  const { router } = useShaRouting();
  const { clearState } = useGlobalState();

  // `showModalFooter` for now is for backward compatibility
  const showDefaultSubmitButtons = showModalFooter || footerButtons === 'default';

  const onOk = () => {
    if (submitLocally) {
      const formValues = form?.getFieldsValue();

      onSubmitted(null, formValues);
    } else {
      if (showDefaultSubmitButtons) {
        form?.submit();
      } else {
        closeModal();
      }
    }
  };

  const beforeSubmit = () => {
    return new Promise<boolean>((resolve, reject) => {
      if (modalConfirmDialogMessage) {
        Modal.confirm({ content: modalConfirmDialogMessage, onOk: () => resolve(true), onCancel: () => reject(false) });
      } else {
        resolve(true);
      }
    });
  };

  const onSubmitted = (_values: any, response: any) => {
    if (onSuccessRedirectUrl) {
      const computedRedirectUrl = evaluateString(onSuccessRedirectUrl, response);

      router?.push(computedRedirectUrl);
    }

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

  const closeModal = () => {
    clearState(MODAL_DATA);
    removeModal(id);
  };

  const formProps: IConfigurableFormProps = {
    formId: formId,
    submitAction:
      submitHttpVerb === 'POST' || !submitHttpVerb ? StandardEntityActions.create : StandardEntityActions.update,
    form: form,
    mode: mode,
    actions: {
      close: handleCancel,
    },
    onSubmitted: onSubmitted,
    prepareInitialValues: prepareInitialValues,
    onFinishFailed: onFailed,
    beforeSubmit: beforeSubmit,
    httpVerb: submitHttpVerb,
    initialValues: initialValues,
    parentFormValues: parentFormValues,
    skipFetchData: skipFetchData,
  };

  return (
    <DynamicModalWithContent
      key={id}
      id={id}
      title={title}
      width={width}
      isVisible={isVisible}
      onOk={onOk}
      onCancel={closeModal}
      footer={showDefaultSubmitButtons ? undefined : null}
      content={
        <ConfigurableForm {...formProps}>
          <Show when={footerButtons === 'custom' && Boolean(buttons?.length)}>
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
              <ButtonGroup items={buttons || []} name={''} type={''} id={''} size="middle" isInline noStyles />
            </div>
          </Show>
        </ConfigurableForm>
      }
    />
  );
};

export interface IDynamicModalWithContentProps extends IModalWithContentProps {
  isVisible: boolean;
  //content: ReactNode;
  onCancel?: () => void;
  onOk?: () => void;
}
export const DynamicModalWithContent: FC<IDynamicModalWithContentProps> = (props) => {
  const { id, title, isVisible, width, onCancel, onOk, content, footer } = props;

  const { removeModal } = useDynamicModals();
  const isSmall = useMedia('(max-width: 480px)');

  const hideForm = () => {
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
      // width={width ? width : 800}
      width={isSmall ? '90%' : width || 900}
      maskClosable={false}
    >
      {content}
    </Modal>
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
