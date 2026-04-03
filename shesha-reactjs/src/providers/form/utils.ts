import { updateJsSettingsForComponents } from '@/designer-components/_settings/utils';
import {
  IToolboxComponent,
  IToolboxComponentGroup,
  IToolboxComponents,
  SettingsFormMarkupFactory,
  SettingsMigrationContext,
} from '@/interfaces';
import { IPropertyMetadata } from '@/interfaces/metadata';
import {
  FormMode,
  HttpClientApi,
  IApplicationApi,
  isComponentsContainer,
  isConfigurableFormComponent,
  isObjectWithStringId,
  isRawComponentsContainer,
  STYLE_BOX_CSS_POPERTIES,
  StyleBoxValue,
  useDataTableStateOrUndefined,
  useGlobalState,
  useHttpClient,
  useMetadataDispatcher,
} from '@/providers';
import {
  IDataContextManagerActionsContext,
  IDataContextManagerFullInstance,
  IDataContextsData,
  RootContexts,
  useDataContextManagerActionsOrUndefined,
  useDataContextManagerOrUndefined,
} from '@/providers/dataContextManager';
import { IDataContextFull, useDataContextOrUndefined } from '@/providers/dataContextProvider/contexts';
import { ISelectionProps } from '@/providers/dataTable/interfaces';
import { executeFunction } from '@/utils';
import { Migrator } from '@/utils/fluentMigrator/migrator';
import { ExpressionNodeValue } from '@/utils/jsonLogic';
import { getFullPath } from '@/utils/metadata/helpers';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { deepCopyViaJson, deepMergeValues, jsonSafeParse, unsafeGetValueByPropertyName } from '@/utils/object';
import { QueryStringParams } from '@/utils/url';
import { nanoid } from '@/utils/uuid';
import { App } from 'antd';
import { MessageInstance } from 'antd/es/message/interface';
import { Rule, RuleObject } from 'antd/lib/form';
import Schema, { Rules, ValidateSource } from 'async-validator';
import camelcase from 'camelcase';
import FileSaver from 'file-saver';
import moment from 'moment';
import Mustache from 'mustache';
import { CSSProperties, useRef } from 'react';
import { IArgumentsEvaluationContext } from '../configurableActionsDispatcher/contexts';
import { SheshaCommonContexts } from '../dataContextManager/models';
import { GetShaFormDataAccessor } from '../dataContextProvider/contexts/shaDataAccessProxy';
import { ISetStatePayload } from '../globalState/contexts';
import { IParentProviderProps, useParentOrUndefined } from '../parentProvider/index';
import { IAnyObject } from './../../interfaces/anyObject';
import { IFormApi } from './formApi';
import {
  ActionParametersDictionary,
  DEFAULT_FORM_SETTINGS,
  EditMode,
  FormFullName,
  FormIdentifier,
  FormMarkup,
  FormMarkupWithSettings,
  FormRawMarkup,
  FormUid,
  IComponentsContainer,
  IConfigurableFormComponent,
  IFlatComponentsStructure,
  IFormSettings,
  IFormValidationRulesOptions,
  ROOT_COMPONENT_KEY,
} from './models';
import { isHasPropsAccessor, makeObservableProxy, ProxyPropertiesAccessors, TypedProxy } from './observableProxy';
import { useShaFormDataUpdate, useShaFormInstanceOrUndefined } from './providers/shaFormProvider';
import { IShaFormInstance } from './store/interfaces';
import { isHasDataGetter } from './touchableProperty';
import { getActualModel, getActualPropertyValue } from './utils/js-settings';
import { findToolboxComponent, getToolboxComponent } from './utils/markup';
import {
  executeExpression,
  executeScript,
  executeScriptSync,
  FunctionExecutor,
  getFunctionExecutor,
  IExpressionExecuterArguments,
  IExpressionExecuterFailedHandler,
} from './utils/scripts';
import { IMetadataDispatcher } from '../metadataDispatcher/contexts';

export {
  executeExpression, executeScript,
  // scripts
  executeScriptSync,
  // prop settings
  getActualModel,
  getActualPropertyValue, getFunctionExecutor, type FunctionExecutor,
  type IExpressionExecuterArguments,
  type IExpressionExecuterFailedHandler,
};

type MomentType = typeof moment;

/** Interface to get all avalilable data */
export interface IApplicationContext<Value extends object = object> {
  application?: IApplicationApi;
  contextManager?: IDataContextManagerFullInstance;
  metadataDispatcher?: IMetadataDispatcher;
  /** Form data */
  data?: Value | undefined;

  form?: IFormApi<Value> | undefined;
  /** Contexts datas */
  contexts: IDataContextsData | undefined;
  /** Global state */
  globalState: IAnyObject | undefined;
  /** Table selection */
  selectedRow: ISelectionProps | undefined;
  /** Moment function */
  moment: MomentType;
  /** Http Client */
  http: HttpClientApi;
  /** Message API */
  message: MessageInstance;
  /** File Saver API */
  fileSaver: typeof FileSaver;

  /** Last updated date */
  lastUpdated?: Date;

  pageContext?: IDataContextFull;
  setGlobalState: (payload: ISetStatePayload) => void;
  /**
   * Query string values. Is used for backward compatibility only
   */
  query: QueryStringParams;
  /**
   * Initial form values. Is used for backward compatibility only
   */
  initialValues?: object | undefined;
  /**
   * Parent form values. Is used for backward compatibility only
   */
  parentFormValues?: object | undefined;

  /**
   * Function for testing
   */
  test?: { getArguments: (args: Array<object> | object) => unknown[] };
}

export const isApplicationContext = (obj: object): obj is IApplicationContext => Boolean(obj) && 'data' in obj && 'contexts' in obj && 'application' in obj && 'form' in obj;

export type GetAvailableConstantsDataArgs<TValues extends object = object> = {
  topContextId?: string;
  shaForm?: IShaFormInstance<TValues>;
  queryStringGetter?: () => QueryStringParams;
};

export type AvailableConstantsContext = {
  closestShaFormApi: IFormApi | undefined;
  selectedRow?: ISelectionProps | undefined;
  dcm: IDataContextManagerActionsContext | undefined;
  metadataDispatcher: IMetadataDispatcher | undefined;
  closestContextId: string | undefined;
  globalState: IAnyObject | undefined;
  setGlobalState: (payload: ISetStatePayload) => void;
  message: MessageInstance;
  httpClient: HttpClientApi;
};


