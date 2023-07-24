import { Button, Form, Popover, PopoverProps, Spin, notification } from 'antd';
import { entitiesGet } from 'apis/entities';
import React, { FC, PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { ConfigurableForm } from '../';
import { FormItemProvider, FormMarkupWithSettings, useSheshaApplication, useUi } from '../../providers';
import { useConfigurationItemsLoader } from '../../providers/configurationItemsLoader';
import { useFormConfiguration } from '../../providers/form/api';
import { FormIdentifier } from '../../providers/form/models';
import { get } from '../../utils/fetchers';
import ValidationErrors from '../validationErrors';

export interface IQuickViewProps extends PropsWithChildren {
  /** The id or guid for the entity */
  entityId?: string;
  /** Identifier of the form to display on the modal */
  formIdentifier?: FormIdentifier;
  /** The Url that details of the entity are retreived */
  getEntityUrl?: string;
  /** The property froom the data to use as the label and title for the popover */
  displayProperty: string;
  /** The width of the quickview */
  width?: number;

  className?: string;

  formType?: string;

  displayName?: string;

  initialFormData?: any;

  popoverProps?: PopoverProps;
}

export const GenericQuickView: FC<IQuickViewProps> = (props) => {
  const { getEntityFormId } = useConfigurationItemsLoader();
  const [formConfig, setFormConfig] = useState<FormIdentifier>(props.formIdentifier);

  useEffect(() => {
    if (props.className && !formConfig)
      getEntityFormId(props.className, props.formType ?? 'Quickview', (f) => {
        setFormConfig(f);
      });
  }, [props.className, props.formType, formConfig]);

  return formConfig ? (
    <QuickView {...props} formIdentifier={formConfig} />
  ) : (
    <Button type="link">
      <span>
        <Spin size="small" /> Loading...
      </span>
    </Button>
  );
};

const QuickView: FC<Omit<IQuickViewProps, 'formType'>> = ({
  children,
  entityId,
  className,
  formIdentifier,
  getEntityUrl,
  displayProperty,
  displayName,
  initialFormData,
  width = 600,
  popoverProps,
}) => {
  const [formData, setFormData] = useState(initialFormData);
  const [formTitle, setFormTitle] = useState(displayName);
  const [formSettings, setFormSettings] = useState<FormMarkupWithSettings>(null);
  const { backendUrl, httpHeaders } = useSheshaApplication();
  const [form] = Form.useForm();
  const { formItemLayout } = useUi();
  const { refetch: fetchForm } = useFormConfiguration({ formId: formIdentifier, lazy: true });

  useEffect(() => {
    if (formIdentifier) {
      fetchForm().then((response) => {
        setFormSettings(response);
      });
    }
  }, [formIdentifier]);

  useEffect(() => {
    if (!formData && entityId && formSettings) {
      const getUrl = getEntityUrl ?? formSettings?.formSettings?.getUrl;
      const fetcher = getUrl
        ? get(getUrl, { id: entityId }, { base: backendUrl, headers: httpHeaders })
        : entitiesGet({ id: entityId, entityType: className }, { base: backendUrl, headers: httpHeaders });
      fetcher
        .then((resp) => {
          setFormData(resp.result);
          if (resp.result[displayProperty]) setFormTitle(resp.result[displayProperty]);
        })
        .catch((reason) => {
          notification.error({ message: <ValidationErrors error={reason} renderMode="raw" /> });
        });
    }
  }, [entityId, getEntityUrl, formSettings]);

  const formContent = useMemo(() => {
    return formSettings && formData ? (
      <FormItemProvider namePrefix={undefined}>
        <ConfigurableForm
          mode="readonly"
          {...formItemLayout}
          markup={formSettings}
          form={form}
          initialValues={formData}
          skipFetchData={true}
        />
      </FormItemProvider>
      ) : (
        <></>
      );
  }, [formSettings, formData]);

  const render = () => {
    if (children) {
      return <>{children}</>;
    }

    return (
      <Button type="link">
        {formTitle ?? (
          <span>
            <Spin size="small" /> Loading...
          </span>
        )}
      </Button>
    );
  };

  return (
    <Popover
      content={<div style={{ width }}>{formContent}</div>}
      title={formTitle ?? 'Quickview not configured properly'}
      {...popoverProps}
    >
      {render()}
    </Popover>
  );
};

export default QuickView;
