import React, { useEffect, ReactNode, MutableRefObject, forwardRef, useImperativeHandle } from 'react';
import { Form, Spin } from 'antd';
import { requestHeaders } from '../../utils/requestHeaders';
import { IToolbarItem } from '../../interfaces';
import { MainLayout, IndexToolbar, ValidationErrors, ConfigurableForm } from '../';
import { useUi } from '../../providers';
import { FormIdentifier, FormMarkup, IFormActions, IFormSections } from '../../providers/form/models';
import { UseGenericGetProps, IDataFetcher } from './models';
import { CommonCrudHandles } from './interfaces';
import { DEFAULT_FILTERS, filterGenericModelData, IGenericFormFilter } from './utils';

export interface IGenericDetailsPageProps {
  /**
   * The id of an entity whose details are to be rendered
   */
  id?: string;

  /**
   * The id of the form that will be used to render the entity.
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

const GenericDetailsPage = forwardRef<CommonCrudHandles, IGenericDetailsPageProps>((props, forwardedRef) => {
  const [form] = Form.useForm();

  useImperativeHandle(forwardedRef, () => ({
    refresh() {
      fetchData();
    },
  }));

  const { loading: loading, refetch: fetchData, error: fetchError, data: serverData } = props?.fetcher({
    lazy: true,
    requestOptions: { headers: requestHeaders() },
    queryParams: { id: props?.id },
  });

  // fetch data on page load or when the id changes
  useEffect(() => {
    fetchData();
  }, [props?.id]);

  useEffect(() => {
    if (props?.formValues) {
      form.setFieldsValue(props?.formValues);
    }
  }, [props?.formValues]);

  const filters = props?.formFilters || DEFAULT_FILTERS;

  const model = (filterGenericModelData(serverData?.result, filters) as any) || {};
  const initialValues = (filterGenericModelData(props?.formValues, filters) as any) || model;

  const { formItemLayout } = useUi();

  useEffect(() => {
    if (props?.onDataLoaded) {
      props?.onDataLoaded(model);
    }
    if (props?.pageRef) {
      props.pageRef.current = model;
    }
  }, [loading]);

  const renderTitle = () => {
    const { title } = props;

    if (title) {
      return typeof title === 'string' ? title : title(model);
    }

    return 'Details';
  };

  return (
    <Spin spinning={loading} tip="Loading...">
      <MainLayout
        title={renderTitle()}
        description=""
        showHeading={!!renderTitle() || !!props?.headerControls}
        toolbar={
          props?.toolbarItems?.filter(({ hide }) => !hide)?.length ? <IndexToolbar items={props?.toolbarItems} /> : null
        }
        headerControls={
          typeof props?.headerControls === 'function' ? props?.headerControls(model) : props?.headerControls
        }
      >
        <ValidationErrors error={fetchError?.data} />
        {model && (
          <>
            <ConfigurableForm
              mode="readonly"
              {...formItemLayout}
              form={form}
              formId={props?.formId}
              markup={props?.markup}
              initialValues={initialValues}
              actions={props?.formActions}
              sections={props?.formSections}
              onValuesChange={props?.onFormValuesChange}
            />
            {typeof props?.footer === 'function' ? props?.footer(model) : props?.footer}
          </>
        )}
      </MainLayout>
    </Spin>
  );
});

export type DetailsPageHandleRefType = React.ElementRef<typeof GenericDetailsPage>;

export default GenericDetailsPage;