export const toBase64 = (file: Blob): Promise<string> => new Promise<string>((resolve, reject) => {
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = () => resolve(reader.result as string);
  reader.onerror = reject;
});

const useBaseAvailableConstantsContexts = (): AvailableConstantsContext => {
  const { message } = App.useApp();
  const { globalState, setState: setGlobalState } = useGlobalState();
  // get closest data context Id
  const closestContextId = useDataContextOrUndefined()?.id;
  // get selected row if exists
  const selectedRow = useDataTableStateOrUndefined()?.selectedRow;
  const httpClient = useHttpClient();

  const result: AvailableConstantsContext = {
    closestShaFormApi: undefined,
    selectedRow,
    dcm: undefined,
    metadataDispatcher: undefined,
    closestContextId,
    globalState,
    setGlobalState,
    httpClient,
    message,
  };
  return result;
};

export const useAvailableConstantsContextsNoRefresh = (): AvailableConstantsContext => {
  const baseContext = useBaseAvailableConstantsContexts();
  // get DataContext Manager
  const dcm = useDataContextManagerActionsOrUndefined();

  const parent = useParentOrUndefined();
  const metadataDispatcher = useMetadataDispatcher();
  const form = useShaFormInstanceOrUndefined();
  const closestShaFormApi = parent?.formApi ?? form?.getPublicFormApi();
  baseContext.closestShaFormApi = closestShaFormApi;
  baseContext.dcm = dcm;
  baseContext.metadataDispatcher = metadataDispatcher;
  return baseContext;
};

export const useAvailableConstantsContexts = (): AvailableConstantsContext => {
  const baseContext = useBaseAvailableConstantsContexts();
  // get DataContext Manager
  const dcm = useDataContextManagerOrUndefined();

  const metadataDispatcher = useMetadataDispatcher();

  useShaFormDataUpdate();

  const parent = useParentOrUndefined();
  const form = useShaFormInstanceOrUndefined();
  const closestShaFormApi = parent?.formApi ?? form?.getPublicFormApi();
  baseContext.closestShaFormApi = closestShaFormApi;
  baseContext.dcm = dcm;
  baseContext.metadataDispatcher = metadataDispatcher;
  return baseContext;
};

export type WrapConstantsDataArgs<TValues extends object = object> = GetAvailableConstantsDataArgs<TValues> & {
  fullContext: AvailableConstantsContext;
};

const EMPTY_DATA = {};

const getArguments = (args: object[] | object): unknown[] => {
  const fArgs = Array.isArray(args) && args.length === 1
    ? args[0] as object
    : !Array.isArray(args)
      ? args
      : undefined;

  if (isHasPropsAccessor(fArgs)) {
    return Array.from(fArgs._propAccessors, ([name, accessor]: [string, () => unknown]) => {
      const resolved = accessor();
      const value = isHasDataGetter(resolved)
        ? resolved.getData()
        : resolved;
      return { [name]: value };
    });
  }

  const values = Array.isArray(fArgs) ? fArgs : Object.values(fArgs ?? {});
  return values.map((value: unknown) => (isHasDataGetter(value) ? value.getData() : value));
};

export const wrapConstantsData = <TValues extends object = object>(args: WrapConstantsDataArgs<TValues>): ProxyPropertiesAccessors<IApplicationContext<TValues>> => {
  const { topContextId, shaForm, fullContext, queryStringGetter } = args;
  const { closestShaFormApi: closestShaForm,
    selectedRow,
    dcm,
    closestContextId,
    globalState,
    setGlobalState,
    httpClient,
    message,
    metadataDispatcher,
  } = fullContext;
  const shaFormInstance = (shaForm?.getPublicFormApi() ?? closestShaForm) as IFormApi<TValues> | undefined;

  const accessors: ProxyPropertiesAccessors<IApplicationContext<TValues>> = {
    application: () => {
      // get application context
      const application = dcm?.getDataContext(SheshaCommonContexts.ApplicationContext);
      const applicationData = application?.getData();
      return applicationData as IApplicationApi;
    },
    metadataDispatcher: () => metadataDispatcher,
    contexts: () => {
      const tcId = topContextId || closestContextId;
      return isDefined(dcm)
        ? { ...dcm.getDataContextsData(tcId) }
        : undefined;
    },
    pageContext: () => {
      // get page context
      const pc = dcm?.getPageContext();
      // get full page context data
      const pageContext = pc?.getFull();
      return pageContext;
    },
    selectedRow: () => selectedRow,
    globalState: () => globalState,
    setGlobalState: () => setGlobalState,
    moment: () => moment,
    http: () => httpClient,
    message: () => message,
    fileSaver: () => FileSaver,
    data: () => (!shaFormInstance ? EMPTY_DATA : GetShaFormDataAccessor<TValues>(shaFormInstance)) as TValues,
    form: () => shaFormInstance,
    query: () => queryStringGetter?.() ?? {},
    initialValues: () => shaFormInstance?.initialValues,
    parentFormValues: () => shaFormInstance?.parentFormValues,
    // don't delete this as is used for debug the proxied data from the form scripts
    test: () => ({ getArguments }),
  };
  return accessors;
};

const useWrapAvailableConstantsData = (fullContext: AvailableConstantsContext, args: GetAvailableConstantsDataArgs = {}, additionalData?: object): IApplicationContext => {
  const accessors = wrapConstantsData({ fullContext, ...args });

  const contextProxyRef = useRef<TypedProxy<IApplicationContext>>();
  if (!contextProxyRef.current)
    contextProxyRef.current = makeObservableProxy<IApplicationContext>(accessors);
  else
    contextProxyRef.current.refreshAccessors(accessors);

  contextProxyRef.current.setAdditionalData(additionalData ?? {});

  return contextProxyRef.current;
};

/**
 * Use this method if you need connect to Application data without re-rendeting if DataContextx changed
 * @param args arguments
 * @returns Application contexts
 */
export const useAvailableConstantsDataNoRefresh = (args: GetAvailableConstantsDataArgs = {}, additionalData?: object): IApplicationContext => {
  const fullContext = useAvailableConstantsContextsNoRefresh();
  var result = useWrapAvailableConstantsData(fullContext, args, additionalData);
  return result;
};

/**
 * Use this method if you need coonect to Application data re-rendeting if DataContexts changed
 * @param args arguments
 * @returns Application contexts
 */
export const useAvailableConstantsData = (args: GetAvailableConstantsDataArgs = {}, additionalData?: object): IApplicationContext => {
  const fullContext = useAvailableConstantsContexts();
  var result = useWrapAvailableConstantsData(fullContext, args, additionalData);
  return result;
};

