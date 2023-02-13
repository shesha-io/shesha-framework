import React, { FC, ReactNode, useState } from 'react';
import { Button, Form, Modal, Spin } from 'antd';
import { ValidationErrors, ConfigurableForm } from '../';
import { FormInstance } from 'antd/lib/form';
import { useShaRouting, useUi } from '../../providers';
import { IDataMutator } from './models';
import { FormIdentifier, FormMarkup, IFormActions, IFormSections } from '../../providers/form/models';
import { useMedia } from 'react-use';

export enum OnSuccessActionType {
  Return = 'RETURN',
  AddMore = 'ADD_MORE',
  GoToDetails = 'GO_TO_DETAILS',
  GoToUrl = 'GO_TO_URL',
}

export interface IGenericCreateModalProps {
  /**
   * Modal title
   */
  title: string;

  /**
   * Whether the modal is visible
   */
  visible?: boolean;

  /**
   * Identifier of form to display on the modal
   */
   formId: FormIdentifier;

  /**
   * A callback to update the entity
   */
  updater: (props: any) => IDataMutator;

  /**
   * A callback to cancel the modal
   */
  onCancel?: (form: FormInstance) => void;

  /**
   * A callback to for when the updating of an entity is successful
   */
  onSuccess?: (form: FormInstance, keepOpen?: boolean) => void;

  /**
   * A function to prepare modal values
   */
  prepareValues?: (values: any) => any;

  /**
   * An enum that determines what happens after a user saves a form
   */
  OnSuccessAction?: OnSuccessActionType;

  /**
   * Allows changing of the label of the Save/Submit in the modal
   */
  submitButtonLabel?: string | ReactNode;

  /**
   * Allows changing of the label of the Cancel in the modal
   */
  cancelButtonLabel?: string | ReactNode;

  /**
   * The URL to navigate to after successfully submitting the form and the OnSuccessAction is set to "GoToUrl"
   */
  onSuccessUrl?: string | ((data: any) => string);

  onFieldsChange?: (changedFields: any[], allFields: any[]) => void;

  beforeSubmit?: (form: any) => boolean;

  actions?: IFormActions;

  sections?: IFormSections;

  destroyOnClose?: boolean;

  formMarkup?: FormMarkup;

  returnUrlOnSuccess?: string | ((data: any) => string);
}

const GenericCreateModal: FC<IGenericCreateModalProps> = ({
  visible,
  onCancel,
  onSuccess,
  updater,
  title,
  formId,
  prepareValues,
  OnSuccessAction = OnSuccessActionType.Return,
  onSuccessUrl,
  submitButtonLabel = 'Submit',
  cancelButtonLabel = 'Cancel',
  onFieldsChange,
  beforeSubmit,
  actions,
  sections,
  destroyOnClose = true,
  formMarkup,
}) => {
  const isSmall = useMedia('(max-width: 480px)');
  const { mutate: save, error, loading } = updater({});
  const { router } = useShaRouting();

  const [localKeepOpen, setLocalKeepOpen] = useState(false);

  const [form] = Form.useForm();

  const onSubmit = () => {
    form.submit();
  };

  const onFinish = (values: any) => {
    // We must always use updated values, in case the user had prepared values by then also update the values in the form
    const preparedValues = typeof prepareValues === 'function' ? prepareValues(values) : values;

    if (beforeSubmit && !beforeSubmit(preparedValues)) {
      return;
    }

    save(preparedValues).then(result => {
      switch (OnSuccessAction) {
        // Go to the details page of the entity you just created
        case OnSuccessActionType.GoToDetails:
          setLocalKeepOpen(false);
          onSuccess(form, localKeepOpen);
          router?.push(onSuccessUrl + '/?id=' + result.id);
          break;

        // Go to a specific url on success if the OnSuccessActionType is GoToUrl
        case OnSuccessActionType.GoToUrl:
          setLocalKeepOpen(false);
          onSuccess(form, localKeepOpen);
          if (onSuccessUrl) {
            router?.push(typeof onSuccessUrl === 'function' ? onSuccessUrl(result) : onSuccessUrl);
          }
          break;

        // Keep the form open and keep adding more items
        case OnSuccessActionType.AddMore:
          setLocalKeepOpen(true);
          onSuccess(form, localKeepOpen);
          break;

        // By default close the form and go back to the page that called the form
        default:
          setLocalKeepOpen(false);
          onSuccess(form, localKeepOpen);
          break;
      }
    });
  };

  const handleCancel = () => {
    onCancel(form);
  };

  const { formItemLayout } = useUi();

  return (
    <Modal
      width={isSmall ? '90%' : '60%'}
      open={visible}
      title={title}
      confirmLoading={loading}
      onCancel={handleCancel}
      destroyOnClose={destroyOnClose}
      footer={
        <div>
          <Button onClick={handleCancel}>{cancelButtonLabel}</Button>
          <Button type="primary" onClick={onSubmit}>
            {submitButtonLabel}
          </Button>
        </div>
      }
    >
      <Spin spinning={loading} tip="Please wait...">
        <ValidationErrors error={error?.data} />

        <ConfigurableForm
          mode="edit"
          {...formItemLayout}
          form={form}
          onFinish={onFinish}
          formId={formId}
          markup={formMarkup}
          onFieldsChange={onFieldsChange}
          actions={actions}
          sections={sections}
          skipPostOnFinish
        />
      </Spin>
    </Modal>
  );
};
export default GenericCreateModal;
