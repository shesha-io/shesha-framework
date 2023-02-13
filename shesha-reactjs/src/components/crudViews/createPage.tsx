import React from 'react';
import { Form, Spin, Button } from 'antd';
import { MainLayout, ValidationErrors, ConfigurableForm, IndexToolbar } from '../';
import { FormInstance } from 'antd/lib/form';
import { useUi } from '../../providers';
import { NextPage } from 'next';
import { IDataMutator } from './models';
import { IToolbarItem } from '../../interfaces';
import { SaveOutlined, CloseOutlined, CheckCircleOutlined } from '@ant-design/icons';
import PageBtnContainer from '../pageBtnContainer';
import { useShaRouting } from '../../providers/shaRouting';
import { FormIdentifier, FormMarkup, IFormActions, IFormSections } from '../../providers/form/models';

export interface IGenericCreatePageProps {
  title?: string;
  formId?: FormIdentifier;
  formMarkup?: FormMarkup;
  updater: (props: any) => IDataMutator;
  onSuccess?: (form: FormInstance) => void;
  prepareValues?: (values: any) => any;
  initialValues?: any;
  actionButtonPosition?: 'top' | 'bottom';
  /**
   * Form actions. Page-specific actions which can be executed from the configurable form
   */
  formActions?: IFormActions;

  /**
   * Form sections. Form-specific sections which can be rendered within the configurable form
   */
  formSections?: IFormSections;
}

const GenericCreatePage: NextPage<IGenericCreatePageProps> = ({
  onSuccess,
  updater,
  title,
  formId,
  prepareValues,
  initialValues,
  formActions,
  formSections,
  actionButtonPosition = 'top',
  formMarkup,
}) => {
  const { mutate: save, error: saveError, loading: saveInProgress } = updater({});

  const { router } = useShaRouting();
  const [form] = Form.useForm();

  const toolbarItems: IToolbarItem[] = [
    {
      title: 'Submit',
      icon: <SaveOutlined />,
      onClick: () => {
        form.submit();
      },
    },
    {
      title: 'Close',
      icon: <CloseOutlined />,
      onClick: () => {
        router?.back();
      },
    },
  ];

  const handleSubmit = (values: any) => {
    const preparedValues = typeof prepareValues === 'function' ? prepareValues(values) : values;

    save(preparedValues).then(() => {
      if (onSuccess) onSuccess(form);
      else router?.back();
    });
  };
  const { formItemLayout } = useUi();

  return (
    <MainLayout title={title} toolbar={actionButtonPosition === 'top' ? <IndexToolbar items={toolbarItems} /> : null}>
      <Spin spinning={saveInProgress} tip="Please wait...">
        <ValidationErrors error={saveError?.data} />

        <ConfigurableForm
          mode="edit"
          {...formItemLayout}
          form={form}
          markup={formMarkup}
          onFinish={handleSubmit}
          formId={formId}
          initialValues={initialValues}
          actions={formActions}
          sections={formSections}
        />

        {actionButtonPosition === 'bottom' && (
          <PageBtnContainer>
            <Button
              icon={<CloseOutlined />}
              onClick={() => {
                router?.back();
              }}
            >
              Cancel
            </Button>

            <Button
              type="primary"
              icon={<CheckCircleOutlined />}
              onClick={() => {
                form.submit();
              }}
            >
              Submit
            </Button>
          </PageBtnContainer>
        )}
      </Spin>
    </MainLayout>
  );
};

export default GenericCreatePage;