export const useApplicationContextData = (): object | undefined => {
  return useDataContextManagerActionsOrUndefined()
    ?.getDataContext(SheshaCommonContexts.ApplicationContext)
    ?.getData();
};

export const getReadOnlyBool = (editMode: EditMode | undefined, parentReadOnly: boolean): boolean => {
  return (
    editMode === false || // check exact condition
    editMode === 'readOnly' ||
    ((editMode === 'inherited' || editMode === undefined || editMode === true) && // check exact condition
      parentReadOnly)
  );
};

export const isCommonContext = (name: string): boolean => {
  const r = RootContexts;
  return r.filter((i) => i === name).length > 0;
};

const extractReadOnly = (data: unknown): boolean | undefined => {
  return isDefined(data) && typeof data === 'object' && 'readOnly' in data && typeof (data.readOnly) === 'boolean' ? data.readOnly : undefined;
};

export const getParentReadOnly = (parent: IParentProviderProps | undefined, allData: unknown): boolean => {
  // TODO: review type of allData
  const form = isDefined(allData) && typeof allData === 'object' && "form" in allData ? allData.form : undefined;
  const formMode: FormMode | undefined = isDefined(form) && "formMode" in form ? form.formMode as FormMode : undefined;
  return formMode !== 'designer' &&
    (extractReadOnly(parent?.model) ?? (parent?.formMode === 'readonly' || formMode === 'readonly'));
};

const getContainerNames = (toolboxComponent: IToolboxComponent): string[] => {
  return toolboxComponent.customContainerNames
    ? [...(toolboxComponent.customContainerNames ?? [])]
    : ['components'];
};

const getSubContainers = (component: IConfigurableFormComponent, componentRegistration: IToolboxComponent | undefined): IComponentsContainer[] => {
  const customContainerNames = componentRegistration?.customContainerNames || [];
  let subContainers: IComponentsContainer[] = [];
  customContainerNames.forEach((containerName) => {
    const containerValue = unsafeGetValueByPropertyName(component, containerName);
    const containers = containerValue
      ? Array.isArray(containerValue)
        ? (containerValue as IComponentsContainer[])
        : [containerValue as IComponentsContainer]
      : undefined;
    if (containers) subContainers = [...subContainers, ...containers];
  });
  const standardComponents = unsafeGetValueByPropertyName(component, "components");
  if (standardComponents)
    subContainers.push({ id: component.id, components: standardComponents as IConfigurableFormComponent[] });
  return subContainers;
};

/**
 * Convert components tree to flat structure.
 * In flat structure we store components settings and their relations separately:
 * allComponents - dictionary (key:value) of components. key - Id of the component, value - conponent settings
 * componentRelations - dictionary of component relations. key - id of the container, value - ordered list of subcomponent ids
 */
export const componentsTreeToFlatStructure = (
  toolboxComponents: IToolboxComponents,
  components: IConfigurableFormComponent[],
): IFlatComponentsStructure => {
  const result: IFlatComponentsStructure = {
    allComponents: {},
    componentRelations: {},
  };

  const processComponent = (component: IConfigurableFormComponent, parentId: string): void => {
    // prepare component runtime
    result.allComponents[component.id] = {
      ...component,
      parentId,
    };

    const level = result.componentRelations[parentId] ?? [];
    level.push(component.id);
    result.componentRelations[parentId] = level;

    if (component.type) {
      const componentRegistration = toolboxComponents[component.type];

      // custom containers
      const subContainers = getSubContainers(component, componentRegistration);

      subContainers.forEach((subContainer) => {
        if (isDefined(subContainer.components)) {
          subContainer.components.forEach((c) => {
            processComponent(c, subContainer.id);
          });
        }
      });
    }
  };

  if (isDefined(components)) {
    components.forEach((component) => {
      processComponent(component, ROOT_COMPONENT_KEY);
    });
  }

  return result;
};

export const upgradeComponent = (
  componentModel: IConfigurableFormComponent,
  definition: IToolboxComponent,
  formSettings: IFormSettings,
  flatStructure: IFlatComponentsStructure,
  isNew?: boolean,
): IConfigurableFormComponent => {
  if (!definition.migrator) return componentModel;

  const migrator = new Migrator<IConfigurableFormComponent, IConfigurableFormComponent, SettingsMigrationContext>();
  const fluent = definition.migrator(migrator);
  const versionedModel = { ...componentModel, version: componentModel.version ?? -1 };
  const model = fluent.migrator.upgrade(versionedModel, {
    isNew: isNew ?? false,
    formSettings,
    flatStructure,
    componentId: versionedModel.id,
  });
  return model;
};

export const upgradeComponents = (
  toolboxComponents: IToolboxComponents,
  formSettings: IFormSettings,
  flatStructure: IFlatComponentsStructure,
  isNew?: boolean,
): void => {
  const { allComponents } = flatStructure;
  for (const key in allComponents) {
    if (allComponents.hasOwnProperty(key)) {
      const component = allComponents[key] as IConfigurableFormComponent;

      const componentDefinition = toolboxComponents[component.type];
      if (componentDefinition) {
        allComponents[key] = upgradeComponent(component, componentDefinition, formSettings, flatStructure, isNew);
      }
    }
  }
};

//#region Migration utils

export const getClosestComponent = (componentId: string, context: SettingsMigrationContext, componentType: string): IConfigurableFormComponent | null => {
  let component = context.flatStructure.allComponents[componentId];
  do {
    component = component?.parentId ? context.flatStructure.allComponents[component.parentId] : undefined;
  } while (component && (isRawComponentsContainer(component) || component.type !== componentType));

  return isConfigurableFormComponent(component) && component.type === componentType
    ? component
    : null;
};

export const getClosestTableId = (context: SettingsMigrationContext): string | null => {
  const table = getClosestComponent(context.componentId, context, 'dataContext');
  if (!table)
    return null;

  const uniqueStateId = unsafeGetValueByPropertyName(table, "uniqueStateId");
  return typeof (uniqueStateId) === "string" && !isNullOrWhiteSpace(uniqueStateId)
    ? uniqueStateId
    : table.propertyName ?? null;
};

//#endregion

