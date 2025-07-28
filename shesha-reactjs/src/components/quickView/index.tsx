import { entitiesGet } from '@/apis/entities';
import { ConfigurableForm, ShaIcon } from '@/components/';
import ValidationErrors from '@/components/validationErrors';
import { FormItemProvider, FormMarkupWithSettings, MetadataProvider, useSheshaApplication } from '@/providers';
import { useConfigurationItemsLoader } from '@/providers/configurationItemsLoader';
import { useFormConfiguration } from '@/providers/form/api';
import { FormIdentifier } from '@/providers/form/models';
import ParentProvider from '@/providers/parentProvider';
import { get } from '@/utils/fetchers';
import { App, Button, Popover, PopoverProps } from 'antd';
import React, { CSSProperties, FC, PropsWithChildren, useEffect, useMemo, useState } from 'react';
import { ShaIconTypes } from '../iconPicker';
import { formItemLayout, getQuickViewInitialValues, loadingBox } from './utils';
import { useStyles } from './styles/styles';

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
  width?: number | string;

  className?: string;

  formType?: string;

  displayName?: string;

  initialFormData?: any;

  popoverProps?: PopoverProps;

  disabled?: boolean;
  style?: CSSProperties;
  displayType?: 'textTitle' | 'icon' | 'displayProperty';
  iconName?: ShaIconTypes;
  textTitle?: string;
  emptyText?: string;
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
  width = 400,
  popoverProps,
  dataProperties = [],
  disabled,
  style,
  displayType,
  iconName,
  textTitle,
  emptyText = 'No Display Name',
}) => {
  const [loadingState, setLoadingState] = useState<'loading' | 'error' | 'success'>('loading');
  const [formData, setFormData] = useState(initialFormData);
  const [formTitle, setFormTitle] = useState(displayName);
  const [formMarkup, setFormMarkup] = useState<FormMarkupWithSettings>(null);
  const { backendUrl, httpHeaders } = useSheshaApplication();
  const { refetch: fetchForm } = useFormConfiguration({ formId: formIdentifier, lazy: true });
  const { notification } = App.useApp();
  const {styles, cx} = useStyles();

  useEffect(() => {
    if (formIdentifier) {
      fetchForm()
        .then((response) => {
          if (response) setFormMarkup(response);
          else setLoadingState('error');
        })
        .catch(() => {
          setLoadingState('error');
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
          setLoadingState('success');
          if (resp.result[displayProperty]) setFormTitle(resp.result[displayProperty]);
        })
        .catch((reason) => {
          setLoadingState('error');
          notification.error({ message: <ValidationErrors error={reason} renderMode="raw" /> });
        });
    }
  }, [entityId, getEntityUrl, formMarkup]);

  const formContent = useMemo(() => {
    return formMarkup && formData ? (
      <FormItemProvider namePrefix={undefined}>
        <MetadataProvider id="dynamic" modelType={formMarkup?.formSettings.modelType}>
          <ParentProvider
            formMode="readonly"
            model={{ editMode: 'readOnly', readOnly: true } /* force readonly to show popup dialog always read only */}
          >
            <ConfigurableForm
              mode="readonly"
              {...formItemLayout}
              markup={formMarkup}
              initialValues={getQuickViewInitialValues(formData, dataProperties)}
            />
          </ParentProvider>
        </MetadataProvider>
      </FormItemProvider>
    ) : (
      <></>
    );
  }, [formMarkup, formData, dataProperties]);

  const render = () => {
    if (children) {
      return <div className={cx(styles.innerEntityReferenceButtonBoxStyle)}>{children}</div>;
    }

    if (displayType === 'icon') {
      return (
        <Button type="link" className={cx(styles.innerEntityReferenceButtonBoxStyle)} style={style}>
          <ShaIcon iconName={iconName} />
        </Button>
      );
    }

    if (displayType === 'textTitle') {
      return (
        <Button type="link" className={cx(styles.innerEntityReferenceButtonBoxStyle)} style={style}>
          {textTitle ? (
            <span className={cx(styles.innerEntityReferenceSpanBoxStyle)}>{textTitle}</span>
          ) : (
            <>
              {loadingBox(cx, styles)}
            </>
          )}
        </Button>
      );
    }

    const ifLoadingStateSuccess = () => loadingState === 'success' ? (
      <span className={cx(styles.innerEntityReferenceSpanBoxStyle)}>{formTitle || emptyText}</span>
    ) : (
      <span className={cx(styles.innerEntityReferenceSpanBoxStyle)}>Quickview not configured properly</span>
    );

    return (
      <Button type="link" className={cx(styles.innerEntityReferenceButtonBoxStyle)} style={style}>
        {loadingState === 'loading' ? (
          <>
            {loadingBox(cx, styles)}
          </>
        ) : ifLoadingStateSuccess()}
      </Button>
    );
  };

  if (disabled)
    return (
      <Button disabled type="link" className={cx(styles.innerEntityReferenceButtonBoxStyle)} style={style}>
        <span className={cx(styles.innerEntityReferenceSpanBoxStyle)}>{formTitle || emptyText}</span>
      </Button>
    );

  const title = loadingState === 'error' ? 'Quickview not configured properly' : formTitle;
  return (
    <Popover
      overlayInnerStyle={{ width, minWidth: width, maxHeight: '80vh', overflowY: 'auto', overflowX: 'auto' }}
      content={formContent}
      title={<div style={{ width, textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{title}</div>}
      {...popoverProps}
    >
      {render()}
    </Popover>
  );
};

export const GenericQuickView: FC<IQuickViewProps> = (props) => {
  const { getEntityFormId } = useConfigurationItemsLoader();
  const [formConfig, setFormConfig] = useState<FormIdentifier>(props.formIdentifier ?? undefined);
  const {styles, cx} = useStyles();

  useEffect(() => {
    if (props.className && !formConfig)
      getEntityFormId(props.className, props.formType ?? 'Quickview')
        .then((f) => {
          setFormConfig(f);
        })
        .catch(() => {
          setFormConfig(null);
        });
  }, [props.className, props.formType, formConfig]);

  const buttonOrPopover = formConfig === undefined ? (
    <Button type="link" className={cx(styles.innerEntityReferenceButtonBoxStyle)} style={props.style}>
      {loadingBox(cx, styles)}
    </Button>
  ) : (
    <Popover content={'Quickview not configured properly'} title="Quickview not configured properly"></Popover>
  );

  return formConfig ? <QuickView {...props} formIdentifier={formConfig} /> : buttonOrPopover;
};

export default QuickView;
