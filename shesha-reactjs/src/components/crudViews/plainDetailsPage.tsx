import React, { useEffect, ReactNode, MutableRefObject, forwardRef, useImperativeHandle } from 'react';
import { Form, Spin } from 'antd';
import { requestHeaders } from '../../utils/requestHeaders';
import { IToolbarItem } from '../../interfaces';
import { ValidationErrors, ConfigurableForm } from '..';
import { useUi } from '../../providers';
import { FormIdentifier, FormMarkup, IFormActions, IFormSections } from '../../providers/form/models';
import { UseGenericGetProps, IDataFetcher } from './models';
import { CommonCrudHandles } from './interfaces';
import { DEFAULT_FILTERS, filterGenericModelData, IGenericFormFilter } from './utils';
import Page, { IPageProps } from '../page';

export interface IGenericDetailsPageProps extends Omit<IPageProps, 'title'> {
  /**
   * The id of an entity whose details are to be rendered
   */
  id?: string;

  /**
   * The id of the form that will be used to render the entity. If not passed, the pathname will be used as the form id
   */
  formId?: FormIdentifier;

  /**
   * A get API to be called with the id to get the details of the form
   */
  fetcher: (props: UseGenericGetProps) => IDataFetcher;

  /**
   * The form markup
   */
  markup?: FormMarkup;

  /**
   * The title of this page
   */
  title?: ((model: any) => string) | string;

  /**
   *
   */
  toolbarItems?: IToolbarItem[];

  /**
   *
   */
  footer?: ReactNode | ((model: any) => ReactNode);

  /**
   * Used to display the statuses of the entity as well as the reference numbers
   */
  headerControls?: ReactNode | ((model: any) => ReactNode);

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

  onFormValuesChange?: (changedValues: any, values: any) => void;

  /**
   * Form Values. If passed, model will be overridden to FormValues, m.
   */
  formValues?: any;

  /**
   * Handles Form Filters. Filters initial model
   */
  formFilters?: IGenericFormFilter;
}

const GenericDetailsPagePlain = forwardRef<CommonCrudHandles, IGenericDetailsPageProps>((props, forwardedRef) => {
  const [form] = Form.useForm();

  const {
    id,
    fetcher: useFetcher,
    markup,
    title,
    toolbarItems,
    formId,
    formActions,
    formSections,
    pageRef,
    onDataLoaded,
    onFormValuesChange,
    formValues,
    formFilters,
    backUrl,
    headerTagList,
    loading,
    breadcrumbItems,
    loadingText,
  } = props;

  useImperativeHandle(forwardedRef, () => ({
    refresh() {
      fetchData();
    },
  }));

  const { loading: isFetchingData, refetch: fetchData, error: fetchError, data: serverData } = useFetcher({
    lazy: true,
    requestOptions: { headers: requestHeaders() },
    queryParams: { id },
  });

  // fetch data on page load or when the id changes
  useEffect(() => {
    fetchData();
  }, [id]);

  useEffect(() => {
    if (formValues) {
      form.setFieldsValue(formValues);
    }
  }, [formValues]);

  const filters = formFilters || DEFAULT_FILTERS;

  const model = (filterGenericModelData(serverData?.result, filters) as any) || {};

  const { formItemLayout } = useUi();

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

    return 'Details';
  };

  return (
    <Spin spinning={isFetchingData} tip="Loading...">
      <Page
        title={renderTitle()}
        description=""
        toolbarItems={toolbarItems}
        backUrl={backUrl}
        headerTagList={headerTagList}
        loading={isFetchingData || loading}
        breadcrumbItems={breadcrumbItems}
        loadingText={loadingText}
      >
        <ValidationErrors error={fetchError?.data} />
        {model && (
          <>
            <ConfigurableForm
              mode="readonly"
              {...formItemLayout}
              form={form}
              formId={formId}
              markup={markup}
              initialValues={formValues || model}
              actions={formActions}
              sections={formSections}
              onValuesChange={onFormValuesChange}
            />
            {typeof props?.footer === 'function' ? props?.footer(model) : props?.footer}
          </>
        )}
      </Page>
    </Spin>
  );
});

export type DetailsPageHandleRefType = React.ElementRef<typeof GenericDetailsPagePlain>;

export default GenericDetailsPagePlain;
