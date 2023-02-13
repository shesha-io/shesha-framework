import React from 'react';
import { Form, Button } from 'antd';
import { ValidationErrors, ConfigurableForm, Show } from '..';
import { FormInstance } from 'antd/lib/form';
import { useUi } from '../../providers';
import { NextPage } from 'next';
import { IDataMutator } from './models';
import { IToolbarItem } from '../../interfaces';
import { SaveOutlined, CloseOutlined, CheckCircleOutlined } from '@ant-design/icons';
import PageBtnContainer from '../pageBtnContainer';
import { useShaRouting } from '../../providers/shaRouting';
import { FormMarkup, IFormActions, IFormSections } from '../../providers/form/models';
import Page, { IPageProps } from '../page';

export interface IGenericCreatePageProps extends IPageProps {
  title?: string;

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

const GenericCreatePagePlain: NextPage<IGenericCreatePageProps> = ({
  onSuccess,
  updater: useUpdater,
  title,
  prepareValues,
  initialValues,
  formActions,
  formSections,
  actionButtonPosition = 'top',
  formMarkup,
  toolbarItems,
  ogImage,
  backUrl,
  breadcrumbItems,
  headerTagList,
  loadingText,
  formId,
}) => {
  const { mutate: save, error: saveError, loading: saveInProgress } = useUpdater({});

  const { router } = useShaRouting();
  const [form] = Form.useForm();

  const localToolbarItems: IToolbarItem[] = [
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
    <Page
      title={title}
      toolbarItems={
        actionButtonPosition === 'top' ? [...localToolbarItems, ...(toolbarItems || [])] : toolbarItems || []
      }
      loading={saveInProgress}
      ogImage={ogImage}
      backUrl={backUrl}
      breadcrumbItems={breadcrumbItems}
      headerTagList={headerTagList}
      loadingText={loadingText}
    >
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

      <Show when={actionButtonPosition === 'bottom'}>
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
      </Show>
    </Page>
  );
};

export default GenericCreatePagePlain;
