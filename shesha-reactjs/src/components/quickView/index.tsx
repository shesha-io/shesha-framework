import { entitiesGet } from '@/apis/entities';
import { ConfigurableForm, ShaIcon } from '@/components/';
import ValidationErrors from '@/components/validationErrors';
import { FormItemProvider, FormMarkupWithSettings, MetadataProvider, useSheshaApplication } from '@/providers';
import { useConfigurationItemsLoader } from '@/providers/configurationItemsLoader';
import { useFormConfiguration } from '@/providers/form/api';
import { FormIdentifier } from '@/providers/form/models';
import ParentProvider from '@/providers/parentProvider';
import { get } from '@/utils/fetchers';
import { capPercentageWidth } from '@/utils/style';
import { App, Button, Popover, PopoverProps } from 'antd';
import React, { CSSProperties, FC, PropsWithChildren, ReactNode, useEffect, useMemo, useState } from 'react';
import { ShaIconTypes } from '../iconPicker';
import { formItemLayout, getQuickViewInitialValues, loadingBox } from './utils';
import { useStyles } from './styles/styles';
import { IPropertyMetadata } from '@/interfaces/metadata';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';
import { getEntityTypeIdentifierQueryParams, isEntityTypeIdEmpty } from '@/providers/metadataDispatcher/entities/utils';

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
  dataProperties?: IPropertyMetadata[];
  /** The width of the quickview */
  width?: number | string;

  entityType?: string | IEntityTypeIdentifier;

  formType?: string;

  displayName?: string;

  initialFormData?: any;

  /** Form arguments passed to ConfigurableForm for data loading (e.g., {id: entityId}) */
  formArguments?: Record<string, unknown>;

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
  entityType,
  formIdentifier,
  getEntityUrl,
  displayProperty,
  displayName,
  initialFormData,
  formArguments,
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
  // Cap width at 98% if it's a percentage value
  const cappedWidth = useMemo(() => capPercentageWidth(width), [width]);
  const [loadingState, setLoadingState] = useState<'loading' | 'error' | 'success'>('loading');
  const [formData, setFormData] = useState(initialFormData);
  const [formTitle, setFormTitle] = useState(displayName);
  const [formMarkup, setFormMarkup] = useState<FormMarkupWithSettings>(null);
  const { backendUrl, httpHeaders } = useSheshaApplication();
  const { refetch: fetchForm } = useFormConfiguration({ formId: formIdentifier, lazy: true });
  const { notification } = App.useApp();
  const { styles } = useStyles();

  // Sync formTitle with displayName prop
  useEffect(() => {
    if (displayName) {
      setFormTitle(displayName);
    }
  }, [displayName]);

  useEffect(() => {
    // Skip markup fetch when using formArguments - the ConfigurableForm will handle loading via formId
    if (formArguments) {
      return;
    }

    // Only fetch markup for backward compatibility when not using formArguments
    if (formIdentifier) {
      fetchForm()
        .then((response) => {
          if (response) setFormMarkup(response);
          else setLoadingState('error');
        })
        .catch(() => {
          setLoadingState('error');
        });
      setLoadingState('loading');
    }
  }, [formIdentifier, formArguments]);

  // When using formArguments, the form's data loader will handle data fetching
  // Only use manual data fetching logic if formArguments is not provided (backward compatibility)
  useEffect(() => {
    if (formArguments && formIdentifier) {
      // When using formArguments, let the form handle loading via its data loader
      // But only after we have the formIdentifier
      setLoadingState('success');
    } else if (formArguments && formIdentifier === null) {
      // Dynamic form id resolution failed
      setLoadingState('error');
    } else if (!formArguments && !formData && entityId && formMarkup) {
      // Fallback to manual data fetching for backward compatibility
      const getUrl = getEntityUrl ?? formMarkup?.formSettings?.getUrl;

      // If no GET URL is available, show form without data
      if (!getUrl && !getEntityUrl) {
        setLoadingState('success');
        return;
      }

      const fetcher = getUrl
        ? get(getUrl, { id: entityId }, { base: backendUrl, headers: httpHeaders })
        : entitiesGet({ id: entityId, ...getEntityTypeIdentifierQueryParams(entityType) }, { base: backendUrl, headers: httpHeaders });
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
      setLoadingState('loading');
    } else if (!formArguments && formMarkup && !entityId) {
      // Form is loaded but no entityId - show form without data
      setLoadingState('success');
    }
  }, [entityId, getEntityUrl, formMarkup, formArguments, backendUrl, httpHeaders, entityType, displayProperty, notification, formIdentifier]);

  const formContent = useMemo(() => {
    // When using formArguments, require formIdentifier (data will be loaded by form's data loader)
    // When not using formArguments, require formMarkup (formData is optional for empty forms)
    const canRenderForm = formArguments ? formIdentifier : formMarkup;

    return canRenderForm ? (
      <div className={styles.formLabel}>
        <FormItemProvider namePrefix={undefined}>
          <MetadataProvider id="dynamic" modelType={formArguments ? entityType : formMarkup?.formSettings.modelType}>
            <ParentProvider
              formMode="readonly"
              model={{ editMode: 'readOnly', readOnly: true } /* force readonly to show popup dialog always read only */}
            >
              <ConfigurableForm
                mode="readonly"
                {...formItemLayout}
                // Use formId when available to enable proper data loading (same as dialog mode)
                formId={formArguments ? formIdentifier : undefined}
                // Fall back to markup when not using formArguments (backward compatibility)
                markup={formArguments ? undefined : formMarkup}
                // Use formArguments to enable form's data loader (same as dialog mode)
                formArguments={formArguments}
                // Only use initialValues when formArguments is not provided (backward compatibility)
                initialValues={formArguments ? undefined : getQuickViewInitialValues(formData, dataProperties)}
              />
            </ParentProvider>
          </MetadataProvider>
        </FormItemProvider>
      </div>
    ) : (
      <></>
    );
  }, [formMarkup, formData, dataProperties, formArguments, formIdentifier, entityType, styles.formLabel]);

  const render = (): ReactNode => {
    if (children) {
      return <div className={styles.innerEntityReferenceButtonBoxStyle}>{children}</div>;
    }

    if (displayType === 'icon') {
      return (
        <Button type="link" className={styles.innerEntityReferenceButtonBoxStyle} style={style}>
          <ShaIcon iconName={iconName} />
        </Button>
      );
    }

    if (displayType === 'textTitle') {
      return (
        <Button type="link" className={styles.innerEntityReferenceButtonBoxStyle} style={style}>
          {textTitle ? (
            <span className={styles.innerEntityReferenceSpanBoxStyle}>{textTitle}</span>
          ) : (
            <>
              {loadingBox(styles)}
            </>
          )}
        </Button>
      );
    }

    const ifLoadingStateSuccess = (): ReactNode => {
      if (loadingState === 'success') {
        return <span className={styles.innerEntityReferenceSpanBoxStyle}>{formTitle || displayName || emptyText}</span>;
      }
      if (loadingState === 'error') {
        return <span className={styles.innerEntityReferenceSpanBoxStyle}>Quickview not configured properly</span>;
      }
      return null;
    };

    return (
      <Button type="link" className={styles.innerEntityReferenceButtonBoxStyle} style={style}>
        {loadingState === 'loading' ? (
          <>
            {loadingBox(styles)}
          </>
        ) : ifLoadingStateSuccess()}
      </Button>
    );
  };

  if (disabled)
    return (
      <Button disabled type="link" className={styles.innerEntityReferenceButtonBoxStyle} style={style}>
        <span className={styles.innerEntityReferenceSpanBoxStyle}>{formTitle || emptyText}</span>
      </Button>
    );

  const title = loadingState === 'error' ? 'Quickview not configured properly' : formTitle;

  return (
    <Popover
      styles={{
        root: typeof cappedWidth === 'string' && /%$/.test(cappedWidth as string) ? { width: cappedWidth } : undefined,
        body: typeof cappedWidth === 'string' && /%$/.test(cappedWidth as string)
          ? { width: '100%', maxHeight: '80vh', overflowY: 'auto', overflowX: 'auto' }
          : { width: cappedWidth, minWidth: cappedWidth, maxHeight: '80vh', overflowY: 'auto', overflowX: 'auto' },
      }}
      content={formContent}
      title={(
        <div
          style={{
            width: typeof cappedWidth === 'string' && /%$/.test(cappedWidth) ? '100%' : (cappedWidth as number | string),
            textOverflow: 'ellipsis',
            overflow: 'hidden',
            whiteSpace: 'nowrap',
          }}
        >
          {title}
        </div>
      )}
      {...popoverProps}
    >
      {render()}
    </Popover>
  );
};

