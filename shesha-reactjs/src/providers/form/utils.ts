import { Rule, RuleObject } from 'antd/lib/form';
import Schema, { Rules, ValidateSource } from 'async-validator';
import camelcase from 'camelcase';
import Mustache from 'mustache';
import { nanoid } from '@/utils/uuid';
import { CSSProperties, useRef } from 'react';
import {
  DataTypes,
  IToolboxComponent,
  IToolboxComponentGroup,
  IToolboxComponents,
  SettingsMigrationContext,
} from '@/interfaces';
import { IPropertyMetadata, NestedProperties, isPropertiesArray, isPropertiesLoader } from '@/interfaces/metadata';
import { Migrator } from '@/utils/fluentMigrator/migrator';
import { getFullPath } from '@/utils/metadata/helpers';
import { IAnyObject } from './../../interfaces/anyObject';
import {
  ActionArguments,
  ActionParameters,
  ActionParametersDictionary,
  DEFAULT_FORM_SETTINGS,
  FormFullName,
  FormIdentifier,
  FormMarkup,
  FormMarkupWithSettings,
  FormUid,
  GenericDictionary,
  IComponentsContainer,
  IComponentsDictionary,
  IConfigurableFormComponent,
  IFlatComponentsStructure,
  IFormSettings,
  IFormValidationRulesOptions,
  EditMode,
  ROOT_COMPONENT_KEY,
  SILENT_KEY,
  FormRawMarkup,
} from './models';
import { updateJsSettingsForComponents } from '@/designer-components/_settings/utils';
import {
  IDataContextManagerActionsContext,
  IDataContextManagerFullInstance,
  IDataContextsData,
  RootContexts,
  useDataContextManagerActionsOrUndefined,
  useDataContextManagerOrUndefined,
} from '@/providers/dataContextManager';
import moment from 'moment';
import FileSaver from 'file-saver';
import { App } from 'antd';
import { ISelectionProps } from '@/providers/dataTable/contexts';
import { IDataContextFull, useDataContextOrUndefined } from '@/providers/dataContextProvider/contexts';
import {
  FormMode,
  HttpClientApi,
  IApplicationApi,
  STYLE_BOX_CSS_POPERTIES,
  StyleBoxValue,
  useDataTableState,
  useGlobalState,
  useHttpClient,
} from '@/providers';
import { MessageInstance } from 'antd/es/message/interface';
import { executeFunction } from '@/utils';
import { IParentProviderProps, useParent } from '../parentProvider/index';
import { SheshaCommonContexts } from '../dataContextManager/models';
import { toCamelCase } from '@/utils/string';
import { IFormApi } from './formApi';
import { makeObservableProxy, ProxyPropertiesAccessors, TypedProxy } from './observableProxy';
import { ISetStatePayload } from '../globalState/contexts';
import { IShaFormInstance } from './store/interfaces';
import { useShaFormInstanceOrUndefined, useShaFormDataUpdate } from './providers/shaFormProvider';
import { QueryStringParams } from '@/utils/url';
import { GetShaFormDataAccessor } from '../dataContextProvider/contexts/shaDataAccessProxy';
import { jsonSafeParse } from '@/utils/object';
import { isDefined } from '@/utils/nullables';
import { getActualModel, getActualPropertyValue } from './utils/js-settings';
import {
  executeScriptSync,
  executeExpression,
  FunctionExecutor,
  getFunctionExecutor,
  executeScript,
  IExpressionExecuterArguments,
  IExpressionExecuterFailedHandler,
} from './utils/scripts';

export {
  // prop settings
  getActualModel,
  getActualPropertyValue,
  // scripts
  executeScriptSync,
  executeExpression,
  getFunctionExecutor,
  executeScript,
  type FunctionExecutor,
  type IExpressionExecuterArguments,
  type IExpressionExecuterFailedHandler,
};

/** Interface to get all avalilable data */
export interface IApplicationContext<Value extends object = object> {
  application?: IApplicationApi;
  contextManager?: IDataContextManagerFullInstance;
  /** Form data */
  data?: Value;

