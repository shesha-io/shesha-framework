import {
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useReducer,
  useRef,
  useState,
} from 'react';
import { App, ColProps } from 'antd';
import {
  componentsFlatStructureToTree,
  componentsTreeToFlatStructure,
  upgradeComponents,
  useApplicationContextData,
} from '@/providers/form/utils';
import { DEFAULT_FORM_SETTINGS, IFormDto } from '../form/models';
import { GetDataError, useActualContextExecution, useDeepCompareMemo } from '@/hooks';
import { ISubFormProviderProps } from './interfaces';
import { StandardEntityActions } from '@/interfaces/metadata';
import { ISubFormActionsContext, ISubFormStateContext, SUB_FORM_CONTEXT_INITIAL_STATE, SubFormActionsContext, SubFormContext } from './contexts';
import { subFormReducer } from './reducer';
import { ConditionalMetadataProvider, IConfigurableFormComponent, isConfigurableFormComponent, useHttpClient } from '@/providers';
import { useConfigurableAction } from '@/providers/configurableActionsDispatcher';
import { useConfigurationItemsLoader } from '@/providers/configurationItemsLoader';
import { useDebouncedCallback } from 'use-debounce';
import { useDeepCompareEffect } from '@/hooks/useDeepCompareEffect';
import { useForm } from '@/providers/form';
import { UseFormConfigurationArgs } from '../form/api';
import { useFormDesignerComponents } from '@/providers/form/hooks';
import { useGlobalState } from '@/providers/globalState';
import { useModelApiHelper } from '@/components/configurableForm/useActionEndpoint';
import {
  IPersistedFormPropsWithComponents,
  fetchDataErrorAction,
  fetchDataRequestAction,
  fetchDataSuccessAction,
  setMarkupWithSettingsAction,
} from './actions';
import ParentProvider, { useParentOrUndefined } from '../parentProvider/index';
import { IFormApi } from '../form/formApi';
import { ISetFormDataPayload } from '../form/contexts';
import { deepMergeValues, setValueByPropertyName } from '@/utils/object';
import { AxiosResponse } from 'axios';
import { ConfigurableItemIdentifier, configurableItemIdentifierToString, isConfigurableItemFullName } from '@/interfaces/configurableItems';
import { IErrorInfo } from '@/interfaces/errorInfo';
import { extractAjaxResponse, IAjaxResponse, IAjaxResponseBase } from '@/interfaces/ajaxResponse';
import { getEntityTypeIdentifierQueryParams, getEntityTypeName, isEntityTypeIdEqual, isEntityTypeIdentifier } from '../metadataDispatcher/entities/utils';
import { IEntityTypeIdentifier } from '../sheshaApplication/publicApi/entities/models';
import { IEntity, IGenericGetPayload } from '@/interfaces/gql';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { buildUrl } from '@/utils';
import { getClassNameOrUndefined, getIdOrUndefined } from '@/utils/entity';
import { IGlobalState } from '../globalState/contexts';
import { MessageInstance } from 'antd/es/message/interface';
import { useDataContextManagerActionsOrUndefined } from '../dataContextManager/hooks';
import { throwError } from '@/utils/errors';
import { useComponentApi } from '../componentApi/provider';
import { SubFormApi } from '@/componentsApi/componentApi';
import { useEffectOnce } from 'react-use';

import apiCode from "../../componentsApi/componentApi.ts?raw";

interface IFormLoadingState {
  isLoading: boolean;
  error: unknown;
}

/**
 * Identity of the form rendered in the `dynamic` selection mode. The form depends on both the entity type
 * and the form type, a change of any of them requires the form to be resolved again
 */
interface IRenderedDynamicForm {
  entityType: string | IEntityTypeIdentifier;
  formType: string | undefined;
}

const getDynamicFormCacheKey = (entityType: string | IEntityTypeIdentifier, formType: string | undefined): string =>
  `${getEntityTypeName(entityType) ?? ""}:${formType ?? ""}`;

/**
 * With no view configured `GetEntityConfigForm` derives a name by convention instead of reporting that nothing is set.
 * Recognising it is the only way to tell that apart from a configured view pointing at a missing form
 */
const isConventionDerivedFormId = (
  entityType: string | IEntityTypeIdentifier,
  formType: string | undefined,
  resolvedFormId: ConfigurableItemIdentifier,
): boolean => {
  if (!isEntityTypeIdentifier(entityType) || !isConfigurableItemFullName(resolvedFormId))
    return false;

  const conventionName = `${entityType.name}-${(formType ?? '').replace(/\s/g, '').toLowerCase()}`;
  return resolvedFormId.name.toLowerCase() === conventionName.toLowerCase();
};

