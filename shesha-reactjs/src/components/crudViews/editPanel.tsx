import React, { forwardRef, MutableRefObject, ReactNode, useEffect, useImperativeHandle } from 'react';
import { MainLayout, ValidationErrors, ConfigurableForm, IndexToolbar } from '../';
import { Divider, Form, Spin } from 'antd';
import { requestHeaders } from '../../utils/requestHeaders';
import { SaveOutlined, CloseOutlined } from '@ant-design/icons';
import { useUi } from '../../providers';
import { FormMarkup, IFormActions, IFormSections } from '../../providers/form/models';
import { UseGenericGetProps, IDataFetcher, IDataMutator } from './models';
import { IToolbarItem } from '../../interfaces';
import { useShaRouting } from '../../providers/shaRouting';
import { CommonCrudHandles } from './interfaces';
import { MutateRequestOptions } from 'restful-react/dist/Mutate';
import { IGenericEditPageProps } from './editPage';

export interface IMutateOptions extends Pick<MutateRequestOptions<any, any>, 'headers'>{
  
}

const GenericEditPanel = forwardRef<CommonCrudHandles, IGenericEditPageProps>((props, forwardedRef) => {
  
  useImperativeHandle(forwardedRef, () => ({
    refresh() {
      fetchData();
    },
  }));

  const { loading: loading, refetch: fetchData, error: fetchError, data: serverData } = props.fetcher({
    lazy: true,
    requestOptions: { headers: requestHeaders() },
    queryParams: { id: props.id },
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

  /*const renderTitle = () => {
    const { title } = props;

    if (title) {
      return typeof title === 'string' ? title : title(model);
    }

    return 'Edit';
  };*/

  const { mutate: save, loading: saving, error: savingError } = props.updater({});

  const goBack = () => {
    router?.back();
  };

  const { router } = useShaRouting(false) ?? {};

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
        <IndexToolbar items={toolbarItems} />
        <Divider />
        <ValidationErrors error={savingError?.data || fetchError?.data} />
        <Divider />
        {model && (
          <ConfigurableForm
            mode="edit"
            {...formItemLayout}
            markup={props?.markup}
            form={form}
            onFinish={handleSubmit}
            path={props?.formPath || router?.pathname}
            initialValues={model}
            actions={props.formActions}
            sections={props.formSections}
          />
        )}
    </Spin>
  );
});

export default GenericEditPanel;
