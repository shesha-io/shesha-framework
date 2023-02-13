import React, { forwardRef, MutableRefObject, useEffect, useImperativeHandle } from 'react';
import { ValidationErrors, ConfigurableForm, Show } from '..';
import { Form } from 'antd';
import { requestHeaders } from '../../utils/requestHeaders';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { useUi } from '../../providers';
import { FormIdentifier, FormMarkup, IFormActions, IFormSections } from '../../providers/form/models';
import { UseGenericGetProps, IDataFetcher, IDataMutator } from './models';
import { IToolbarItem } from '../../interfaces';
import { useShaRouting } from '../../providers/shaRouting';
import { CommonCrudHandles } from './interfaces';
import Page, { IPageProps } from '../page';

export interface IGenericEditPageProps extends Omit<IPageProps, 'title'> {
  id?: string;

  markup?: FormMarkup;

  fetcher: (props: UseGenericGetProps) => IDataFetcher;

  updater: (props: any) => IDataMutator;

  title?: (model: any) => string | string;

  loading?: boolean;
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

const GenericEditPagePlain = forwardRef<CommonCrudHandles, IGenericEditPageProps>((props, forwardedRef) => {
  useImperativeHandle(forwardedRef, () => ({
    refresh() {
      fetchData();
    },
  }));

  const {
    id,
    markup,
    ogImage,
    fetcher: useFetcher,
    updater: useUpdater,
    title,
    loading,
    formId,
    formActions,
    formSections,
    pageRef,
    onDataLoaded,
    toolbarItems,
    backUrl,
    breadcrumbItems,
    headerTagList,
    loadingText,
  } = props;

  const { loading: isFetchingData, refetch: fetchData, error: fetchError, data: serverData } = useFetcher({
    lazy: true,
    requestOptions: { headers: requestHeaders() },
    queryParams: { id: props.id },
  });

  const [form] = Form.useForm();

  // fetch data on page load or when the id changes
  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    if (onDataLoaded) {
      onDataLoaded(model);
    }
    if (pageRef) {
      pageRef.current = model;
    }
  }, [isFetchingData]);

  const renderTitle = () => {
    if (title) {
      return typeof title === 'string' ? title : title(model);
    }

    return 'Edit';
  };

  const { mutate: save, loading: saving, error: savingError } = useUpdater({});

  const goBack = () => {
    router?.back();
  };

  const { router } = useShaRouting();

  const localToolbarItems: IToolbarItem[] = [
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
    <Page
      title={renderTitle()}
      toolbarItems={[...localToolbarItems, ...(toolbarItems || [])]}
      backUrl={backUrl}
      ogImage={ogImage}
      headerTagList={headerTagList}
      breadcrumbItems={breadcrumbItems}
      loading={isFetchingData || saving || loading}
      loadingText={loadingText}
    >
      <ValidationErrors error={savingError?.data || fetchError?.data} />

      <Show when={!!model}>
        <ConfigurableForm
          mode="edit"
          {...formItemLayout}
          markup={markup}
          form={form}
          onFinish={handleSubmit}
          formId={formId}
          initialValues={model}
          actions={formActions}
          sections={formSections}
        />
      </Show>
    </Page>
  );
});

export default GenericEditPagePlain;
