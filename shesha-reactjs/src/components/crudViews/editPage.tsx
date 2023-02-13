import React, { forwardRef, MutableRefObject, ReactNode, useEffect, useImperativeHandle } from 'react';
import { MainLayout, ValidationErrors, ConfigurableForm, IndexToolbar } from '../';
import { Form, Spin } from 'antd';
import { requestHeaders } from '../../utils/requestHeaders';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { useUi } from '../../providers';
import { FormIdentifier, FormMarkup, IFormActions, IFormSections } from '../../providers/form/models';
import { UseGenericGetProps, IDataFetcher, IDataMutator } from './models';
import { IToolbarItem } from '../../interfaces';
import { useShaRouting } from '../../providers/shaRouting';
import { CommonCrudHandles } from './interfaces';
import { MutateRequestOptions } from 'restful-react/dist/Mutate';

export interface IMutateOptions extends Pick<MutateRequestOptions<any, any>, 'headers'>{
  
}

export interface IGenericEditPageProps {
  id?: string;
  markup?: FormMarkup;
  fetcher: (props: UseGenericGetProps) => IDataFetcher;
  updater: (props: any) => IDataMutator;
  title?: (model: any) => string | string;
  /**
   * Used to display the statuses of the entity as well as the reference numbers
   */
  headerControls?: ReactNode | ((model: any) => ReactNode);

  /**
   * Form identifier.
   */
  formId?: FormIdentifier;

  /**
   * Form actions. Page-specific actions which can be executed from the configurable form
   */
  formActions?: IFormActions;

  /**
   * Form sections. Form-specific sections which can be rendered within the configurable form
   */
  formSections?: IFormSections;

  /**
   * ref object
   */
  pageRef?: MutableRefObject<any>;

  /**
   * A callback for when the data has been loaded
   */
  onDataLoaded?: (model: any) => void;
}

const GenericEditPage = forwardRef<CommonCrudHandles, IGenericEditPageProps>((props, forwardedRef) => {
  useImperativeHandle(forwardedRef, () => ({
    refresh() {
      fetchData();
    },
  }));

  const { loading: loading, refetch: fetchData, error: fetchError, data: serverData } = props.fetcher({
    lazy: true,
    queryParams: { id: props.id },
    requestOptions: { headers: requestHeaders() },
  });

  const [form] = Form.useForm();

  // fetch data on page load or when the id changes
  useEffect(() => {
    fetchData();
  }, [props.id]);

  useEffect(() => {
    if (props?.onDataLoaded) {
      props?.onDataLoaded(model);
    }
    if (props.pageRef) {
      props.pageRef.current = model;
    }
  }, [loading]);

  const renderTitle = () => {
    const { title } = props;

    if (title) {
      return typeof title === 'string' ? title : title(model);
    }

    return 'Edit';
  };

  const { mutate: save, loading: saving, error: savingError } = props.updater({});

  const goBack = () => {
    router?.back();
  };

  const { router } = useShaRouting();

  const toolbarItems: IToolbarItem[] = [
    {
      title: 'Save',
      icon: <SaveOutlined />,
      onClick: () => {
        form.submit();
      },
    },
    {
      title: 'Close',
      icon: <CloseOutlined />,
      onClick: () => goBack(),
    },
  ];

  const handleSubmit = values => {
    const postData = { ...values, id: model.id };

    save(postData).then(() => {
      goBack();
    });
  };

  const { formItemLayout } = useUi();

  const model = serverData?.result;

  return (
    <Spin spinning={loading || saving} tip="Please wait...">
      <MainLayout
        title={renderTitle()}
        description=""
        showHeading={!!renderTitle() || !!props.headerControls}
        toolbar={<IndexToolbar items={toolbarItems} />}
        headerControls={typeof props.headerControls === 'function' ? props.headerControls(model) : props.headerControls}
      >
        <ValidationErrors error={savingError?.data || fetchError?.data} />

        {model && (
          <ConfigurableForm
            mode="edit"
            {...formItemLayout}
            markup={props?.markup}
            form={form}
            onFinish={handleSubmit}
            formId={props.formId}
            initialValues={model}
            actions={props.formActions}
            sections={props.formSections}
          />
        )}
      </MainLayout>
    </Spin>
  );
});

export default GenericEditPage;
