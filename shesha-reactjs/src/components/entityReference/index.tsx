import { entitiesGet } from '@/apis/entities';
import { ShaIcon, ShaLink, ValidationErrors } from '@/components';
import { GenericQuickView } from '@/components/quickView';
import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { StandardNodeTypes } from '@/interfaces/formComponent';
import { IKeyValue } from '@/interfaces/keyValue';
import { isPropertiesArray } from '@/interfaces/metadata';
import {
  ButtonGroupItemProps,
  FormIdentifier,
  useConfigurableActionDispatcher,
  useForm,
  useGlobalState,
  useHttpClient,
  useMetadataDispatcher,
  useSheshaApplication,
} from '@/providers';
import { useConfigurationItemsLoader } from '@/providers/configurationItemsLoader';
import { ModalFooterButtons } from '@/providers/dynamicModal/models';
import { getFormApi } from '@/providers/form/formApi';
import { useAvailableConstantsData } from '@/providers/form/utils';
import { get } from '@/utils/fetchers';
import { App, Button, Spin } from 'antd';
import moment from 'moment';
import React, { CSSProperties, FC, useEffect, useMemo, useState } from 'react';
import { ShaIconTypes } from '../iconPicker';
import { addPx } from '@/utils/style';
import { useStyles } from './styles/styles';

export type EntityReferenceTypes = 'NavigateLink' | 'Quickview' | 'Dialog';

export interface IEntityReferenceProps {
  // common properties
  entityReferenceType: EntityReferenceTypes;
  value?: any;
  disabled?: boolean;
  placeholder?: string;
  entityType?: string;
  formSelectionMode: 'name' | 'dynamic';

  /** The Url that details of the entity are retreived */
  getEntityUrl?: string;
  /** The property froom the data to use as the label and title for the popover */
  displayProperty: string;
  /** From identifier for navigate/dialog/quickview  */
  formIdentifier?: FormIdentifier;
  /** View type for navigate/dialog/quickview  */
  formType?: string;

  // Quickview properties
  quickviewWidth?: number | string;

  // Dialog properties
  modalTitle?: string;
  showModalFooter?: boolean;
  additionalProperties?: IKeyValue[];
  modalWidth?: number | string;
  footerButtons?: ModalFooterButtons;
  buttons?: ButtonGroupItemProps[];
  /**
   * If specified, the form data will not be fetched, even if the GET Url has query parameters that can be used to fetch the data.
   * This is useful in cases whereby one form is used both for create and edit mode
   */
  skipFetchData?: boolean;
  /** What http verb to use when submitting the form. Used in conjunction with `showModalFooter` */
  submitHttpVerb?: 'POST' | 'PUT';

  // Dialog action properties
  handleSuccess: boolean;
  onSuccess?: IConfigurableActionConfiguration;
  handleFail: boolean;
  onFail?: IConfigurableActionConfiguration;
  style?: CSSProperties;
  displayType?: 'textTitle' | 'icon' | 'displayProperty';
  iconName?: ShaIconTypes;
  textTitle?: string;
}