export const GenericQuickView: FC<IQuickViewProps> = (props) => {
  const { getEntityFormIdAsync } = useConfigurationItemsLoader();
  const [formConfig, setFormConfig] = useState<FormIdentifier>(undefined);
  const { styles } = useStyles();

  useEffect(() => {
    // If formIdentifier is provided directly, use it
    if (props.formIdentifier) {
      setFormConfig(props.formIdentifier);
    } else if (!isEntityTypeIdEmpty(props.entityType) && props.formType) {
      // Otherwise, fetch form ID dynamically using className and formType
      getEntityFormIdAsync(props.entityType, props.formType)
        .then((f) => {
          setFormConfig(f);
        })
        .catch(() => {
          setFormConfig(null);
        });
    }
  }, [props.formIdentifier, props.entityType, props.formType, getEntityFormIdAsync]);

  // Show loading while formConfig is being fetched (undefined)
  // Show error message only when formConfig fetch explicitly failed (null)
  // Don't render anything if we can render the actual QuickView
  if (formConfig === undefined) {
    return (
      <Button type="link" className={styles.innerEntityReferenceButtonBoxStyle} style={props.style}>
        {loadingBox(styles)}
      </Button>
    );
  }

  if (formConfig === null) {
    return (
      <Popover content="Quickview not configured properly" title="Quickview not configured properly"></Popover>
    );
  }

  return <QuickView {...props} formIdentifier={formConfig} />;
};

export default QuickView;
