import React, { FC, useEffect } from 'react';
import { Form, Modal, Spin } from 'antd';
import { ValidationErrors, ConfigurableForm } from '../';
import { FormInstance } from 'antd/lib/form';
import { useUi } from '../../providers';
import { UseGenericGetProps, IDataFetcher, IDataMutator } from './models';
import { FormIdentifier, FormMarkup, IFormActions, IFormSections } from '../../providers/form/models';
import { useMedia } from 'react-use';

export interface IGenericEditModalProps {
  id: string;
  title?: (model: any) => string;
  visible: boolean;
  formId: FormIdentifier;
  formMarkup?: FormMarkup;
  fetcher: (props: UseGenericGetProps) => IDataFetcher;
  updater: (props: any) => IDataMutator;
  onCancel: (form: FormInstance) => void;
  onSuccess: (form: FormInstance) => void;
  prepareValues?: (values: any) => any;
  onFieldsChange?: (changedFields: any[], allFields: any[]) => void;
  beforeSubmit?: (form: any) => boolean;
  actions?: IFormActions;
  sections?: IFormSections;
  destroyOnClose?: boolean;
}

const GenericEditModal: FC<IGenericEditModalProps> = ({
  id,
  visible,
  onCancel,
  onSuccess,
  fetcher,
  updater,
  title,
  formId,
  prepareValues,
  onFieldsChange,
  beforeSubmit,
  actions,
  sections,
  destroyOnClose = true,
  formMarkup,
}) => {
  const { loading: loadingInProgress, refetch: doFetch, error: fetchError, data: fetchedData } = fetcher({
    lazy: true,
  });
  const isSmall = useMedia('(max-width: 480px)');

  const fetchData = async () => {
    await doFetch({ queryParams: { id } });
  };

  // fetch data on page load
  useEffect(() => {
    fetchData();
  }, []);

  const { mutate: save, error: saveError, loading: saveInProgress } = updater({});

  const [form] = Form.useForm();

  const handleSubmit = values => {
    // We must always use updated values, in case the user had prepared values by then also update the values in the form
    const preparedValues = typeof prepareValues === 'function' ? { ...prepareValues(values), ...values } : values;

    if (beforeSubmit && !beforeSubmit(preparedValues)) {
      return;
    }

    save(preparedValues).then(() => {
      onSuccess(form);
    });
  };

  const handleCancel = () => {
    onCancel(form);
  };

  const { formItemLayout } = useUi();

  const model = fetchedData?.result;

  return (
    <Modal
      width={isSmall ? '90%' : '60%'}
      open={visible}
      title={title ? title(model) : 'Edit'}
      okText="Save"
      onCancel={handleCancel}
      onOk={() => form.submit()}
      confirmLoading={saveInProgress}
      destroyOnClose={destroyOnClose}
    >
      <Spin spinning={loadingInProgress || saveInProgress} tip="Please wait...">
        <ValidationErrors error={saveError?.data || fetchError?.data} />
        {model && (
          <ConfigurableForm
            mode="edit"
            {...formItemLayout}
            form={form}
            markup={formMarkup}
            onFinish={handleSubmit}
            formId={formId}
            initialValues={model}
            onFieldsChange={onFieldsChange}
            actions={actions}
            sections={sections}
          />
        )}
      </Spin>
    </Modal>
  );
};
export default GenericEditModal;
