import React, { FC, useMemo } from 'react';
import { Modal, Form } from 'antd';
import { useDynamicModals } from '../../providers';
import { ConfigurableForm, IConfigurableFormProps } from '../';
import { IModalWithConfigurableFormProps, IModalWithContentProps } from '../../providers/dynamicModal/models';
import { evaluateString, MODAL_DATA, useGlobalState, useShaRouting } from '../..';
import _ from 'lodash';
import { useMedia } from 'react-use';
import { StandardEntityActions } from '../../interfaces/metadata';

export interface IDynamicModalWithFormProps extends Omit<IModalWithConfigurableFormProps, 'fetchUrl'> {
  isVisible: boolean;
}
export const DynamicModalWithForm: FC<IDynamicModalWithFormProps> = props => {
  const {
    id,
    title,
    isVisible,
    formId,
    showModalFooter,
    submitHttpVerb,
    onSuccessRedirectUrl,
    initialValues,
    destroyOnClose,
    parentFormValues,
    width,
    modalConfirmDialogMessage,
    onFailed,
    prepareInitialValues,
    mode = 'edit',
    skipFetchData,
    submitLocally,
    onCancel,
  } = props;

  const [form] = Form.useForm();
  const { hide, removeModal } = useDynamicModals();
  const { router } = useShaRouting();
  const { clearState } = useGlobalState();

  const onOk = () => {
    //console.log('LOG:onOk')
    if (submitLocally) {
      const formValues = form?.getFieldsValue();

      onSubmitted(null, formValues);
    } else {
      if (showModalFooter) {
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

  const onSubmitted = (_: any, response: any) => {
    //console.log('LOG:onSubmitted');
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
    hide(id);

    if (destroyOnClose) {
      removeModal(id);
    }
  };

  // Some Dropdown components that set the `submitHttpVerb` sets it as follows
  // defaultValue: ['POST']
  // the value would change from array to string as you change it on the dropdown. Which means you can end up with ['POST'], 'POST' or 'PUT'
  // That has been updated in this commit such that you no longer receive an array
  const submitAction = useMemo(() => {
    const submitVerb =
      Array.isArray(submitHttpVerb) && submitHttpVerb?.length ? (submitHttpVerb[0] as string) : submitHttpVerb;

    return submitVerb === 'POST' || !submitVerb ? StandardEntityActions.create : StandardEntityActions.update;
  }, [submitHttpVerb]);

  const formProps: IConfigurableFormProps = {
    formId: formId,
    submitAction,
    form: form,
    mode: mode,
    actions: {
      close: handleCancel,
    },
    onFinish: onSubmitted,
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
      footer={showModalFooter ? undefined : null}
      content={<ConfigurableForm {...formProps} />}
    />
  );
};

export interface IDynamicModalWithContentProps extends IModalWithContentProps {
  isVisible: boolean;
  //content: ReactNode;
  onCancel?: () => void;
  onOk?: () => void;
}
export const DynamicModalWithContent: FC<IDynamicModalWithContentProps> = props => {
  const { id, title, isVisible, destroyOnClose, width, onCancel, onOk, content, footer } = props;

  const { hide, removeModal } = useDynamicModals();
  const isSmall = useMedia('(max-width: 480px)');

  const hideForm = () => {
    if (Boolean(onCancel)) {
      onCancel();
    } else {
      hide(id);

      if (destroyOnClose) {
        removeModal(id);
      }
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
export const DynamicModal: FC<DynamicModalProps> = props => {
  const withFormProps = props as IDynamicModalWithFormProps;
  if (withFormProps.formId) {
    return <DynamicModalWithForm {...withFormProps} />;
  }

  const withContentProps = props as IDynamicModalWithContentProps;
  return <DynamicModalWithContent {...withContentProps} />;
};

export default DynamicModal;