/** In the `dynamic` mode the failure names a form the user never configured here, restate it as something actionable */
const describeDynamicFormLoadingError = (
  error: unknown,
  formSelectionMode: 'name' | 'dynamic' | undefined,
  entityType: string | IEntityTypeIdentifier | undefined,
  formType: string | undefined,
  resolvedFormId: ConfigurableItemIdentifier | undefined,
): unknown => {
  if (formSelectionMode !== 'dynamic' || !isDefined(entityType) || !isDefined(resolvedFormId))
    return error;

  const entityTypeName = getEntityTypeName(entityType) ?? 'unknown entity';
  const formTypeName = isNullOrWhiteSpace(formType) ? 'unknown' : formType;
  const resolvedName = configurableItemIdentifierToString(resolvedFormId);

  return isConventionDerivedFormId(entityType, formType, resolvedFormId)
    ? new Error(`No '${formTypeName}' view is configured for '${entityTypeName}'. Set it on the entity configuration, or create the form '${resolvedName}'.`)
    : new Error(`The '${formTypeName}' view of '${entityTypeName}' points to '${resolvedName}', which could not be loaded.`);
};

const EMPTY_OBJECT = {};

type OnCreatedFunction = (
  value: ISubFormProviderProps['value'],
  globalState: IGlobalState['globalState'],
  responseData: IEntity,
  message: MessageInstance,
  application: ReturnType<typeof useApplicationContextData>) => void;
type OnUpdated = (
  value: ISubFormProviderProps['value'],
  globalState: IGlobalState['globalState'],
  responseData: IEntity,
  message: MessageInstance,
) => void;