export const EntityReference: FC<IEntityReferenceProps> = (props) => {
  const { executeAction } = useConfigurableActionDispatcher();
  const { globalState } = useGlobalState();
  const { notification, message } = App.useApp();

  const localForm = useForm(false);
  const formData = localForm?.formData;
  const formMode = localForm?.formMode;

  const { getEntityFormId } = useConfigurationItemsLoader();
  const { backendUrl, httpHeaders } = useSheshaApplication();
  const httpClient = useHttpClient();
  const { getMetadata } = useMetadataDispatcher();
  const executionContext = useAvailableConstantsData();

  const [formIdentifier, setFormIdentifier] = useState<FormIdentifier>(
    props.formSelectionMode === 'name' ? props.formIdentifier : null
  );
  const [fetched, setFetched] = useState(false);
  const [properties, setProperties] = useState([]);

  const [displayText, setDisplayText] = useState((!props.value ? props.placeholder : props.value._displayName) ?? '');

  const entityId = props.value?.id ?? props.value;
  const entityType = props.entityType ?? props.value?._className;
  const formType = props.formType ?? (props.entityReferenceType === 'Quickview' ? 'quickview' : 'details');

  const {styles, cx} = useStyles();

  useEffect(() => {

    const fetchFormId = async () => {
      if (
        props.formSelectionMode === 'dynamic' &&
        Boolean(entityType) &&
        Boolean(formType)
      ) {
        try {
          const formid = await getEntityFormId(entityType, formType);
          setFormIdentifier({ name: formid.name, module: formid.module });
        } catch (error) {
          console.error('Error fetching form ID:', error);
        }
      }
    };

    fetchFormId();
  }, [entityType, formType, props.formSelectionMode, props.entityReferenceType]);

  useEffect(() => {
    const fetchMetadata = async () => {
      if (entityType) {
        try {
          const res = await getMetadata({ modelType: entityType, dataType: null });
            setProperties(isPropertiesArray(res?.properties) ? res.properties : []);
        } catch (error) {
          console.error('Error fetching metadata:', error);
        }
      }
    };

    fetchMetadata();
  }, [entityType]);

  useEffect(() => {
    // fetch data only for NavigateLink and Dialog mode. Quickview will fetch data later
    if (!fetched && props.entityReferenceType !== 'Quickview' && entityId) {
      const queryParams = {
        id: entityId,
        properties: `id ${props.displayProperty ? props.displayProperty : ''}`,
      };
      const fetcher = props.getEntityUrl
        ? get(props.getEntityUrl, queryParams, { base: backendUrl, headers: httpHeaders })
        : entitiesGet({ ...queryParams, entityType: entityType }, { base: backendUrl, headers: httpHeaders });

      fetcher
        .then((resp) => {
          setDisplayText(resp.result[props.displayProperty] ?? displayText ?? 'No Display Name');
          setFetched(true);
        })
        .catch((reason) => {
          notification.error({ message: <ValidationErrors error={reason} renderMode="raw" /> });
        });
    }
  }, [fetched, entityId, props.entityReferenceType, props.getEntityUrl, entityType, backendUrl, displayText, httpHeaders, notification, props.displayProperty]);

  useEffect(() => {
    setFetched(false);
    if (props?.value?._displayName) setDisplayText(props?.value?._displayName);
    else setDisplayText(!props?.value ? props?.placeholder : '');
  }, [entityId, entityType, props?.placeholder, props?.value]);

  useEffect(() => {
    if (props.formIdentifier) {
      setFormIdentifier(props.formIdentifier);
    }
  }, [props.formIdentifier]);

  /* Dialog */
  const dialogExecute = (event: React.MouseEvent<HTMLElement, MouseEvent>) => {
    event.stopPropagation(); // Don't collapse the CollapsiblePanel when clicked

    const actionConfiguration: IConfigurableActionConfiguration = {
      _type: StandardNodeTypes.ConfigurableActionConfig,
      actionName: 'Show Dialog',
      actionOwner: 'shesha.common',
      handleSuccess: props.handleSuccess,
      handleFail: props.handleFail,
      onFail: props.onFail,
      onSuccess: props.onSuccess,
      actionArguments: {
        formId: formIdentifier,
        modalTitle: props.modalTitle,
        buttons: props.buttons,
        footerButtons: props?.footerButtons,
        additionalProperties:
          Boolean(props.additionalProperties) && props.additionalProperties?.length > 0 && props.additionalProperties.some(p => p.key === 'id')
            ? props.additionalProperties
            : [{ key: 'id', value: '{{entityReference.id}}' }],
        modalWidth: addPx(props.modalWidth),
        skipFetchData: props.skipFetchData ?? false,
        submitHttpVerb: props.submitHttpVerb ?? 'PUT',
      },
    };

    const evaluationContext = {
      ...executionContext,
      entityReference: { id: entityId, entity: props.value },
      data: formData,
      moment: moment,
      form: getFormApi(localForm),
      formMode: formMode,
      http: httpClient,
      message: message,
      globalState: globalState,
    };

    executeAction({
      actionConfiguration: actionConfiguration,
      argumentsEvaluationContext: evaluationContext,
    });
  };
 
  const displayTextByType = useMemo(() => {
    const displayIfNotIcon = props.displayType === 'textTitle' ? props.textTitle : displayText;

    return props.displayType === 'icon' ? (
      <ShaIcon iconName={props.iconName} style={props.style} />
    ) : displayIfNotIcon;
  }, [props.displayType, props.iconName, props.style, props.textTitle, displayText]);

  const content = useMemo(() => {
    if (!(fetched || props.entityReferenceType === 'Quickview'))
      return (
        <Button type="link" className={cx(styles.innerEntityReferenceButtonBoxStyle)} style={props.style}>
          <span className={cx(styles.innerEntityReferenceSpanBoxStyle)}>
            <Spin size="small" className={cx(styles.spin)} />
            <span className={cx(styles.inlineBlock)}>Loading...</span>
          </span>
        </Button>
      );

    if (props.disabled && props.entityReferenceType !== 'Quickview')
      return (
        <ShaLink disabled={true} linkToForm={formIdentifier} params={{ id: entityId }}>
          {displayTextByType}
        </ShaLink>
      );

    if (props.entityReferenceType === 'NavigateLink')
      return (
        <ShaLink linkToForm={formIdentifier} params={{ id: entityId }} style={props?.style}>
          {displayTextByType}
        </ShaLink>
      );

    if (props.entityReferenceType === 'Quickview')
      return (
        <GenericQuickView
          displayProperty={props.displayProperty}
          displayName={displayText}
          dataProperties={properties}
          entityId={props.value?.id ?? props.value}
          className={entityType}
          getEntityUrl={props.getEntityUrl}
          width={addPx(props.quickviewWidth)}
          formIdentifier={formIdentifier}
          formType={formType}
          disabled={props.disabled}
          style={props.style}
          displayType={props.displayType}
          iconName={props.iconName}
          textTitle={props.textTitle}
        />
      );

    return (
      <Button type="link" onClick={dialogExecute} className={cx(styles.innerEntityReferenceButtonBoxStyle)} style={props.style}>
        <span className={cx(styles.innerEntityReferenceSpanBoxStyle)}>{displayTextByType}</span>
      </Button>
    );
  }, [props.formIdentifier, displayText, entityId, props.disabled, properties.length, displayTextByType, fetched]);

  if (props.formSelectionMode === 'name' && !props.formIdentifier)
    return (
      <Button type="link" disabled className={cx(styles.innerEntityReferenceButtonBoxStyle)} style={props.style}>
        <span className={cx(styles.innerEntityReferenceSpanBoxStyle)}>Form identifier is not configured</span>
      </Button>
    );

  if (!props.value)
    return (
      <Button type="link" disabled className={cx(styles.innerEntityReferenceButtonBoxStyle)} style={props.style}>
        <span className={cx(styles.innerEntityReferenceSpanBoxStyle)}>{displayText}</span>
      </Button>
    );

  return content;
};