/** Convert flat components structure to a component tree */
export const componentsFlatStructureToTree = (
  toolboxComponents: IToolboxComponents,
  flat: IFlatComponentsStructure,
): IConfigurableFormComponent[] => {
  const tree: IConfigurableFormComponent[] = [];

  const processComponent = (container: IConfigurableFormComponent[], ownerId: string): void => {
    const componentIds = flat.componentRelations[ownerId];

    if (!componentIds) return;

    const ownerComponent = flat.allComponents[ownerId];

    const staticContainerIds: string[] = [];
    if (ownerComponent) {
      const ownerDefinition = isConfigurableFormComponent(ownerComponent) && ownerComponent.type
        ? toolboxComponents[ownerComponent.type]
        : undefined;

      if (isDefined(ownerDefinition) && ownerDefinition.customContainerNames) {
        ownerDefinition.customContainerNames.forEach((sc) => {
          const subContainer = unsafeGetValueByPropertyName(ownerComponent, sc);
          if (subContainer) {
          // container with id
            if (isObjectWithStringId(subContainer))
              staticContainerIds.push(subContainer.id);
            // container without id (array of components)
            if (Array.isArray(subContainer))
              subContainer.forEach((c) => {
                if (isObjectWithStringId(c))
                  staticContainerIds.push(c.id);
              });
          }
        });
      }
    }

    // iterate all component ids on the current level
    componentIds.forEach((id) => {
      // extract current component and add to hierarchy
      const component: Record<string, unknown> = { ...flat.allComponents[id] };
      if (!isConfigurableFormComponent(component))
        return;
      if (!staticContainerIds.includes(id))
        container.push(component);

      //  process all childs if any
      if (id in flat.componentRelations) {
        const childComponents: IConfigurableFormComponent[] = [];
        processComponent(childComponents, id);

        component['components'] = childComponents;
      }

      // note: this function may be called for custom container without type
      if (component.type) {
        const componentRegistration = toolboxComponents[component.type];

        const customContainers = componentRegistration?.customContainerNames || [];
        customContainers.forEach((containerName) => {
          const processContainer = (container: IComponentsContainer): IComponentsContainer => {
            const childComponents: IConfigurableFormComponent[] = [];
            processComponent(childComponents, container.id);
            return { ...container, components: childComponents };
          };

          const childContainers = unsafeGetValueByPropertyName(component, containerName);
          if (childContainers) {
            if (Array.isArray(childContainers)) {
              component[containerName] = childContainers.map(processContainer);
            } else if (isComponentsContainer(childContainers))
              component[containerName] = processContainer(childContainers);
            else
              throw new Error(`Unknown container type: ${typeof childContainers}`, childContainers);
          }
        });
      }
    });
  };

  processComponent(tree, ROOT_COMPONENT_KEY);

  return tree;
};

export const upgradeComponentsTree = (
  toolboxComponents: IToolboxComponents,
  formSettings: IFormSettings,
  components: IConfigurableFormComponent[],
): IConfigurableFormComponent[] => {
  const flatStructure = componentsTreeToFlatStructure(toolboxComponents, components);
  upgradeComponents(toolboxComponents, formSettings, flatStructure);
  return componentsFlatStructureToTree(toolboxComponents, flatStructure);
};

class StaticMustacheTag {
  #value: string;

  constructor(value: string) {
    this.#value = value;
  }

  toEscapedString(): string {
    return `{{${this.#value}}}`;
  }

  toString(): string {
    return `{{{${this.#value}}}}`;
  }
}

type MomentProto = {
  toString(): string;
};

/**
 * Evaluates the string using Mustache template.
 *
 * Given a the below expression
 * const expression =  'My name is {{name}}';
 *
 * and the below data
 *  const data = { name: 'John', surname: 'Dow' };
 *  evaluateString()
 * the expression below
 *   evaluateString(expression, data);
 * The below expression will return 'My name is John';
 *
 * @param template - string template
 * @param data - data to use to evaluate the string
 * @returns {string} evaluated string
 */
export const evaluateString = (template: string = '', data: object, skipUnknownTags: boolean = false): string => {
  const prototype = moment.prototype as MomentProto;
  // store moment toString function to get ISO format of datetime
  const toString = prototype.toString;
  prototype.toString = function (this: moment.Moment) {
    return this.format('YYYY-MM-DDTHH:mm:ss');
  };

  try {
    if (!template || typeof template !== 'string')
      return template;

    // The function throws an exception if the expression passed doesn't have a corresponding curly braces
    try {
      const view: IAnyObject = {
        ...data,
        // adding a function to the data object that will format datetime
        dateFormat: function () {
          return function (timestamp: unknown, render: (renderArgs: unknown) => string) {
            return new Date(render(timestamp).trim()).toLocaleDateString('en-us', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
          };
        },
      };

      if (skipUnknownTags) {
        template.match(/{{\s*[\w\.]+\s*}}/g)?.forEach((x) => {
          const mathes = x.match(/[\w\.]+/);
          const tag = mathes && mathes.length > 0
            ? mathes[0]
            : undefined;

          if (!tag)
            return;
          const parts = tag.split('.');
          const field = parts.pop();
          if (isNullOrWhiteSpace(field))
            return;

          const container = parts.reduce((level: IAnyObject, key: string) => {
            return level.hasOwnProperty(key)
              ? level[key] as IAnyObject
              : (level[key] = {} as IAnyObject);
          }, view);
          if (!container.hasOwnProperty(field)) {
            container[field] = new StaticMustacheTag(tag);
          }
        });

        const escape = (value: string | StaticMustacheTag): string => {
          return value instanceof StaticMustacheTag
            ? value.toEscapedString()
            : value;
        };

        return Mustache.render(template, view, undefined, { escape });
      } else
        return Mustache.render(template, view);
    } catch (error) {
      console.warn('evaluateString ', error);
      return template;
    }
  } finally {
    // restore moment toString function
    prototype.toString = toString;
  }
};

/**
 * Evaluates the string using Mustache template. Same as {evaluateString} except it allows you to pass an array of
 * objects that can be used to evaluate one string using multiple objects like data1, data2, data3... which can have conflicting keys
 *
 * Given a the below expression
 * ```typescript
 *  const expression =  'My name is {{person.name}} {{person.surname}}. I work at {{company.name}}';
 *
 *  // and the below data
 *  const mappings = [{
 *      match: 'person',
 *      data: { name: 'John', surname: 'Dow' }
 *    },
 *      match: 'company',
 *      data: { name: 'Boxfusion' }
 *    {
 *  }]
 *
 *  const data = { name: 'John', surname: 'Dow' };
 *  const company = { name: 'Boxfusion' };
 *
 *  // the expression below
 *  const evaluatedString = evaluateString(expression, mappings);
 *  // will yield
 *  'My name is John Doe. I work at Boxfusion';
 * ```
 *
 * @param template - string template
 * @param data - data to use to evaluate the string
 * @returns {string} evaluated string
 */
export const evaluateComplexString = (expression: string, mappings: IMatchData[]): string => { // TODO (V1): merge with evaluateComplexStringWithResult
  if (isNullOrWhiteSpace(expression))
    return expression;
  const matches = new Set([...expression.matchAll(/\{\{(?:(?!}}).)*\}\}/g)].flat());

  let result = expression;

  Array.from(matches).forEach((matched) => {
    mappings.forEach(({ match, data }) => {
      if (matched.includes(`{{${match}`)) {
        // When the match = "", we wanna send data as it is as that would mean that the expression doe nto use dot notation
        // This is useful for backward compatibility
        // Initially expression would simply be {{expression}} and they wou be evaluated against formData
        // But dynamic expression now can use formData and globalState, so as a result the expressions need to use dot notation
        const evaluatedValue = evaluateString(matched, match ? { [match]: data } : isDefined(data) && typeof (data) === "object" ? data : {});

        result = result.replaceAll(matched, evaluatedValue);
      }
    });
  });

  return result;
};