  form?: IFormApi<Value>;
  /** Contexts datas */
  contexts: IDataContextsData | undefined;
  /** Global state */
  globalState: IAnyObject | undefined;
  /** Table selection */
  selectedRow: ISelectionProps | undefined;
  /** Moment function */
  moment: Function;
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
  test?: any;
}

export type GetAvailableConstantsDataArgs<TValues extends object = object> = {
  topContextId?: string;
  shaForm?: IShaFormInstance<TValues>;
  queryStringGetter?: () => QueryStringParams;
};

export type AvailableConstantsContext = {
  closestShaFormApi: IFormApi | undefined;
  selectedRow?: ISelectionProps | undefined;
  dcm: IDataContextManagerActionsContext | undefined;
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
  const selectedRow = useDataTableState(false)?.selectedRow;

  const httpClient = useHttpClient();

  const result: AvailableConstantsContext = {
    closestShaFormApi: undefined,
    selectedRow,
    dcm: undefined,
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

  const parent = useParent(false);
  const form = useShaFormInstanceOrUndefined();
  const closestShaFormApi = parent?.formApi ?? form?.getPublicFormApi();
  baseContext.closestShaFormApi = closestShaFormApi;
  baseContext.dcm = dcm;
  return baseContext;
};

export const useAvailableConstantsContexts = (): AvailableConstantsContext => {
  const baseContext = useBaseAvailableConstantsContexts();
  // get DataContext Manager
  const dcm = useDataContextManagerOrUndefined();
  useShaFormDataUpdate();

  const parent = useParent(false);
  const form = useShaFormInstanceOrUndefined();
  const closestShaFormApi = parent?.formApi ?? form?.getPublicFormApi();
  baseContext.closestShaFormApi = closestShaFormApi;
  baseContext.dcm = dcm;
  return baseContext;
};

export type WrapConstantsDataArgs<TValues extends object = object> = GetAvailableConstantsDataArgs<TValues> & {
  fullContext: AvailableConstantsContext;
};

const EMPTY_DATA = {};

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
  } = fullContext;
  const shaFormInstance = (shaForm?.getPublicFormApi() ?? closestShaForm) as IFormApi<TValues> | undefined;

  const accessors: ProxyPropertiesAccessors<IApplicationContext<TValues>> = {
    application: () => {
      // get application context
      const application = dcm?.getDataContext(SheshaCommonContexts.ApplicationContext);
      const applicationData = application?.getData();
      return applicationData as IApplicationApi;
    },
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
  };
  return accessors;
};

const useWrapAvailableConstantsData = (fullContext: AvailableConstantsContext, args: GetAvailableConstantsDataArgs = {}, additionalData?: any): IApplicationContext => {
  const accessors = wrapConstantsData({ fullContext, ...args });

  const contextProxyRef = useRef<TypedProxy<IApplicationContext>>();
  if (!contextProxyRef.current)
    contextProxyRef.current = makeObservableProxy<IApplicationContext>(accessors);
  else
    contextProxyRef.current.refreshAccessors(accessors);

  contextProxyRef.current.setAdditionalData(additionalData);

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
  return r.filter((i) => i === name)?.length > 0;
};

export const getParentReadOnly = (parent: IParentProviderProps, allData: unknown): boolean => {
  // TODO: review type of allData
  const form = typeof allData === 'object' && "form" in allData ? allData.form : undefined;
  const formMode: FormMode | undefined = isDefined(form) && "formMode" in form ? form.formMode as FormMode : undefined;
  return formMode !== 'designer' &&
    (parent?.model?.readOnly as boolean ?? (parent?.formMode === 'readonly' || formMode === 'readonly'));
};

