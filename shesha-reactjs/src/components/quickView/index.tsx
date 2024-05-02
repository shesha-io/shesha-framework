import React, {
  FC,
  PropsWithChildren,
  useEffect,
  useMemo,
  useState
  } from 'react';
import ValidationErrors from '@/components/validationErrors';
import {
  Button,
  Form,
  notification,
  Popover,
  PopoverProps,
  Spin
  } from 'antd';
import { ConfigurableForm } from '@/components/';
import { FormItemProvider, FormMarkupWithSettings, MetadataProvider, useSheshaApplication, useUi } from '@/providers';
import { useConfigurationItemsLoader } from '@/providers/configurationItemsLoader';
import { useFormConfiguration } from '@/providers/form/api';
import { entitiesGet } from '@/apis/entities';
import { FormIdentifier } from '@/providers/form/models';
import { get } from '@/utils/fetchers';
import { getQuickViewInitialValues } from './utils';
import { useStyles } from '../entityReference/styles/styles';

export interface IQuickViewProps extends PropsWithChildren {
  /** The id or guid for the entity */
  entityId?: string;
  /** Identifier of the form to display on the modal */
  formIdentifier?: FormIdentifier;
  /** The Url that details of the entity are retreived */
  getEntityUrl?: string;
  /** The property froom the data to use as the label and title for the popover */
  displayProperty: string;
  /** Metadata properties of value */
  dataProperties?: { [key in string]: any }[];
  /** The width of the quickview */
  width?: number;

  className?: string;

  formType?: string;

  displayName?: string;

  initialFormData?: any;

  popoverProps?: PopoverProps;

  disabled?: boolean;
}

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
  dataProperties = [],
  disabled
}) => {
  const [formData, setFormData] = useState(initialFormData);
  const [formTitle, setFormTitle] = useState(displayName);
  const [formMarkup, setFormMarkup] = useState<FormMarkupWithSettings>(null);
  const { backendUrl, httpHeaders } = useSheshaApplication();
  const [form] = Form.useForm();
  const { formItemLayout } = useUi();
  const { refetch: fetchForm } = useFormConfiguration({ formId: formIdentifier, lazy: true });
  const { styles } = useStyles();

  useEffect(() => {
    if (formIdentifier) {
      fetchForm().then((response) => {
        setFormMarkup(response);
      });
    }
  }, [formIdentifier]);

  useEffect(() => {
    if (!formData && entityId && formMarkup) {
      const getUrl = getEntityUrl ?? formMarkup?.formSettings?.getUrl;
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
  }, [entityId, getEntityUrl, formMarkup]);

  const formContent = useMemo(() => {
    return formMarkup && formData ? (
      <FormItemProvider namePrefix={undefined}>
        <MetadataProvider id="dynamic" modelType={formMarkup?.formSettings.modelType}>
          <ConfigurableForm
            mode="readonly"
            {...formItemLayout}
            markup={formMarkup}
            form={form}
            initialValues={getQuickViewInitialValues(formData, dataProperties)}
            skipFetchData={true}
          />
        </MetadataProvider>
      </FormItemProvider>
    ) : (
      <></>
    );
  }, [formMarkup, formData, dataProperties]);

  const render = () => {
    if (children) {
      return <>{children}</>;
    }

    return (
      <Button className={styles.entityReferenceBtn} type="link">
        {formTitle ?? (
          <span>
            <Spin size="small" /> Loading...
          </span>
        )}
      </Button>
    );
  };

  if (disabled)
   return (
    <Button className={styles.entityReferenceBtn} disabled type="link">
      {formTitle}
      </Button>
      );

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

export const GenericQuickView: FC<IQuickViewProps> = (props) => {
  const { getEntityFormId } = useConfigurationItemsLoader();
  const [formConfig, setFormConfig] = useState<FormIdentifier>(props.formIdentifier);

  useEffect(() => {
    if (props.className && !formConfig)
      getEntityFormId(props.className, props.formType ?? 'Quickview').then((f) => {
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

export default QuickView;