export interface IEvaluateComplexStringResult {
  result: ExpressionNodeValue;
  unevaluatedExpressions: string[] | undefined;
  success: boolean;
}

/**
 * Evaluates the string using Mustache template. Same as {evaluateComplexString} except it returns the result
 * with a flag indicating if evaluation was successful.
 *
 * A successful evaluation is the one in which not all the expressions were evaluated
 *
 * Given a the below expression
 * ```typescript
 *  const expression =  'My name is {{person.name}} {{person.surname}}. I work at {{company.name}}';
 *
 *  const expression2 =  'My name is {{person.name}} {{person.surname}}. I work at {{someCompany.name}}';
 *
 *  // and the below data
 *  const mappings = [{
 *      match: 'person',
 *      data: { name: 'John', surname: 'Dow' }
 *    },
 *      match: 'company',
 *      data: { name: 'Boxfusion' }
 *    {
 *  }]
 *
 *  const data = { name: 'John', surname: 'Dow' };
 *  const company = { name: 'Boxfusion' };
 *
 *
 *
 *  // the expression below
 *  const evaluatedStringResult = evaluateString(expression, mappings);
 *  // will yield
 *  { result: 'My name is John Doe. I work at Boxfusion', success: true }
 *
 *  // However, the the below expression
 * const evaluatedStringResults = evaluateString(expression2, mappings);
 * will yield
 *
 * { result: 'My name is John Doe. I work at {{someCompany.name}}', success: false }
 *
 * // because {{someCompany.name}} could not be evaluated successfully
 * ```
 *
 * @param template - string template
 * @param data - data to use to evaluate the string
 * @returns {string} evaluated string
 */

// TODO (V1): merge with evaluateComplexString
// newer versions
export const evaluateComplexStringWithResult = (
  expression: string,
  mappings: IMatchData[],
  requireNonEmptyResult: boolean,
): IEvaluateComplexStringResult => {
  if (isNullOrWhiteSpace(expression))
    return expression;

  const matches = new Set([...expression.matchAll(/\{\{(?:(?!}}).)*\}\}/g)].flat());

  let result = expression;

  let success = true;

  const unevaluatedExpressions: string[] = [];

  Array.from(matches).forEach((template) => {
    mappings.forEach(({ match, data }) => {
      if (template.includes(`{{${match}`)) {
        // When the match = "", we wanna send data as it is as that would mean that the expression doe nto use dot notation
        // This is useful for backward compatibility
        // Initially expression would simply be {{expression}} and they wou be evaluated against formData
        // But dynamic expression now can use formData and globalState, so as a result the expressions need to use dot notation

        const evaluatedValue = evaluateString(template, match ? { [match]: data } : isDefined(data) && typeof (data) === "object" ? data : {});

        if (requireNonEmptyResult && isNullOrWhiteSpace(evaluatedValue)) {
          success = false;
          unevaluatedExpressions.push(template);
        }

        result = result.replaceAll(template, evaluatedValue);
      }
    });
  });

  return { result, success, unevaluatedExpressions: Array.from(new Set(unevaluatedExpressions)) };
};

export const isComponentFiltered = (
  component: IConfigurableFormComponent,
  propertyFilter?: (name: string) => boolean,
): boolean => {
  if (propertyFilter && component.propertyName) {
    const filteredOut = propertyFilter(component.propertyName);
    if (filteredOut === false) return false;
  }
  return true;
};

/**
 * Return field name for the antd form by a given expression
 *
 * @param expression field name in dot notation e.g. 'supplier.name' or 'fullName'
 */
export const getFieldNameFromExpression = (expression: string): string | string[] | undefined => {
  if (!expression) return undefined;

  return expression.includes('.') ? expression.split('.') : expression;
};

export const getBoolean = (value: unknown): boolean => {
  if (typeof value == 'boolean') {
    return value;
  } else if (typeof (value) === 'string' && value.toLowerCase() === 'true') {
    return true;
  }
  return false;
};

export const hasBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') {
    return true;
  } else if (typeof value === 'string') {
    return value.toLowerCase() === 'true' || value.toLowerCase() === 'false';
  }
  return false;
};

type ValidatorFunc = (rule: RuleObject, value: unknown, callback: (error?: string) => void, data: unknown) => Promise<void>;

/**
 * Return valudation rules for the specified form component
 */
export const getValidationRules = (component: IConfigurableFormComponent, options?: IFormValidationRulesOptions): Rule[] => {
  const { validate } = component;
  const rules: Rule[] = [];

  // TODO: implement more generic way (e.g. using validation providers)

  if (validate) {
    if (validate.required)
      rules.push({
        required: true,
        message: validate.message || 'This field is required',
      });

    if (validate.minValue !== undefined)
      rules.push({
        min: validate.minValue,
        type: 'number',
      });

    if (validate.maxValue !== undefined)
      rules.push({
        max: validate.maxValue,
        type: 'number',
      });

    if (validate.minLength)
      rules.push({
        min: validate.minLength,
        type: 'string',
      });

    if (validate.maxLength)
      rules.push({
        max: validate.maxLength,
        type: 'string',
      });

    if (!isNullOrWhiteSpace(validate.validator) && options) {
      const validatorFunc = new Function('rule', 'value', 'callback', 'data', validate.validator) as ValidatorFunc;

      rules.push({
        validator: (rule: RuleObject, value: unknown, callback: (error?: string) => void) => {
          const formData = options.getFormData ? options.getFormData() : options.formData;
          return validatorFunc(
            rule,
            value,
            callback,
            formData,
          );
        },
      });
    }
  }

  return rules;
};