// const regexp = new RegExp('/(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d)|(\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d)/');
export const updateModelToMoment = async (model: object, properties: NestedProperties): Promise<any> => {
  if (properties === null)
    return model;
  const newModel = { ...model };
  const propsPromise = isPropertiesArray(properties)
    ? Promise.resolve(properties)
    : isPropertiesLoader(properties)
      ? properties()
      : Promise.resolve([]);
  return await propsPromise.then(async (props: IPropertyMetadata[]) => {
    for (const key in newModel) {
      if (newModel.hasOwnProperty(key)) { // regexp.test(newModel[key])) {
        const prop = props.find((i) => toCamelCase(i.path) === key);
        if (prop && (prop.dataType === DataTypes.date || prop.dataType === DataTypes.dateTime))
          newModel[key] = newModel[key] ? moment(newModel[key]).utc(true) : newModel[key];
        if (prop && prop.dataType === DataTypes.entityReference && prop.properties?.length > 0) {
          newModel[key] = await updateModelToMoment(newModel[key], prop.properties as IPropertyMetadata[]);
        }
      }
    }
    return newModel;
  });
};

const getContainerNames = (toolboxComponent: IToolboxComponent): string[] => {
  return toolboxComponent.customContainerNames
    ? [...(toolboxComponent.customContainerNames ?? [])]
    : ['components'];
};

const getSubContainers = (component: IConfigurableFormComponent, componentRegistration: IToolboxComponent): IComponentsContainer[] => {
  const customContainerNames = componentRegistration?.customContainerNames || [];
  let subContainers: IComponentsContainer[] = [];
  customContainerNames.forEach((containerName) => {
    const containers = component[containerName]
      ? Array.isArray(component[containerName])
        ? (component[containerName] as IComponentsContainer[])
        : [component[containerName] as IComponentsContainer]
      : undefined;
    if (containers) subContainers = [...subContainers, ...containers];
  });
  if (component['components']) subContainers.push({ id: component.id, components: component['components'] });
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

  const processComponent = (component: IConfigurableFormComponent, parentId?: string): void => {
    // prepare component runtime
    result.allComponents[component.id] = {
      ...component,
      parentId,
    };

    const level = result.componentRelations[parentId] || [];
    level.push(component.id);
    result.componentRelations[parentId] = level;

    if (component.type) {
      const componentRegistration = toolboxComponents[component.type];

      // custom containers
      const subContainers = getSubContainers(component, componentRegistration);

      subContainers.forEach((subContainer) => {
        if (subContainer && subContainer.components) {
          subContainer.components.forEach((c) => {
            processComponent(c, subContainer.id);
          });
        }
      });
    }
  };

  if (components) {
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
    isNew,
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
    component = component?.parentId ? context.flatStructure.allComponents[component.parentId] : null;
  } while (component && component.type !== componentType);

  return component?.type === componentType ? component : null;
};

