import moment from 'moment';
import React, { FC, useEffect, useMemo, useState } from 'react';
import { get } from '@/utils/fetchers';
import { Button, App, Spin } from 'antd';
import { entitiesGet } from '@/apis/entities';
import { GenericQuickView } from '@/components/quickView';
import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { IKeyValue } from '@/interfaces/keyValue';
import { ShaIcon, ShaLink, ValidationErrors } from '@/components';
import { StandardNodeTypes } from '@/interfaces/formComponent';
import { useConfigurationItemsLoader } from '@/providers/configurationItemsLoader';
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
import { useStyles } from './styles/styles';
import { isPropertiesArray } from '@/interfaces/metadata';
import { ModalFooterButtons } from '@/providers/dynamicModal/models';
import { getStyle, useAvailableConstantsData } from '@/providers/form/utils';
import { getFormApi } from '@/providers/form/formApi';
import { ShaIconTypes } from '../iconPicker';

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
  quickviewWidth?: number;

  // Dialog properties
  modalTitle?: string;
  showModalFooter?: boolean;
  additionalProperties?: IKeyValue[];
  modalWidth?: number | string;
  customWidth?: number;
  widthUnits?: '%' | 'px';
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
  style?: string;
  displayType?: 'textTitle' | 'icon' | 'displayProperty';
  iconName?: ShaIconTypes;
  textTitle?: string;
}

export const EntityReference: FC<IEntityReferenceProps> = (props) => {
  const { executeAction } = useConfigurableActionDispatcher();
  const { globalState } = useGlobalState();
  const { styles } = useStyles();
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
  const [property, setProperty] = useState([]);

  const [displayText, setDisplayText] = useState((!props.value ? props.placeholder : props.value._displayName) ?? '');

  const entityId = props.value?.id ?? props.value;
  const entityType = props.entityType ?? props.value?._className;
  const formType = props.formType ?? (props.entityReferenceType === 'Quickview' ? 'quickview' : 'details');

  const style = getStyle(props.style, formData);

  useEffect(() => {
    if (
      !Boolean(formIdentifier) &&
      props.formSelectionMode === 'dynamic' &&
      Boolean(entityType) &&
      Boolean(formType) &&
      props.entityReferenceType !== 'Quickview'
    ) {
      getEntityFormId(entityType, formType).then((formid) => {
        setFormIdentifier({ name: formid.name, module: formid.module });
      });
    }
  }, [formIdentifier, entityType, formType]);

  useEffect(() => {
    if (entityType) {
      getMetadata({ modelType: entityType, dataType: null }).then((res) => {
        setProperty(isPropertiesArray(res?.properties) ? res.properties : []);
      });
    }
  }, [entityType]);

  useEffect(() => {
    // fetch data only for NavigateLink and Dialog mode. Quickview will fetch data later
    if (!fetched && props.entityReferenceType !== 'Quickview' && entityId) {
      //
      const queryParams = {
        id: entityId,
        properties: `id ${Boolean(props.displayProperty) ? props.displayProperty : ''}`,
      };
      const fetcher = props.getEntityUrl
        ? get(props.getEntityUrl, queryParams, { base: backendUrl, headers: httpHeaders })
        : entitiesGet({ ...queryParams, entityType: entityType }, { base: backendUrl, headers: httpHeaders });

      fetcher
        .then((resp) => {
          setDisplayText(resp.result[props.displayProperty] ?? displayText);
          setFetched(true);
        })
        .catch((reason) => {
          notification.error({ message: <ValidationErrors error={reason} renderMode="raw" /> });
        });
    }
  }, [fetched, entityId, props.entityReferenceType, props.getEntityUrl, entityType]);

  useEffect(() => {
    setFetched(false);
    if (!!props?.value?._displayName) setDisplayText(props?.value?._displayName);
  }, [entityId, entityType]);

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
          Boolean(props.additionalProperties) && props.additionalProperties?.length > 0
            ? props.additionalProperties
            : [{ key: 'id', value: '{{entityReference.id}}' }],
        modalWidth: props.modalWidth,
        customWidth: props.customWidth,
        widthUnits: props.widthUnits,
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

  const renderDisplayByType = () => {
    if (props.displayType === 'icon') return <ShaIcon iconName={props.iconName} />;

    if (props.displayType === 'textTitle') return props.textTitle;

    return displayText;
  };

  const navigationStyling = { ...style, marginTop: style?.marginTop ? style.marginTop : '3px' };

  const content = useMemo(() => {
    if (!((formIdentifier && renderDisplayByType() && entityId) || props.entityReferenceType === 'Quickview'))
      return (
        <Button className={styles.entityReferenceBtn} type="link">
          <span>
            <Spin size="small" /> Loading...
          </span>
        </Button>
      );

    if (props.disabled && props.entityReferenceType !== 'Quickview')
      return (
        <Button className={styles.entityReferenceBtn} disabled style={style} type="link">
          <ShaLink className={styles.entityReferenceBtn} linkToForm={formIdentifier} params={{ id: entityId }}>
            {renderDisplayByType()}
          </ShaLink>
        </Button>
      );

    if (props.entityReferenceType === 'NavigateLink')
      return (
        <Button className={styles.entityReferenceBtn} style={navigationStyling} type="link">
          <ShaLink className={styles.entityReferenceBtn} linkToForm={formIdentifier} params={{ id: entityId }}>
            {renderDisplayByType()}
          </ShaLink>
        </Button>
      );

    if (props.entityReferenceType === 'Quickview')
      return (
        <GenericQuickView
          displayProperty={props.displayProperty}
          displayName={displayText}
          dataProperties={property}
          entityId={props.value?.id ?? props.value}
          className={entityType}
          getEntityUrl={props.getEntityUrl}
          width={props.quickviewWidth}
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
      <Button className={styles.entityReferenceBtn} style={style} type="link" onClick={dialogExecute}>
        {renderDisplayByType()}
      </Button>
    );
  }, [formIdentifier, displayText, entityId, props.disabled, property.length]);

  if (props.formSelectionMode === 'name' && !Boolean(formIdentifier))
    return (
      <Button className={styles.entityReferenceBtn} type="link" disabled>
        Form identifier is not configured
      </Button>
    );

  if (!props.value)
    return (
      <Button className={styles.entityReferenceBtn} type="link" disabled>
        {displayText}
      </Button>
    );

  return content;
};