const SubFormProvider: FC<PropsWithChildren<ISubFormProviderProps>> = (props) => {
  const {
    formSelectionMode,
    formType,
    children,
    value,
    formId,
    onCreated,
    onUpdated,
    id,
    componentName,
    dataSource,
    markup,
    properties,
    propertyName,
    labelCol,
    wrapperCol,
    queryParams,
    onChange,
    defaultValue,
    entityType,
    context,
  } = props;

  const componentApi = useComponentApi();
  const parent = useParentOrUndefined();
  const httpClient = useHttpClient();

  const ctxManager = useDataContextManagerActionsOrUndefined();
  const contextId = context ? (ctxManager?.getDataContext(context)?.uid ?? context) : undefined;

  const [state, dispatch] = useReducer(subFormReducer, SUB_FORM_CONTEXT_INITIAL_STATE);
  const { message, notification } = App.useApp();

  const form = useForm();
  const { globalState } = useGlobalState();
  const appContextData = useApplicationContextData();
  // the dynamic mode resolves its own form, starting with the name-mode `formId` would fetch it before the mode effect clears it
  const [formConfig, setFormConfig] = useState<UseFormConfigurationArgs>({
    formId: formSelectionMode === 'dynamic' ? undefined : formId,
    lazy: true,
  });

  const designerComponents = useFormDesignerComponents();

  const actualQueryParams = useActualContextExecution(queryParams, undefined, EMPTY_OBJECT);
  const actualGetUrl = useActualContextExecution(props.getUrl, undefined, "");
  const actualPostUrl = useActualContextExecution(props.postUrl, undefined, "");
  const actualPutUrl = useActualContextExecution<string>(props.putUrl, undefined, "");

  var parentFormApi = parent?.formApi ?? form.shaForm.getPublicFormApi();

  const onChangeInternal = (newValue: object): void => {
    if (onChange)
      onChange(newValue);
    else
      // onChange is empty only if propertyName is not set and need to set value directly to the form data
      parentFormApi.setFieldsValue(newValue);
  };

  const onClearInternal = (): void => {
    if (onChange)
      onChange({});
    else
      parentFormApi.clearFieldsValue();
  };

  const classNameFromValue = getClassNameOrUndefined(value);
  // the designer rebuilds the component model on every render, an unstable identity here re-fires everything below
  const internalEntityType = useDeepCompareMemo(
    () => props.apiMode === 'entityName' ? entityType : classNameFromValue,
    [props.apiMode, entityType, classNameFromValue],
  );
  const prevRenderedEntityTypeForm = useRef<IRenderedDynamicForm | null>(null);

  // the "no entity type" branch below dispatches new state on every call, without this guard it loops
  const clearedForMissingEntityType = useRef(false);

  // requests of the dynamic form resolution and of the form markup are cancelled by incrementing these counters,
  // a response of the outdated request must not overwrite the state of the actual one
  const formResolutionRequestId = useRef(0);
  const markupRequestId = useRef(0);

  // the resolved form is only recorded once the request returns, this stops a re-run starting a duplicate
  const resolutionInFlightKey = useRef<string | null>(null);

  const [resolutionToken, setResolutionToken] = useState(0);

  const urlHelper = useModelApiHelper();
  const getReadUrl = (): Promise<string> => {
    if (dataSource !== 'api') return Promise.reject('`getUrl` is available only when `dataSource` = `api`');

    return !isNullOrWhiteSpace(actualGetUrl)
      ? Promise.resolve(actualGetUrl) // if getUrl is specified - evaluate value using JS
      : internalEntityType
        ? urlHelper // if entityType is specified - get default url for the entity
          .getDefaultActionUrl({ modelType: internalEntityType, actionName: StandardEntityActions.read })
          .then((endpoint) => endpoint ? endpoint.url : "")
        : Promise.resolve(''); // return empty string
  };

  const [formLoadingState, setFormLoadingState] = useState<IFormLoadingState>({ isLoading: false, error: null });

  const { getFormAsync: getForm } = useConfigurationItemsLoader();

  const { getEntityFormIdAsync } = useConfigurationItemsLoader();

  const entityTypeFormCache = useRef<Record<string, IFormDto>>({});

  useEffect(() => {
    if (formSelectionMode === 'dynamic')
      return;
    if (formConfig.formId !== formId)
      setFormConfig({ formId, lazy: true });
  }, [formId, formConfig.formId, formSelectionMode]);

  useEffect(() => {
    // A selection-mode change invalidates the previously resolved form. Reset all derived state
    // (render guard, per-entity-type cache and the resolved formConfig) so the mode-specific
    // effects re-resolve from scratch instead of racing on values left over from the other mode.
    // Without this the subform gets stuck on the previous form - or blanks out - after switching
    // between 'name' and 'dynamic' (#5087).
    prevRenderedEntityTypeForm.current = null;
    entityTypeFormCache.current = {};
    clearedForMissingEntityType.current = false;
    formResolutionRequestId.current++;
    markupRequestId.current++;
    setFormConfig({ formId: formSelectionMode === 'dynamic' ? undefined : formId, lazy: true });
    // only react to mode changes here; formId changes are handled by the sync effect above
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formSelectionMode]);

  const setMarkup = useCallback((payload: IPersistedFormPropsWithComponents): void => {
    const flatStructure = componentsTreeToFlatStructure(designerComponents, payload.components);
    upgradeComponents(designerComponents, payload.formSettings, flatStructure);
    const tree = componentsFlatStructureToTree(designerComponents, flatStructure);

    dispatch(
      setMarkupWithSettingsAction({
        ...payload,
        components: tree,
        ...flatStructure,
      }),
    );
  }, [designerComponents]);

  // drops the form resolved for the previous entity/form type, it must not stay rendered when the current one fails to resolve
  const clearResolvedForm = useCallback((): void => {
    markupRequestId.current++;
    setFormConfig((prev) => isDefined(prev.formId) ? { formId: undefined, lazy: true } : prev);
  }, []);

  // show form based on the entity type
  useEffect(() => {
    if (formSelectionMode === 'dynamic') {
      if (internalEntityType) {
        clearedForMissingEntityType.current = false;
        const renderedForm = prevRenderedEntityTypeForm.current;
        const isAlreadyRendered = isDefined(renderedForm) &&
          isEntityTypeIdEqual(internalEntityType, renderedForm.entityType) &&
          renderedForm.formType === formType;

        if (!isAlreadyRendered) {
          const currentForm: IRenderedDynamicForm = { entityType: internalEntityType, formType };
          const cachedFormDto = entityTypeFormCache.current[getDynamicFormCacheKey(internalEntityType, formType)];
          if (cachedFormDto) {
            // the markup of the previously resolved form is not needed anymore, a pending request
            // would overwrite what is rendered here
            markupRequestId.current++;
            setMarkup({
              hasFetchedConfig: true,
              id: cachedFormDto.id,
              module: cachedFormDto.module,
              name: cachedFormDto.name,
              components: cachedFormDto.markup ?? [],
              formSettings: cachedFormDto.settings ?? DEFAULT_FORM_SETTINGS,
              description: cachedFormDto.description ?? undefined,
            });
            setFormLoadingState({ isLoading: false, error: null });
            prevRenderedEntityTypeForm.current = currentForm;
          } else if (isNullOrWhiteSpace(formType)) {
            // note: throwing here unmounts the whole sub-form and the user has no way to select the form type
            clearResolvedForm();
            setFormLoadingState({
              isLoading: false,
              error: new Error("'Form Type' is required when 'Form Selection Mode' = 'Dynamic'"),
            });
          } else if (resolutionInFlightKey.current !== getDynamicFormCacheKey(internalEntityType, formType)) {
            // the counters must only advance when a request actually starts - bumping them on a pass that
            // resolves nothing discards the response already in flight, and nothing replaces it
            const requestId = ++formResolutionRequestId.current;
            markupRequestId.current++;
            const inFlightKey = getDynamicFormCacheKey(internalEntityType, formType);
            resolutionInFlightKey.current = inFlightKey;
            setFormLoadingState({ isLoading: true, error: null });
            getEntityFormIdAsync(internalEntityType, formType)
              .finally(() => {
                if (resolutionInFlightKey.current === inFlightKey)
                  resolutionInFlightKey.current = null;
              })
              .then((formid) => {
                if (formResolutionRequestId.current !== requestId)
                  return;
                setFormLoadingState({ isLoading: false, error: null });
                setFormConfig({ formId: { name: formid.name, module: formid.module ?? null }, lazy: true });
                prevRenderedEntityTypeForm.current = currentForm;
                // the markup fetch is keyed on the form id alone, a re-resolution can land on the same one
                setResolutionToken((prev) => prev + 1);
              })
              .catch((error) => {
                if (formResolutionRequestId.current !== requestId)
                  return;
                // the sub-form stays empty if the form can't be resolved, show the reason instead of failing silently.
                // the identity is stored anyway, otherwise the failed request is repeated on every re-render
                clearResolvedForm();
                prevRenderedEntityTypeForm.current = currentForm;
                setFormLoadingState({ isLoading: false, error });
              });
          }
        }
      } else if (!clearedForMissingEntityType.current) {
        // there is nothing to render without an entity type, a pending resolution must not bring the previous form back
        clearedForMissingEntityType.current = true;
        formResolutionRequestId.current++;
        clearResolvedForm();
        // note : in the `entityName` mode the entity type is part of the configuration, so its absence is the reason
        // nothing renders and must be stated. In the other modes it comes from the value and isn't known yet
        setFormLoadingState({
          isLoading: false,
          error: props.apiMode === 'entityName'
            ? new Error("'Entity Type' is required when 'Form Selection Mode' = 'Dynamic'. Bind the sub form to an entity reference property, or set the entity type explicitly.")
            : null,
        });
        setMarkup({
          hasFetchedConfig: false,
          id: undefined,
          module: undefined,
          name: undefined,
          components: [],
          formSettings: DEFAULT_FORM_SETTINGS,
          description: undefined,
        });
        prevRenderedEntityTypeForm.current = null;
      }
    }
  }, [clearResolvedForm, formSelectionMode, formType, getEntityFormIdAsync, internalEntityType, props.apiMode, setMarkup, value]);

  /**
   * Get final query params taking into account all settings
   */
  const getFinalQueryParams = (): IGenericGetPayload | undefined => {
    if (form.formMode === 'designer' || dataSource !== 'api')
      return undefined;

    const localQueryParams = typeof actualQueryParams === 'object'
      ? actualQueryParams
      : {};

    const id = getIdOrUndefined(actualQueryParams) ?? getIdOrUndefined(value) ?? "";

    const params: IGenericGetPayload = {
      ...(internalEntityType ? getEntityTypeIdentifierQueryParams(internalEntityType) : {}),
      properties: Boolean(properties)
        ? ['id', ...Array.from(new Set(Array.isArray(properties) ? properties : [properties]))].join(' ')
        : "",
      ...localQueryParams,
      id: id,
    };

    return params;
  };

  const finalQueryParams = useDeepCompareMemo(() => {
    const result = getFinalQueryParams();
    return result;
  }, [actualQueryParams, properties, internalEntityType, getIdOrUndefined(value)]); // refetch data if papameters or id changed

  // abort controller, is used to cancel out of date data requests
  const dataRequestAbortController = useRef<AbortController | null>(null);

  const fetchData = (forceFetchData: boolean = false): void => {
    if (dataSource !== 'api') {
      return;
    }

    const id = finalQueryParams?.id;

    // Skip loadng if entity with this Id is already fetched
    if (!forceFetchData && id === state.fetchedEntityId) {
      return;
    }

    // clear sub-form values and skip loading if the Id is empty
    if (isNullOrWhiteSpace(id)) {
      onClearInternal();
      dispatch(fetchDataSuccessAction({ entityId: "" }));
      return;
    }

    if (dataRequestAbortController.current) dataRequestAbortController.current.abort('out of date');

    // Skip loading if we work with entity and the `id` is not specified
    if (internalEntityType && !finalQueryParams?.id) {
      return;
    }

    // NOTE: getUrl may be null and a real URL according to the entity type or other params
    // if (!getUrl) return;

    const abortController = new AbortController();
    dataRequestAbortController.current = abortController;

    dispatch(fetchDataRequestAction());
    getReadUrl().then((getUrl) => {
      if (isNullOrWhiteSpace(getUrl)) {
        dispatch(fetchDataSuccessAction({ entityId: "" }));
        return;
      }

      const url = buildUrl(getUrl, finalQueryParams);
      httpClient.get<IAjaxResponse<IEntity>>(url, { signal: abortController.signal })
        .then((response) => {
          if (abortController.signal.aborted) return;

          dataRequestAbortController.current = null;

          const dataResponse = extractAjaxResponse(response.data);

          const classNameFromValue = getClassNameOrUndefined(value);
          const classNameFromResponse = getClassNameOrUndefined(dataResponse);

          // note: the shorthand `{ ...dataResponse, classNameFromValue }` used to add a `classNameFromValue`
          // property to the entity, it was submitted back to the server and rejected as an unknown property
          const newValue = classNameFromValue !== undefined && classNameFromResponse === undefined
            ? { ...dataResponse, _className: classNameFromValue }
            : dataResponse;
          onChangeInternal(newValue);
          dispatch(fetchDataSuccessAction({ entityId: newValue.id }));
        })
        .catch((e) => {
          onClearInternal();
          dispatch(fetchDataErrorAction({ error: e as GetDataError<unknown> })); // TODO: handle error type and extract if required
        });
    })
      .catch((e) => {
        onClearInternal();
        dispatch(fetchDataErrorAction({ error: e as GetDataError<unknown> })); // TODO: handle error type and extract if required
      });
  };

  const debouncedFetchData = useDebouncedCallback((forceFetchData: boolean) => {
    fetchData(forceFetchData);
  }, 300);

  // fetch data on first rendering and on change of some properties
  useDeepCompareEffect(() => {
    if (dataSource === 'api') fetchData();
  }, [dataSource, finalQueryParams, internalEntityType]); // TODO: memoize final getUrl and add as a dependency

  const postData = useDebouncedCallback(() => {
    if (isNullOrWhiteSpace(actualPostUrl)) {
      notification.error({
        placement: 'top',
        message: 'postUrl missing',
        description: 'Please make sure you have specified the POST URL',
      });
    } else {
      httpClient.post<IAjaxResponse<IEntity>>(actualPostUrl, value)
        .then((response) => {
          const result = extractAjaxResponse(response.data);
          onChangeInternal(result);
          if (!isNullOrWhiteSpace(onCreated)) {
            const evaluateOnCreated = (): void => {
              const func = new Function('data, globalState, submittedValue, message, application', onCreated) as OnCreatedFunction;
              func(value, globalState, result, message, appContextData);
            };

            evaluateOnCreated();
          }
        })
        .catch((error) => {
          console.error('Failed to create entity', error);
        });
    }
  }, 300);

  const putData = useDebouncedCallback(() => {
    if (!actualPutUrl) {
      notification.error({
        placement: 'top',
        message: 'putUrl missing',
        description: 'Please make sure you have specified the PUT URL',
      });
    } else {
      httpClient.put<IAjaxResponse<IEntity>>(actualPutUrl, value)
        .then((response) => {
          const result = extractAjaxResponse(response.data);
          onChangeInternal(result);
          if (onUpdated) {
            const evaluateOnUpdated = (): void => {
              const func = new Function('data, globalState, response, message', onUpdated) as OnUpdated;
              func(value, globalState, result, message);
            };

            evaluateOnUpdated();
          }
        })
        .catch((error) => {
          console.error('Failed to update entity', error);
        });
    }
  }, 300);
  //#endregion

  //#region Fetch Form
  useDeepCompareEffect(() => {
    if (formConfig.formId && !markup) {
      const requestId = ++markupRequestId.current;
      setFormLoadingState({ isLoading: true, error: null });

      getForm({ formId: formConfig.formId, skipCache: false })
        .then((response) => {
          if (markupRequestId.current !== requestId)
            return;
          setFormLoadingState({ isLoading: false, error: null });

          if (internalEntityType && formSelectionMode === 'dynamic') {
            const cacheKey = getDynamicFormCacheKey(internalEntityType, formType);
            if (!entityTypeFormCache.current[cacheKey])
              entityTypeFormCache.current[cacheKey] = response;
          }

          setMarkup({
            hasFetchedConfig: true,
            id: response.id,
            module: response.module,
            name: response.name,
            components: response.markup ?? [],
            formSettings: response.settings ?? DEFAULT_FORM_SETTINGS,
            description: response.description ?? undefined,
          });
        })
        .catch((e) => {
          if (markupRequestId.current !== requestId)
            return;
          // the form that failed to load replaces whatever was rendered before, keeping the previous one
          // shows a form that does not belong to the current selection
          setMarkup({ components: [], formSettings: DEFAULT_FORM_SETTINGS, hasFetchedConfig: false });
          setFormLoadingState({ isLoading: false, error: describeDynamicFormLoadingError(e, formSelectionMode, internalEntityType, formType, formConfig.formId) });
        });
    }

    if (!formConfig.formId) {
      // there is nothing left to fetch, a spinner left over from a cancelled request would never stop
      setFormLoadingState((prev) => prev.isLoading ? { isLoading: false, error: prev.error } : prev);

      if (markup)
        setMarkup({ ...markup, hasFetchedConfig: false });
      else
        setMarkup({ components: [], formSettings: DEFAULT_FORM_SETTINGS, hasFetchedConfig: false });
    }
  }, [formConfig.formId, markup, resolutionToken]);
  //#endregion

  const getChildComponents = (componentId: string): IConfigurableFormComponent[] => {
    const childIds = state.componentRelations[componentId];

    if (!childIds) return [];
    const components: IConfigurableFormComponent[] = [];
    childIds.forEach((childId) => {
      if (isConfigurableFormComponent(state.allComponents[childId]))
        components.push(state.allComponents[childId]);
    });
    return components;
  };

  const actionDependencies = [id];
  const actionsOwnerName = componentName ?? `subForm-${id}`;
  useConfigurableAction(
    {
      name: 'Get form data',
      owner: actionsOwnerName,
      ownerUid: id,
      hasArguments: false,
      executer: () => {
        debouncedFetchData(true); // TODO: return real promise
        return Promise.resolve();
      },
    },
    actionDependencies,
  );

  useConfigurableAction(
    {
      name: 'Post form data',
      owner: actionsOwnerName,
      ownerUid: id,
      hasArguments: false,
      executer: () => {
        postData(); // TODO: return real promise
        return Promise.resolve();
      },
    },
    actionDependencies,
  );

  useConfigurableAction(
    {
      name: 'Update form data',
      owner: actionsOwnerName,
      ownerUid: id,
      hasArguments: false,
      executer: () => {
        putData(); // TODO: return real promise
        return Promise.resolve();
      },
    },
    actionDependencies,
  );

  // register subform api

  useEffect(() => {
    componentApi?.updateApi<SubFormApi>({
      id: props.id,
      componentName: props.componentName ?? "",
      level: 3,
      typeDefinition: { typeName: 'SubFormApi', files: [{ content: apiCode, fileName: 'apis/componentApi.ts' }] },
      api: { getSubFormData: () => debouncedFetchData(true), postSubFormData: () => postData(), putSubFormData: () => putData() }, // TODO: return real promise
    });
  }, [componentApi, debouncedFetchData, postData, props.componentName, props.id, putData]);
  useEffectOnce(() => () => componentApi?.removeApi(props.id));

  //#endregion

  const getColSpan = (span: number | ColProps | undefined): ColProps | undefined => {
    if (!isDefined(span)) return undefined;

    return typeof span === 'number' ? { span } : span;
  };

  const getSubFormData = (): object => {
    const data = parentFormApi.getFormData?.();
    return !isNullOrWhiteSpace(props.propertyName) && isDefined(data)
      ? (data as Record<string, unknown>)[props.propertyName] as object
      : data ?? {};
  };

  const subFormApi: IFormApi = {
    addDelayedUpdateData: (data: object) => {
      return parentFormApi.addDelayedUpdateData(data);
    },
    setFieldValue: (name, value) => {
      onChangeInternal(deepMergeValues(getSubFormData(), setValueByPropertyName({}, name, value)));
    },
    setFieldsValue: (values) => {
      onChangeInternal(deepMergeValues(getSubFormData(), values));
    },
    clearFieldsValue: () => {
      onChangeInternal({});
    },
    submit: function (): void {
      parentFormApi.submit();
    },
    setFormData: function (payload: ISetFormDataPayload): void {
      if (payload.mergeValues) {
        onChangeInternal(deepMergeValues(value ?? {}, payload.values));
      } else {
        onChangeInternal(payload.values);
      }
    },
    getFormData: function (): object {
      return getSubFormData();
    },
    setValidationErrors: function (payload: string | IErrorInfo | IAjaxResponseBase | AxiosResponse<IAjaxResponseBase> | Error): void {
      parentFormApi.setValidationErrors(payload);
    },
    formSettings: parentFormApi.formSettings,
    formMode: parentFormApi.formMode,
    data: isDefined(parentFormApi.data) && !isNullOrWhiteSpace(props.propertyName)
      ? (parentFormApi.data as Record<string, unknown>)[props.propertyName] as object
      : {},
    defaultApiEndpoints: parentFormApi.defaultApiEndpoints,
    context: {},
    components: {},
  };

  return (
    <SubFormContext.Provider
      value={{
        ...state,
        initialValues: value,
        errors: {
          ...state.errors,
          getForm: formLoadingState.error,
        },
        loading: {
          ...state.loading,
          getForm: formLoadingState.isLoading,
        },
        components: state.components,
        formSettings: {
          ...(state.formSettings ?? DEFAULT_FORM_SETTINGS),
          labelCol: getColSpan(labelCol) ?? getColSpan(state.formSettings?.labelCol) ?? DEFAULT_FORM_SETTINGS.labelCol,
          wrapperCol: getColSpan(wrapperCol) ?? getColSpan(state.formSettings?.wrapperCol) ?? DEFAULT_FORM_SETTINGS.wrapperCol, // Override with the incoming one
        },
        propertyName,
        value: value || defaultValue,
        context: contextId,
      }}
    >
      <SubFormActionsContext.Provider
        value={{
          getData: () => debouncedFetchData(false),
          postData,
          putData,
          getChildComponents,
        }}
      >
        <ConditionalMetadataProvider modelType={state.formSettings?.modelType}>
          <ParentProvider
            model={props}
            context={contextId}
            isScope
            name={`SubForm ${componentName || (formId ? configurableItemIdentifierToString(formId) : "")}`}
            formApi={subFormApi}
            formFlatMarkup={{ allComponents: state.allComponents, componentRelations: state.componentRelations }}
          >
            {children}
          </ParentProvider>
        </ConditionalMetadataProvider>
      </SubFormActionsContext.Provider>
    </SubFormContext.Provider>
  );
};

function useSubFormState(require: boolean): ISubFormStateContext | undefined {
  const context = useContext(SubFormContext);

  if (context === undefined && require) {
    throw new Error('useSubFormState must be used within a SubFormProvider');
  }

  return context;
}

function useSubFormActions(require: boolean): ISubFormActionsContext | undefined {
  const context = useContext(SubFormActionsContext);

  if (context === undefined && require) {
    throw new Error('useSubFormActions must be used within a SubFormProvider');
  }

  return context;
}

const useSubFormOrUndefined = (): (ISubFormStateContext & ISubFormActionsContext) | undefined => {
  const actionsContext = useSubFormActions(false);
  const stateContext = useSubFormState(false);

  return actionsContext !== undefined && stateContext !== undefined
    ? { ...actionsContext, ...stateContext }
    : undefined;
};

const useSubForm = (): ISubFormStateContext & ISubFormActionsContext => useSubFormOrUndefined() ?? throwError("useSubForm must be used within a SubFormProvider");

export { SubFormProvider, useSubFormOrUndefined, useSubForm, useSubFormActions, useSubFormState };