export const getClosestTableId = (context: SettingsMigrationContext): string | null => {
  const table = getClosestComponent(context.componentId, context, 'datatableContext');
  return table ? table['uniqueStateId'] ?? table.propertyName : null;
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
    const ownerDefinition = ownerComponent && ownerComponent.type
      ? toolboxComponents[ownerComponent.type]
      : undefined;
    const staticContainerIds = [];
    if (ownerDefinition?.customContainerNames) {
      ownerDefinition.customContainerNames.forEach((sc) => {
        const subContainer = ownerComponent[sc];
        if (subContainer) {
          // container with id
          if (subContainer.id)
            staticContainerIds.push(subContainer.id);
          // container without id (array of components)
          if (Array.isArray(subContainer))
            subContainer.forEach((c) => {
              if (c.id)
                staticContainerIds.push(c.id);
            });
        }
      });
    }

    // iterate all component ids on the current level
    componentIds.forEach((id) => {
      // extract current component and add to hierarchy
      const component = { ...flat.allComponents[id] };
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

          const childContainers = component[containerName];
          if (childContainers) {
            if (Array.isArray(childContainers)) {
              component[containerName] = childContainers.map(processContainer);
            } else {
              component[containerName] = processContainer(childContainers);
            }
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
  // store moment toString function to get ISO format of datetime
  var toString = moment.prototype.toString;
  moment.prototype.toString = function () {
    return this.format('YYYY-MM-DDTHH:mm:ss');
  };

  try {
    if (!template || typeof template !== 'string')
      return template;

    // The function throws an exception if the expression passed doesn't have a corresponding curly braces
    try {
      const view = {
        ...data,
        // adding a function to the data object that will format datetime
        dateFormat: function () {
          return function (timestamp, render) {
            return new Date(render(timestamp).trim()).toLocaleDateString('en-us', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });
          };
        },
      };

      if (skipUnknownTags) {
        template.match(/{{\s*[\w\.]+\s*}}/g).forEach((x) => {
          const mathes = x.match(/[\w\.]+/);
          const tag = mathes.length ? mathes[0] : undefined;

          const parts = tag.split('.');
          const field = parts.pop();
          const container = parts.reduce((level, key) => {
            return level.hasOwnProperty(key) ? level[key] : (level[key] = {});
          }, view);
          if (!container.hasOwnProperty(field)) {
            container[field] = new StaticMustacheTag(tag);
          }
        });

        const escape = (value: any): string => {
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
    moment.prototype.toString = toString;
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
export const evaluateComplexString = (expression: string, mappings: IMatchData[]): string => {
  const matches = new Set([...expression?.matchAll(/\{\{(?:(?!}}).)*\}\}/g)].flat());

  let result = expression;

  Array.from(matches).forEach((matched) => {
    mappings.forEach(({ match, data }) => {
      if (matched.includes(`{{${match}`)) {
        // When the match = "", we wanna send data as it is as that would mean that the expression doe nto use dot notation
        // This is useful for backward compatibility
        // Initially expression would simply be {{expression}} and they wou be evaluated against formData
        // But dynamic expression now can use formData and globalState, so as a result the expressions need to use dot notation
        const evaluatedValue = evaluateString(matched, match ? { [match]: data } : data);

        result = result.replaceAll(matched, evaluatedValue);
      }
    });
  });

  return result;
};

export interface IEvaluateComplexStringResult {
  result: string;
  unevaluatedExpressions?: string[];
  success?: boolean;
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

// newer versions
export const evaluateComplexStringWithResult = (
  expression: string,
  mappings: IMatchData[],
  requireNonEmptyResult: boolean,
): IEvaluateComplexStringResult => {
  const matches = new Set([...expression?.matchAll(/\{\{(?:(?!}}).)*\}\}/g)].flat());

  let result = expression;

  let success = true;

  const unevaluatedExpressions = [];

  Array.from(matches).forEach((template) => {
    mappings.forEach(({ match, data }) => {
      if (template.includes(`{{${match}`)) {
        // When the match = "", we wanna send data as it is as that would mean that the expression doe nto use dot notation
        // This is useful for backward compatibility
        // Initially expression would simply be {{expression}} and they wou be evaluated against formData
        // But dynamic expression now can use formData and globalState, so as a result the expressions need to use dot notation

        const evaluatedValue = evaluateString(template, match ? { [match]: data } : data);

        if (requireNonEmptyResult && !evaluatedValue?.trim()) {
          success = false;
          unevaluatedExpressions?.push(template);
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
  } else if (typeof (value) === 'string' && value?.toLowerCase() === 'true') {
    return true;
  }
  return false;
};

export const hasBoolean = (value: unknown): boolean => {
  if (typeof value === 'boolean') {
    return true;
  } else if (typeof value === 'string') {
    if (value?.toLowerCase() === 'true') {
      return true;
    } else if (value?.toLowerCase() === 'false') {
      return true;
    }
  }
  return false;
};
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
        message: validate?.message || 'This field is required',
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

    if (validate.validator)
      rules.push({
        // tslint:disable-next-line:function-constructor
        validator: (rule: RuleObject, value: any, callback: (error?: string) => void) =>
          new Function('rule', 'value', 'callback', 'data', validate.validator)(
            rule,
            value,
            callback,
            options?.getFormData ? options?.getFormData() : options?.formData,
          ),
      });
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

const evaluateValueInternal = (value: string, dictionary: any, isRoot: boolean): unknown => {
  if (!value) return value;
  if (!dictionary) return null;

  const match = value.match(isRoot ? DICTIONARY_ACCESSOR_REGEX : NESTED_ACCESSOR_REGEX);
  if (!match) return value;

  // check nested properties
  if (match.groups.accessor.match(NESTED_ACCESSOR_REGEX)) {
    // try get value recursive
    return evaluateValueInternal(match.groups.accessor, dictionary[match.groups.key], false);
  } else {
    const container = dictionary[match.groups.key];
    if (!container) return null;

    const evaluatedValue = container[match.groups.accessor];

    return evaluatedValue;
  }
};

export const evaluateValue = (value: string, dictionary: object): unknown => {
  return evaluateValueInternal(value, dictionary, true);
};

export const evaluateValueAsString = (value: string, dictionary: object): string | undefined => {
  const evaluated = evaluateValue(value, dictionary);
  return evaluated ? evaluated.toString() : undefined;
};

export const findToolboxComponent = (
  availableComponents: IToolboxComponentGroup[],
  predicate: (component: IToolboxComponent) => boolean,
): IToolboxComponent => {
  if (availableComponents) {
    for (const group of availableComponents) {
      for (const component of group.components) {
        if (predicate(component)) return component;
      }
    }
  }

  return null;
};

export const getComponentsFromMarkup = (markup: FormMarkup): IConfigurableFormComponent[] => {
  if (!markup) return [];
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
  components?.forEach((component) => {
    rules[component.propertyName] = getValidationRules(component) as [];
  });

  return rules;
};

export const validateConfigurableComponentSettings = (markup: FormMarkup, values: ValidateSource): Promise<void> => {
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

export type ProcessingFunc = (child: IConfigurableFormComponent, parentId: string) => void;

export const processRecursive = (
  componentsRegistration: IToolboxComponentGroup[],
  parentId: string,
  component: IConfigurableFormComponent,
  func: ProcessingFunc,
): void => {
  func(component, parentId);

  const toolboxComponent = findToolboxComponent(componentsRegistration, (c) => c?.type === component?.type);
  if (!toolboxComponent) return;
  const containers = getContainerNames(toolboxComponent);

  if (containers) {
    containers.forEach((containerName) => {
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
  }
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

    const toolboxComponent = findToolboxComponent(componentsRegistration, (c) => c.type === component.type);
    const containers = getContainerNames(toolboxComponent);

    if (containers) {
      containers.forEach((containerName) => {
        const containerComponents = clone[containerName] as IConfigurableFormComponent[];
        if (containerComponents) {
          const newChilds = cloneComponents(componentsRegistration, containerComponents);
          clone[containerName] = newChilds;
        }
      });
    }
  });

  return result;
};

export const createComponentModelForDataProperty = (
  components: IToolboxComponentGroup[],
  propertyMetadata: IPropertyMetadata,
  migrator?: (
    componentModel: IConfigurableFormComponent,
    toolboxComponent: IToolboxComponent<any>
  ) => IConfigurableFormComponent,
): IConfigurableFormComponent => {
  let toolboxComponent = findToolboxComponent(components, (c) => c.type === propertyMetadata.formatting.defaultEditor);
  toolboxComponent = toolboxComponent ||
    findToolboxComponent(
      components,
      (c) =>
        Boolean(c.dataTypeSupported) &&
        c.dataTypeSupported({ dataType: propertyMetadata.dataType, dataFormat: propertyMetadata.dataFormat }),
    );

  if (!Boolean(toolboxComponent)) return null;

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
    label: propertyMetadata.label,
    labelAlign: 'right',
    // parentId: containerId,
    hidden: false,
    isDynamic: false,
    validate: {},
  };
  if (toolboxComponent.initModel) componentModel = toolboxComponent.initModel(componentModel);

  if (toolboxComponent.migrator && migrator) componentModel = migrator(componentModel, toolboxComponent);

  componentModel = linkComponentToModelMetadata(toolboxComponent, componentModel, propertyMetadata);

  return componentModel;
};

export interface IMatchData {
  match: string;
  data: any;
}

export const pickStyleFromModel = (model: StyleBoxValue, ...args: any[]): CSSProperties => {
  let style = {};

  const propsToCopy = !args.length
    ? STYLE_BOX_CSS_POPERTIES
    : args;

  if (model) {
    propsToCopy.forEach((prop) => {
      if (model[prop]) style = { ...style, [prop]: `${model[prop]}px` };
    });
  }

  return style;
};

const emptyStyle = {};
export const getStyle = (
  style: string,
  formData: any = {},
  globalState: any = {},
  defaultStyle: object = emptyStyle,
): CSSProperties => {
  if (!style) return defaultStyle;
  // tslint:disable-next-line:function-constructor
  return new Function('data, globalState', style)(formData, globalState);
};

export const getLayoutStyle = (model: IConfigurableFormComponent, args: { [key: string]: any }): CSSProperties => {
  const styling = jsonSafeParse<StyleBoxValue>(model?.stylingBox || '{}');
  let style = pickStyleFromModel(styling);

  try {
    return { ...style, ...(executeFunction<object>(model?.style, args) || {}) };
  } catch {
    return style;
  }
};

export const filterFormData = <TData extends object = object>(data: TData): TData => {
  if (typeof data === 'object' && Object.getOwnPropertyNames(data || {}).length) {
    return Object.entries(data)
      .filter(([k]) => !k.startsWith(SILENT_KEY))
      .reduce((accum, [k, v]) => {
        accum[k] = v;
        return accum;
      }, {}) as TData;
  }

  return data;
};

/**
 * Convert list of properties in dot notation to a list of properties for fetching using GraphQL syntax
 *
 * @param properties
 * @returns
 */
export const convertDotNotationPropertiesToGraphQL = (properties: string[]): string => {
  const tree = {};

  const makeProp = (container: object, name: string): void => {
    let parts = name.split('.');
    let currentContainer = container;

    do {
      const part = parts.shift();
      if (parts.length > 0) {
        // current property is a container
        const existingContainer = currentContainer[part];
        // reuse if already exists, it already contains some properties
        if (typeof existingContainer !== 'object') currentContainer[part] = {};

        currentContainer = currentContainer[part];
      } else {
        if (!Boolean(currentContainer[part])) currentContainer[part] = true; // scalar property
      }
    } while (parts.length > 0);
  };

  const expandedProps = [...properties];
  // add id if missing only if there are any other properties
  if (expandedProps?.length > 0 && !expandedProps.includes('id')) expandedProps.push('id');

  // build properties tree
  expandedProps.forEach((p) => {
    makeProp(tree, p);
  });

  const preparePropertyName = (name: string): string => {
    return name.startsWith('_') ? name : camelcase(name);
  };

  const getNodes = (container: object): string => {
    let result = '';
    for (const node in container) {
      if (container.hasOwnProperty(node)) {
        if (result !== '') result += ' ';
        const nodeValue = container[node];
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
  return formId && typeof formId === 'string';
};

export const isFormFullName = (formId: FormIdentifier): formId is FormFullName => {
  return isDefined(formId) && typeof (formId) === 'object' && "name" in formId && typeof (formId.name) === 'string';
};

export const isSameFormIds = (id1: FormIdentifier, id2: FormIdentifier): boolean => {
  return (isFormRawId(id1) && isFormRawId(id2) && id1 === id2) ||
    (isFormFullName(id1) && isFormFullName(id2) && id1.module?.toLowerCase() === id2.module?.toLowerCase() && id1.name?.toLowerCase() === id2.name?.toLowerCase());
};

export const convertToMarkupWithSettings = (markup: FormMarkup, isSettingsForm?: boolean): FormMarkupWithSettings => {
  if (!markup) return null;
  const result = markup as FormMarkupWithSettings;
  if (result?.components && !!result.formSettings)
    if (typeof isSettingsForm === 'undefined') return result;
    else if (typeof isSettingsForm !== 'undefined' && isSettingsForm !== null) {
      result.formSettings.isSettingsForm = isSettingsForm;
      return result;
    }
  if (Array.isArray(markup)) return { components: markup, formSettings: { ...DEFAULT_FORM_SETTINGS, isSettingsForm } };

  return { components: [], formSettings: { ...DEFAULT_FORM_SETTINGS, isSettingsForm } };
};

export interface EvaluationContext {
  contextData: GenericDictionary;
  path: string;
  evaluationFilter?: (context: EvaluationContext, data: any) => boolean;
};
const evaluateRecursive = (data: any, evaluationContext: EvaluationContext): any => {
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
    const evaluatedObject = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        const memberPath = path ? `${path}.${key}` : key;
        evaluatedObject[key] = evaluateRecursive(data[key], { ...evaluationContext, path: memberPath });
      }
    }
    return evaluatedObject;
  }
  return data;
};

export const recursiveEvaluator = <TArguments = ActionParametersDictionary>(
  argumentsConfiguration: TArguments,
  evaluationContext: EvaluationContext,
): Promise<TArguments> => {
  if (!Boolean(argumentsConfiguration)) return Promise.resolve(null);

  return new Promise<TArguments>((resolve) => {
    const evaluated = evaluateRecursive(argumentsConfiguration, evaluationContext);
    resolve(evaluated as TArguments);
  });
};

export const genericActionArgumentsEvaluator = <TArguments = ActionParametersDictionary>(
  argumentsConfiguration: TArguments,
  evaluationData: GenericDictionary,
): Promise<TArguments> => {
  const evaluationContext: EvaluationContext = {
    contextData: evaluationData,
    path: '',
  };

  return recursiveEvaluator(argumentsConfiguration, evaluationContext);
};

/**
 * Convert action parameters definition to a runtime parameters
 */
export const getFormActionArguments = (
  params: ActionParameters,
  evaluationContext: GenericDictionary,
): Promise<ActionArguments> => {
  if (!Boolean(params)) return Promise.resolve({});

  if (typeof params === 'string') {
    try {
      const evaluationKeys = Object.keys(evaluationContext);
      evaluationKeys.push(params);

      const func = Function.apply(null, evaluationKeys);
      const evaluated = func(evaluationContext); // promise or value
      return Promise.resolve(evaluated);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  return new Promise<ActionArguments>((resolve) => {
    const dictionary = params as ActionParametersDictionary;
    const actionArgs = {};

    for (const parameterIdx in dictionary) {
      if (parameterIdx) {
        const parameter = dictionary[parameterIdx];

        // TODO: add promise support
        const value =
          typeof parameter?.value === 'string' ? evaluateString(parameter?.value, evaluationContext) : parameter?.value;

        if (value) {
          actionArgs[parameter?.key] = value;
        }
      }
    }
    resolve(actionArgs);
  });
};

type ComponentByTypePredicate = (component: IConfigurableFormComponent) => boolean;

export const getComponentNames = (components: IComponentsDictionary, predicate: ComponentByTypePredicate): string[] => {
  let componentNames: string[] = [];

  if (typeof predicate !== 'function') throw new Error('getComponentNames: predicate must be defined');

  Object.keys(components)?.forEach((key) => {
    let component = components[key];

    if (predicate(component)) {
      componentNames.push(component.propertyName);
    }
  });

  return componentNames;
};


/**
 * Converts the given form markup to a flat structure of configurable form components.
 *
 * @param {FormRawMarkup} markup - The form markup to convert.
 * @param {IFormSettings} formSettings - The form settings.
 * @param {IToolboxComponents} designerComponents - The designer components.
 * @return {IFlatComponentsStructure} The flat structure of configurable form components.
 */
export const convertFormMarkupToFlatStructure = (markup: FormRawMarkup, formSettings: IFormSettings, designerComponents: IToolboxComponents): IFlatComponentsStructure => {
  let components = getComponentsFromMarkup(markup);
  if (formSettings?.isSettingsForm)
    components = updateJsSettingsForComponents(designerComponents, components);
  const newFlatComponents = componentsTreeToFlatStructure(designerComponents, components);

  // migrate components to last version
  upgradeComponents(designerComponents, formSettings, newFlatComponents);

  return newFlatComponents;
};