const DICTIONARY_ACCESSOR_REGEX = /(^[\s]*\{(?<key>[\w]+)\.(?<accessor>[^\}]+)\}[\s]*$)/;
const NESTED_ACCESSOR_REGEX = /((?<key>[\w]+)\.(?<accessor>[^\}]+))/;

/**
 * Remove zero-width space characters from a string.
 *
 * Unicode has the following zero-width characters:
 *  U+200B zero width space
 *  U+200C zero width non-joiner Unicode code point
 *  U+200D zero width joiner Unicode code point
 *  U+FEFF zero width no-break space Unicode code point
 * To remove them from a string in JavaScript, you can use a simple function:
 *
 * @see {@link https://stackoverflow.com/questions/11305797/remove-zero-width-space-characters-from-a-javascript-string} for further information
 */
export const removeZeroWidthCharsFromString = (value: string): string => {
  if (!value) return '';

  return value.replace(/[\u200B-\u200D\uFEFF]/g, '');
};

const evaluateValueInternal = (value: string, dictionary: IAnyObject, isRoot: boolean): unknown => {
  if (isNullOrWhiteSpace(value))
    return value;

  const match = value.match(isRoot ? DICTIONARY_ACCESSOR_REGEX : NESTED_ACCESSOR_REGEX);
  if (!match || !match.groups) return value;

  const { key, accessor } = match.groups;
  if (isNullOrWhiteSpace(key) || isNullOrWhiteSpace(accessor))
    return value;

  // check nested properties
  if (accessor.match(NESTED_ACCESSOR_REGEX)) {
    // try get value recursive
    return evaluateValueInternal(accessor, dictionary[key] as IAnyObject, false);
  } else {
    const container = dictionary[key];
    if (!container) return null;

    return (container as IAnyObject)[accessor];
  }
};

export const evaluateValue = (value: string, dictionary: object): unknown => {
  return evaluateValueInternal(value, dictionary as IAnyObject, true);
};

export const evaluateValueAsString = (value: string, dictionary: object): string | undefined => {
  const evaluated = evaluateValue(value, dictionary);
  return evaluated ? evaluated.toString() : undefined;
};

export const getComponentsFromMarkup = (markup: FormMarkup): IConfigurableFormComponent[] => {
  if (!isDefined(markup)) return [];
  return Array.isArray(markup)
    ? (markup as IConfigurableFormComponent[])
    : (markup as FormMarkupWithSettings).components;
};

export const getFromSettingsFromMarkup = (markup: FormMarkup): IFormSettings => {
  return Array.isArray(markup) || !Boolean(markup)
    ? DEFAULT_FORM_SETTINGS
    : (markup as FormMarkupWithSettings).formSettings;
};

/** backward compatibility */
export const getComponentsAndSettings = (markup: FormMarkup): FormMarkupWithSettings => {
  return {
    components: getComponentsFromMarkup(markup),
    formSettings: getFromSettingsFromMarkup(markup),
  };
};

export const validateForm = (rules: Rules, values: ValidateSource): Promise<void> => {
  const validator = new Schema(rules);

  return validator.validate(values);
};

export const getFormValidationRules = (markup: FormMarkup): Rules => {
  const components = getComponentsFromMarkup(markup);

  const rules: Rules = {};
  components.forEach((component) => {
    if (component.propertyName)
      rules[component.propertyName] = getValidationRules(component) as [];
  });

  return rules;
};

export const validateConfigurableComponentSettings = (markup: FormMarkup | SettingsFormMarkupFactory, values: ValidateSource): Promise<void> => {
  // TODO: restore validation
  if (typeof (markup) === 'function')
    return Promise.resolve();

  const rules = getFormValidationRules(markup);
  const validator = new Schema(rules);

  return validator.validate(values);
};

export function linkComponentToModelMetadata<TModel extends IConfigurableFormComponent>(
  component: IToolboxComponent<TModel>,
  model: TModel,
  metadata: IPropertyMetadata,
): TModel {
  let mappedModel = model;

  // map standard properties
  if (metadata.label) mappedModel.label = metadata.label;
  if (metadata.description) mappedModel.description = metadata.description;

  // map configurable properties
  if (metadata.readonly === true) mappedModel.editMode = 'readOnly';
  if (metadata.isVisible === false) mappedModel.hidden = true;
  if (!mappedModel.validate)
    mappedModel.validate = {};

  if (metadata.max) mappedModel.validate.maxValue = metadata.max;
  if (metadata.min) mappedModel.validate.minValue = metadata.min;
  if (metadata.maxLength) mappedModel.validate.maxLength = metadata.maxLength;
  if (metadata.minLength) mappedModel.validate.minLength = metadata.minLength;
  if (metadata.required === true) mappedModel.validate.required = true;
  if (metadata.validationMessage) mappedModel.validate.message = metadata.validationMessage;

  // map component-specific properties
  if (component.linkToModelMetadata) mappedModel = component.linkToModelMetadata(mappedModel, metadata);

  return mappedModel;
}

export function getComponentModelFromMetadata<TModel extends IConfigurableFormComponent>(
  component: IToolboxComponent<TModel>,
  model: TModel,
  metadata: IPropertyMetadata,
): TModel {
  // make copy of component model but with undefined values
  let m = deepCopyViaJson(model) as Record<string, unknown>;
  for (const key in m)
    if (Object.hasOwn(m, key))
      m[key] = undefined;

  // apply metadata
  m = linkComponentToModelMetadata(component, m as TModel, metadata) as Record<string, unknown>;

  // remove fields with undefined values
  for (const key in m)
    if (Object.hasOwn(m, key))
      if (m[key] === undefined)
        delete m[key];

  return m as TModel;
};

export function updateComponentModelFromMetadata<TModel extends IConfigurableFormComponent>(
  component: IToolboxComponent<TModel>,
  model: TModel,
  metadata: IPropertyMetadata,
): TModel {
  const mm = getComponentModelFromMetadata(component, model, metadata);
  const m = deepMergeValues(deepCopyViaJson(model), mm, (t: Record<string, unknown>, s: Record<string, unknown>, key) => {
    // skip merge
    // metadata value is empty
    return s[key] === undefined ||
      // model value is a non-empty primitive (non-object values are not merged if already set)
      (t[key] !== undefined && t[key] !== null && t[key] !== '' && typeof t[key] !== 'object');
  });
  return m;
};

export type ProcessingFunc = (child: IConfigurableFormComponent, parentId: string) => void;

export const processRecursive = (
  componentsRegistration: IToolboxComponentGroup[],
  parentId: string,
  component: IConfigurableFormComponent,
  func: ProcessingFunc,
): void => {
  if (!isDefined(component))
    return;
  func(component, parentId);

  if (isNullOrWhiteSpace(component.type))
    return;
  const toolboxComponent = findToolboxComponent(componentsRegistration, (c) => c.type === component.type);
  if (!toolboxComponent) return;
  const containers = getContainerNames(toolboxComponent);

  containers.forEach((cnt) => {
    const containerName = cnt as keyof IConfigurableFormComponent;
    const containerComponents = component[containerName]
      ? Array.isArray(component[containerName])
        ? (component[containerName] as IConfigurableFormComponent[])
        : [component[containerName] as IConfigurableFormComponent]
      : undefined;
    if (containerComponents) {
      containerComponents.forEach((child) => {
        func(child, component.id);
        processRecursive(componentsRegistration, parentId, child, func);
      });
    }
  });
};

/**
 * Clone components and generate new ids for them
 *
 * @param componentsRegistration
 * @param components
 * @returns
 */
export const cloneComponents = (
  componentsRegistration: IToolboxComponentGroup[],
  components: IConfigurableFormComponent[],
): IConfigurableFormComponent[] => {
  const result: IConfigurableFormComponent[] = [];

  components.forEach((component) => {
    const clone = { ...component, id: nanoid() };

    result.push(clone);

    const toolboxComponent = getToolboxComponent(componentsRegistration, (c) => c.type === component.type);
    const containers = getContainerNames(toolboxComponent);

    containers.forEach((cnt) => {
      const containerName = cnt as keyof IConfigurableFormComponent;
      const containerComponents = clone[containerName] as IConfigurableFormComponent[] | undefined;
      if (containerComponents) {
        const newChilds = cloneComponents(componentsRegistration, containerComponents);
        (clone as IAnyObject)[containerName] = newChilds;
      }
    });
  });

  return result;
};

export const createComponentModelForDataProperty = (
  components: IToolboxComponentGroup[],
  propertyMetadata: IPropertyMetadata,
  migrator?: (
    componentModel: IConfigurableFormComponent,
    toolboxComponent: IToolboxComponent,
  ) => IConfigurableFormComponent,
): IConfigurableFormComponent | undefined => {
  const { defaultEditor } = propertyMetadata.formatting ?? {};
  let toolboxComponent = !isNullOrWhiteSpace(defaultEditor)
    ? findToolboxComponent(components, (c) => c.type === defaultEditor)
    : undefined;
  toolboxComponent = toolboxComponent ??
    findToolboxComponent(
      components,
      (c) =>
        isDefined(c.dataTypeSupported) &&
        c.dataTypeSupported({ dataType: propertyMetadata.dataType, dataFormat: propertyMetadata.dataFormat ?? undefined }),
    );

  if (!toolboxComponent) return undefined;

  // find appropriate toolbox component
  // create instance of the component
  // init default values for the component
  // init component according to the metadata

  const fullName = getFullPath(propertyMetadata);

  let componentModel: IConfigurableFormComponent = {
    id: nanoid(),
    type: toolboxComponent.type,
    propertyName: fullName,
    componentName: fullName,
    labelAlign: 'right',
    // parentId: containerId,
    visible: true,
    isDynamic: false,
    validate: {},
  };
  if (toolboxComponent.initModel) componentModel = toolboxComponent.initModel(componentModel);

  if (toolboxComponent.migrator && migrator) componentModel = migrator(componentModel, toolboxComponent);

  if (!toolboxComponent.allowInherit)
    componentModel = linkComponentToModelMetadata(toolboxComponent, componentModel, propertyMetadata);

  return componentModel;
};

export interface IMatchData {
  match: string;
  data: unknown;
}

export const pickStyleFromModel = (model: StyleBoxValue, ...args: unknown[]): CSSProperties => {
  let style = {};

  const propsToCopy = !args.length
    ? STYLE_BOX_CSS_POPERTIES
    : args;

  if (isDefined(model)) {
    propsToCopy.forEach((prop) => {
      const key = prop as keyof StyleBoxValue;
      if (model[key]) style = { ...style, [key]: `${model[key]}px` };
    });
  }

  return style;
};

const emptyStyle = {};
type StyleFunction = (data: object, globalState: object) => CSSProperties | undefined;
export const getStyle = (
  style: string,
  formData: object = {},
  globalState: object = {},
  defaultStyle: object = emptyStyle,
  excludeMargin: boolean = false,
): CSSProperties => {
  if (!style)
    return defaultStyle;

  const evaluator = new Function('data, globalState', style) as StyleFunction;
  const allStyle = evaluator(formData, globalState);

  if (!allStyle || typeof allStyle !== 'object')
    return defaultStyle;
  const { margin, marginTop, marginBottom, marginLeft, marginRight, ...rest } = allStyle;
  return excludeMargin
    ? rest : {
      margin,
      marginTop,
      marginBottom,
      marginLeft,
      marginRight,
      ...rest,
    };
};

export const getLayoutStyle = (model: Pick<IConfigurableFormComponent, "style" | "stylingBox">, args: { [key: string]: unknown }): CSSProperties => {
  const styling = !isNullOrWhiteSpace(model.stylingBox)
    ? jsonSafeParse<StyleBoxValue>(model.stylingBox, {}) ?? {}
    : {};
  const style = pickStyleFromModel(styling);

  try {
    const evaluatedStyle = !isNullOrWhiteSpace(model.style)
      ? executeFunction<object>(model.style, args) ?? {}
      : {};
    return { ...style, ...evaluatedStyle };
  } catch {
    return style;
  }
};

/**
 * Convert list of properties in dot notation to a list of properties for fetching using GraphQL syntax
 *
 * @param properties
 * @returns
 */
export const convertDotNotationPropertiesToGraphQL = (properties: string[]): string => {
  const tree = {};

  const makeProp = (container: IAnyObject, name: string): void => {
    let parts = name.split('.');
    let currentContainer: IAnyObject = container;

    do {
      const part = parts.shift();
      if (!isNullOrWhiteSpace(part)) {
        if (parts.length > 0) {
        // current property is a container
          const existingContainer = currentContainer[part];
          // reuse if already exists, it already contains some properties
          if (typeof existingContainer !== 'object') currentContainer[part] = {};

          currentContainer = currentContainer[part] as IAnyObject;
        } else {
          if (!isDefined(currentContainer[part])) currentContainer[part] = true; // scalar property
        }
      }
    } while (parts.length > 0);
  };

  const expandedProps = [...properties];
  // add id if missing only if there are any other properties
  if (expandedProps.length > 0 && !expandedProps.includes('id')) expandedProps.push('id');

  // build properties tree
  expandedProps.forEach((p) => {
    makeProp(tree, p);
  });

  const preparePropertyName = (name: string): string => {
    return name.startsWith('_') ? name : camelcase(name);
  };

  const getNodes = (container: IAnyObject): string => {
    let result = '';
    for (const node in container) {
      if (container.hasOwnProperty(node)) {
        if (result !== '') result += ' ';
        const nodeValue = (container as IAnyObject)[node] as IAnyObject;
        if (typeof nodeValue === 'object') result += `${preparePropertyName(node)} { ${getNodes(nodeValue)} }`;
        else result += preparePropertyName(node);
      }
    }
    return result;
  };

  // convert tree to a GQL syntax
  return getNodes(tree);
};

export const isFormRawId = (formId: FormIdentifier): formId is FormUid => {
  return isDefined(formId) && typeof formId === 'string';
};

export const isFormFullName = (formId: FormIdentifier | undefined): formId is FormFullName => {
  return isDefined(formId) && typeof (formId) === 'object' && "name" in formId && typeof (formId.name) === 'string';
};

/**
 * Check if a formId is a valid FormFullName (i.e. it is an object with 'module' and 'name' properties that are not empty or whitespace-only strings)
 * @param formId The formId to check
 * @returns True if the formId is a valid FormFullName, false otherwise
 */
export const isValidFormFullName = (formId: FormIdentifier | undefined): formId is FormFullName => {
  return isFormFullName(formId) && !isNullOrWhiteSpace(formId.module) && !isNullOrWhiteSpace(formId.name);
};

export const isSameFormIds = (id1: FormIdentifier, id2: FormIdentifier): boolean => {
  return (isFormRawId(id1) && isFormRawId(id2) && id1 === id2) ||
    (isFormFullName(id1) && isFormFullName(id2) && id1.module?.toLowerCase() === id2.module?.toLowerCase() && id1.name.toLowerCase() === id2.name.toLowerCase());
};

export interface EvaluationContext {
  contextData: IArgumentsEvaluationContext;
  path: string;
  evaluationFilter?: (context: EvaluationContext, data: unknown) => boolean;
};
const evaluateRecursive = (data: unknown, evaluationContext: EvaluationContext): unknown => {
  if (!data)
    return data;

  const { path, contextData, evaluationFilter } = evaluationContext;
  if (evaluationFilter && !evaluationFilter(evaluationContext, data))
    return data;

  if (typeof data === 'string') {
    return evaluateString(data, contextData);
  }
  if (Array.isArray(data)) {
    // note: `typeof` returns object for arrays too, we must to check isArray before `typeof`
    return data.map((item) => evaluateRecursive(item, evaluationContext));
  }
  if (typeof data === 'object') {
    const evaluatedObject: IAnyObject = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const memberPath = path ? `${path}.${key}` : key;
        evaluatedObject[key] = evaluateRecursive((data as IAnyObject)[key], { ...evaluationContext, path: memberPath });
      }
    }
    return evaluatedObject;
  }
  return data;
};

export const recursiveEvaluator = <TArguments = ActionParametersDictionary>(
  argumentsConfiguration: TArguments,
  evaluationContext: EvaluationContext,
): Promise<TArguments | undefined> => {
  if (!Boolean(argumentsConfiguration)) return Promise.resolve(undefined);

  return new Promise<TArguments>((resolve) => {
    const evaluated = evaluateRecursive(argumentsConfiguration, evaluationContext);
    resolve(evaluated as TArguments);
  });
};

export const genericActionArgumentsEvaluator = <TArguments = ActionParametersDictionary>(
  argumentsConfiguration: TArguments,
  evaluationData: IArgumentsEvaluationContext,
): Promise<TArguments | undefined> => {
  const evaluationContext: EvaluationContext = {
    contextData: evaluationData,
    path: '',
  };

  return recursiveEvaluator(argumentsConfiguration, evaluationContext);
};

/**
 * Converts the given form markup to a flat structure of configurable form components.
 *
 * @param {FormRawMarkup} markup - The form markup to convert.
 * @param {IFormSettings} formSettings - The form settings.
 * @param {IToolboxComponents} designerComponents - The designer components.
 * @return {IFlatComponentsStructure} The flat structure of configurable form components.
 */
export const convertFormMarkupToFlatStructure = (markup: FormRawMarkup, formSettings: IFormSettings | null, designerComponents: IToolboxComponents): IFlatComponentsStructure => {
  let components = getComponentsFromMarkup(markup);
  if (formSettings?.isSettingsForm)
    components = updateJsSettingsForComponents(designerComponents, components);
  const newFlatComponents = componentsTreeToFlatStructure(designerComponents, components);

  // migrate components to last version
  upgradeComponents(designerComponents, formSettings, newFlatComponents);

  return newFlatComponents;
};

/**
 * Properties to skip when filtering actual model properties.
 * These properties are handled by the form component itself or nested components.
 */
const propertiesToSkip = ['id', 'componentName', 'type', 'jsSetting', 'isDynamic', 'components', 'actionConfiguration'];

/**
 * Standard filter for actual model properties.
 * Filters out properties that should not be included in the actual model.
 *
 * @param name - The property name to check
 * @returns true if the property should be included, false otherwise
 */
export const standardActualModelPropertyFilter = (name: string): boolean => {
  return !propertiesToSkip.includes(name);
};

/**
 * Form component actual model property filter.
 * Combines the component's custom filter with the standard filter.
 *
 * @param component - The toolbox component
 * @param name - The property name to check
 * @param value - The property value
 * @returns true if the property should be included, false otherwise
 */
export const formComponentActualModelPropertyFilter = (component: IToolboxComponent, name: string, value: unknown): boolean => {
  if (isDefined(component) && component.actualModelPropertyFilter) {
    return component.actualModelPropertyFilter(name, value) && standardActualModelPropertyFilter(name);
  }
  return standardActualModelPropertyFilter(name);
};
