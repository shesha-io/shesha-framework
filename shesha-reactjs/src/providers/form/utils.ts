import { Rule, RuleObject } from 'antd/lib/form';
import Schema, { Rules, ValidateSource } from 'async-validator';
import camelcase from 'camelcase';
import Mustache from 'mustache';
import { nanoid } from '@/utils/uuid';
import nestedProperty from 'nested-property';
import { CSSProperties } from 'react';
import {
  ConfigurableFormInstance,
  IPropertySetting,
  IToolboxComponent,
  IToolboxComponentGroup,
  IToolboxComponents,
  SettingsMigrationContext,
} from '@/interfaces';
import { IPropertyMetadata } from '@/interfaces/metadata';
import { Migrator } from '@/utils/fluentMigrator/migrator';
import { getFullPath } from '@/utils/metadata';
import { IAnyObject } from './../../interfaces/anyObject';
import { FormMode } from '@/generic-pages/dynamic/interfaces';
import blankViewMarkup from './defaults/markups/blankView.json';
import dashboardViewMarkup from './defaults/markups/dashboardView.json';
import detailsViewMarkup from './defaults/markups/detailsView.json';
import formViewMarkup from './defaults/markups/formView.json';
import masterDetailsViewMarkup from './defaults/markups/masterDetailsView.json';
import menuViewMarkup from './defaults/markups/menuView.json';
import tableViewMarkup from './defaults/markups/tableView.json';
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
  IFormAction,
  IFormActions,
  IFormSection,
  IFormSections,
  IFormSettings,
  IFormValidationRulesOptions,
  EditMode,
  ROOT_COMPONENT_KEY,
  SILENT_KEY,
  ViewType,
} from './models';
import { isPropertySettings } from '@/designer-components/_settings/utils';
import {
  IDataContextManagerFullInstance,
  IDataContextsData,
  RootContexts,
  useDataContextManager,
} from '@/providers/dataContextManager';
import moment from 'moment';
import { message } from 'antd';
import { ISelectionProps } from '@/providers/dataTable/contexts';
import { ContextGetData, useDataContext } from '@/providers/dataContextProvider/contexts';
import {
  IConfigurableActionConfiguration,
  useDataTableStore,
  useForm,
  useFormData,
  useGlobalState,
  useSheshaApplication,
} from '@/providers';
import { axiosHttp } from '@/utils/fetchers';
import { AxiosInstance } from 'axios';
import { MessageInstance } from 'antd/es/message/interface';
import { executeFunction } from '@/utils';
import { ISetFormDataPayload } from './contexts';
import { StandardNodeTypes } from '@/interfaces/formComponent';
import { SheshaActionOwners } from '../configurableActionsDispatcher/models';
import { IParentProviderProps } from '../parentProvider/index';
import { SheshaCommonContexts } from '../dataContextManager/models';

/** Interface to geat all avalilable data */
export interface IApplicationContext {
  contextManager?: IDataContextManagerFullInstance;
  /** Form data */
  data?: any;
  /** Form mode */
  formMode?: FormMode;

  setFormData?: (payload: ISetFormDataPayload) => void;

  form?: ConfigurableFormInstance;
  /** Contexts datas */
  contexts: IDataContextsData;
  /** Global state */
  globalState: any;
  /** Table selection */
  selectedRow: ISelectionProps;
  /** Moment function */
  moment: Function;
  /** Axios Http */
  http: AxiosInstance;
  /** Message API */
  message: MessageInstance;
  /** Other data */
  [key: string]: any;
}

export function useFormProviderContext(): IApplicationContext {
  const { backendUrl } = useSheshaApplication();
  const dcm = useDataContextManager(false);
  const { globalState, setState: setGlobalState } = useGlobalState();
  return {
    contextManager: dcm,
    contexts: { ...dcm?.getDataContextsData('all') },
    globalState,
    setGlobalState,
    selectedRow: useDataTableStore(false)?.selectedRow,
    moment: moment,
    http: axiosHttp(backendUrl),
    message,
  };
}

export function useAvailableConstantsData(topContextId?: string): IApplicationContext {
  let tcId = useDataContext(false)?.id;
  tcId = topContextId || tcId;
  const { backendUrl } = useSheshaApplication();
  const dcm = useDataContextManager(false);
  const form = useForm(false) ?? dcm.getFormInstance();
  const { globalState, setState: setGlobalState } = useGlobalState();

  const application = dcm?.getDataContext(SheshaCommonContexts.ApplicationContext);
  const applicationData = application?.getData();

  return {
    application: applicationData,
    data: useFormData()?.data,
    formContext: form?.formContext,
    contexts: { ...dcm?.getDataContextsData(tcId) },
    setFormData: form?.setFormData,
    formMode: form?.formMode,
    globalState,
    setGlobalState,
    form,
    selectedRow: useDataTableStore(false)?.selectedRow,
    moment: moment,
    http: axiosHttp(backendUrl),
    message,
  };
}

export const useApplicationContextData = (): ContextGetData => {
  const dcm = useDataContextManager(false);
  const application = dcm?.getDataContext(SheshaCommonContexts.ApplicationContext);
  return application?.getData();
};

const getSettingValue = (value: any, allData: any, calcFunction: (setting: IPropertySetting, allData: any) => any) => {
  if (!value) return value;

  if (typeof value === 'object') {
    // If array - update all items
    if (Array.isArray(value)) {
      return value;
      // ToDo: infinity loop
      /*
      if (value.length === 0) return value;
      const v = value.map((x) => {
        return getActualModel(x, allData);
      });
      return v;
      */
    }

    // update setting value to actual
    if (isPropertySettings(value)) {
      switch(value._mode){
        case 'code':
          return Boolean(value._code) ? calcFunction(value, allData) : undefined;
        case 'value':
          return value._value;
      }
    }

    // update nested objects
    /* eslint-disable-next-line @typescript-eslint/no-use-before-define */
    return getActualModel(value, allData);
  }
  return value;
};

const getValue = (val: any, allData: any, calcValue: (setting: IPropertySetting, allData: any) => Function) => {
  return getSettingValue(val, allData, calcValue);
};

const calcValue = (setting: IPropertySetting, allData: any) => {
  const getSettingValue = (val: any) => getValue(val, allData, calcValue);
  try {
    let vars = 'staticValue, getSettingValue';
    const datas = [setting?._value, getSettingValue];
    if (allData)
      for (let key in allData) {
        if (Object.hasOwn(allData, key)) {
          vars += `, ${key}`;
          datas.push(allData[key]);
        }
      }
    const res = new Function(vars, setting?._code)(...datas);
    return res;
  } catch(error) {
    console.error("calcValue failed", error);
    return undefined;
  }
};

export const getReadOnlyBool = (editMode: EditMode, parentReadOnly: boolean) => {
  return (
    editMode === false || // check exact condition
    editMode === 'readOnly' ||
    ((editMode === 'inherited' || editMode === undefined || editMode === true) && // check exact condition
      parentReadOnly)
  );
};

/**
 * Convert model to values calculated from JS code if provided (for each fields)
 *
 * @param model - model
 * @param allData - all form, contexts data and other data/objects/functions needed to calculate Actual Model
 * @returns - converted model
 */
export const getActualModel = <T>(model: T, allData: any, parentReadOnly: boolean = undefined): T => {
  const m = {} as T;
  for (var propName in model) {
    if (!model.hasOwnProperty(propName)) continue;
    m[propName] = getSettingValue(model[propName], allData, calcValue);
  }

  const readOnly = typeof parentReadOnly === 'undefined' ? allData?.formMode === 'readonly' : parentReadOnly;

  // update ReadOnly if exists
  if (m.hasOwnProperty('editMode')) m['readOnly'] = getReadOnlyBool(m['editMode'], readOnly);

  return m;
};

export const isCommonContext = (name: string): boolean => {
  const r = RootContexts;
  return r.filter(i => i === name)?.length > 0;
};

const updateConfigurableActionParent = (model: any, parentId: string) => {
  for (const key in model) {
    if (model.hasOwnProperty(key) && typeof model[key] === 'object') {
      const config = model[key] as IConfigurableActionConfiguration;

      if (config?._type === StandardNodeTypes.ConfigurableActionConfig) {
        // skip SheshaActionOwners actions since they are common
        if (Object.values(SheshaActionOwners).filter(i => i === config.actionOwner)?.length > 0)
          continue;
        model[key] = { ...config, actionOwner: `${parentId}.${config.actionOwner}` };
      } else {
        updateConfigurableActionParent(config, parentId);
      }
    }
  }
};

export const getActualModelWithParent = <T>(
  model: T,
  allData: any,
  parent: IParentProviderProps
): T => {
  const parentReadOnly =
    allData.formMode !== 'designer' 
    && (parent?.model?.readOnly ?? (parent?.formMode === 'readonly' || allData.formMode === 'readonly'));
    
  const actualModel = getActualModel(model, allData, parentReadOnly);
  // update Id for complex containers (SubForm, DataList item, etc)
  if (!!parent?.subFormIdPrefix) {
    actualModel['id'] = `${parent?.subFormIdPrefix}.${actualModel['id']}`;
    actualModel['parentId'] = `${parent?.subFormIdPrefix}.${actualModel['parentId']}`;
    actualModel['componentName'] = !!parent?.model?.componentName
      ? `${parent?.model?.componentName}.${actualModel['componentName']}`
      : actualModel['componentName'];

    actualModel['context'] =
      !!actualModel['context']
        && parent?.context !== actualModel['context'] // If the subForm has the same context then don't update context name
        && !isCommonContext(actualModel['context']) // If a common context then don't update context name
        ? `${parent?.subFormIdPrefix}.${actualModel['context']}`
        : actualModel['context'];
    updateConfigurableActionParent(actualModel, parent?.subFormIdPrefix);
  }
  return actualModel;
};

export const getActualPropertyValue = <T>(model: T, allData: any, propertyName: string) => {
  return { ...model, [propertyName]: getSettingValue(model[propertyName], allData, calcValue) } as T;
};

/**
 * Convert components tree to flat structure.
 * In flat structure we store components settings and their relations separately:
 * allComponents - dictionary (key:value) of components. key - Id of the component, value - conponent settings
 * componentRelations - dictionary of component relations. key - id of the container, value - ordered list of subcomponent ids
 */
export const componentsTreeToFlatStructure = (
  toolboxComponents: IToolboxComponents,
  components: IConfigurableFormComponent[]
): IFlatComponentsStructure => {
  const result: IFlatComponentsStructure = {
    allComponents: {},
    componentRelations: {},
  };

  const processComponent = (component: IConfigurableFormComponent, parentId?: string) => {
    // prepare component runtime
    result.allComponents[component.id] = {
      ...component,
      parentId,
      //visibilityFunc: getCustomVisibilityFunc(component),
      //enabledFunc: getCustomEnabledFunc(component),
    };

    const level = result.componentRelations[parentId] || [];
    level.push(component.id);
    result.componentRelations[parentId] = level;

    if (component.type) {
      const componentRegistration = toolboxComponents[component.type];

      // custom containers
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
  isNew?: boolean
) => {
  if (!definition.migrator) return componentModel;

  const migrator = new Migrator<IConfigurableFormComponent, IConfigurableFormComponent>();
  const fluent = definition.migrator(migrator);
  if (componentModel.version === undefined) componentModel.version = -1;
  const model = fluent.migrator.upgrade(componentModel, {
    isNew,
    formSettings,
    flatStructure,
    componentId: componentModel.id,
  });
  return model;
};

export const upgradeComponents = (
  toolboxComponents: IToolboxComponents,
  formSettings: IFormSettings,
  flatStructure: IFlatComponentsStructure,
  isNew?: boolean
) => {
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

export const getClosestComponent = (componentId: string, context: SettingsMigrationContext, componentType: string) => {
  let component = context.flatStructure.allComponents[componentId];
  do {
    component = component?.parentId ? context.flatStructure.allComponents[component.parentId] : null;
  } while (component && component.type !== componentType);

  return component?.type === componentType ? component : null;
};

export const getClosestTableId = (context: SettingsMigrationContext) => {
  const table = getClosestComponent(context.componentId, context, 'datatableContext');
  return table ? table['uniqueStateId'] ?? table.propertyName : null;
};

//#endregion

/** Convert flat components structure to a component tree */
export const componentsFlatStructureToTree = (
  toolboxComponents: IToolboxComponents,
  flat: IFlatComponentsStructure
): IConfigurableFormComponent[] => {
  const tree: IConfigurableFormComponent[] = [];

  const processComponent = (container: IConfigurableFormComponent[], ownerId: string) => {
    const componentIds = flat.componentRelations[ownerId];

    if (!componentIds) return;

    // iterate all component ids on the current level
    componentIds.forEach((id) => {
      // extract current component and add to hierarchy
      const component = { ...flat.allComponents[id] };
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
          const childContainers = component[containerName]
            ? Array.isArray(component[containerName])
              ? (component[containerName] as IComponentsContainer[])
              : [component[containerName] as IComponentsContainer]
            : undefined;
          if (childContainers) {
            childContainers.forEach((c) => {
              const childComponents: IConfigurableFormComponent[] = [];
              processComponent(childComponents, c.id);
              c.components = childComponents;
            });
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
  components: IConfigurableFormComponent[]
): IConfigurableFormComponent[] => {
  const flatStructure = componentsTreeToFlatStructure(toolboxComponents, components);
  upgradeComponents(toolboxComponents, formSettings, flatStructure);
  return componentsFlatStructureToTree(toolboxComponents, flatStructure);
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
export const evaluateString = (template: string = '', data: any) => {
  const localData: IAnyObject = data ? { ...data } : undefined;
  // The function throws an exception if the expression passed doesn't have a corresponding curly braces
  try {
    if (localData) {
      //adding a function to the data object that will format datetime

      localData.dateFormat = function () {
        return function (timestamp, render) {
          return new Date(render(timestamp).trim()).toLocaleDateString('en-us', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
          });
        };
      };
    }
    return template && typeof template === 'string' ? Mustache.render(template, localData ?? {}) : template;
  } catch (error) {
    console.warn('evaluateString ', error);
    return template;
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
export const evaluateComplexString = (expression: string, mappings: IMatchData[]) => {
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

//newer versions
export const evaluateComplexStringWithResult = (
  expression: string,
  mappings: IMatchData[],
  requireNonEmptyResult: boolean
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

export const getVisibilityFunc2 = (expression, name) => {
  if (expression) {
    try {
      const customVisibilityExecutor = expression ? new Function('data, context, formMode', expression) : null;

      const getIsVisible = (data = {}, context = {}, formMode = '') => {
        if (customVisibilityExecutor) {
          try {
            return customVisibilityExecutor(data, context, formMode);
          } catch (e) {
            console.warn(`Custom Visibility of ${name} throws exception: ${e}`);
            return true;
          }
        }

        return true;
      };

      return getIsVisible;
    } catch (e) {
      return () => {
        console.warn(`Incorrect syntax of the 'Custom Visibility', component: ${name}, error: ${e}`);
      };
    }
  } else return () => true;
};

export interface IExpressionExecuterArguments {
  [key: string]: any;
}
export type IExpressionExecuterFailedHandler<TResult> = (error: any) => TResult;
export function executeExpression<TResult>(
  expression: string,
  expressionArgs: IExpressionExecuterArguments,
  defaultValue: TResult,
  onFail: IExpressionExecuterFailedHandler<TResult>
): TResult {
  if (expression) {
    try {
      let argsDefinition = '';
      const argList: any[] = [];
      for (const argumentName in expressionArgs) {
        if (expressionArgs.hasOwnProperty(argumentName)) {
          argsDefinition += (argsDefinition ? ', ' : '') + argumentName;
          argList.push(expressionArgs[argumentName]);
        }
      }

      const expressionExecuter = new Function(argsDefinition, expression);

      return expressionExecuter.apply(null, argList);
    } catch (e) {
      if (!!onFail)
        return onFail(e);
    }
  }
  return defaultValue;
}

export const isPropertySetting = <Value = any>(value: any): value is IPropertySetting<Value> => {
  const typed = value as IPropertySetting<Value>;
  return typed && typeof (typed) === 'object'
    && typed._mode
    && typeof (typed._mode) === 'string'
    && (typed._mode === 'code' || typed._mode === 'value');
};

interface FunctionArgument {
  name: string;
  description?: string;
}
export type FunctionExecutor<TResult = any> = (...args: any) => TResult;
export const getFunctionExecutor = <TResult = any>(
  expression: string,
  expressionArguments: FunctionArgument[]): FunctionExecutor<TResult> => {

  if (!expression) throw new Error('Expression must be defined');

  const argumentsList = (expressionArguments ?? []).map(a => a.name).join(", ");

  const expressionExecuter = new Function(argumentsList, expression);
  return expressionExecuter as FunctionExecutor<TResult>;
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

export function executeScript<TResult = any>(
  expression: string,
  expressionArgs: IExpressionExecuterArguments
): Promise<TResult> {
  return new Promise<TResult>((resolve, reject) => {
    if (!expression) reject('Expression must be defined');

    try {
      let argsDefinition = '';
      const argList: any[] = [];
      for (const argumentName in expressionArgs) {
        if (expressionArgs.hasOwnProperty(argumentName)) {
          argsDefinition += (argsDefinition ? ', ' : '') + argumentName;
          argList.push(expressionArgs[argumentName]);
        }
      }

      const asyncFn = new AsyncFunction(argsDefinition, expression);
      const result = asyncFn.apply(null, argList);
      resolve(result);
    } catch (e) {
      reject(e);
    }
  });
}

export function executeScriptSync<TResult = any>(expression: string, context: IExpressionExecuterArguments): TResult {
  if (!expression) throw new Error('Expression must be defined');

  try {
    const functionBody = `
    with(context) {
      ${expression}
    }
  `;
    const dynamicFunction = new Function('context', functionBody);
    return dynamicFunction(context);
  } catch (error) {
    console.error(`executeScriptSync error`, error);
    return null;
  }
}

/**
 * Return ids of visible components according to the custom visibility
 */
export const getVisibleComponentIds = (
  components: IComponentsDictionary,
  allData: IApplicationContext,
  filteredComponents?: string[]
): string[] => {
  const visibleComponents: string[] = [];
  for (const key in components) {
    if (components.hasOwnProperty(key)) {
      const component = components[key] as IConfigurableFormComponent;

      if (filteredComponents?.includes(component.id)
        && !getActualPropertyValue(component, allData, 'hidden')?.hidden
        && (component.visibilityFunc == null || component.visibilityFunc(allData.data, allData.globalState, allData.formMode)))
        visibleComponents.push(key);
    }
  }
  return visibleComponents;
};

const isComponentFiltered = (
  component: IConfigurableFormComponent,
  propertyFilter?: (name: string) => boolean
): boolean => {
  if (propertyFilter && component.propertyName) {
    const filteredOut = propertyFilter(component.propertyName);
    if (filteredOut === false) return false;
  }
  return true;
};

/**
 * Return ids of filtered components according to the custom visibility
 */
export const getFilteredComponentIds = (
  components: IComponentsDictionary,
  propertyFilter?: (name: string) => boolean
): string[] => {
  const visibleComponents: string[] = [];
  for (const key in components) {
    if (components.hasOwnProperty(key)) {
      const component = components[key] as IConfigurableFormComponent;

      if (isComponentFiltered(component, propertyFilter))
        visibleComponents.push(key);
    }
  }
  return visibleComponents;
};

/**
 * Return ids of enabled components according to the custom enabled
 */
export const getEnabledComponentIds = (components: IComponentsDictionary, allData: IApplicationContext): string[] => {
  const enabledComponents: string[] = [];
  for (const key in components) {
    if (components.hasOwnProperty(key)) {
      const component = components[key] as IConfigurableFormComponent;
      const readOnly = getReadOnlyBool(getActualPropertyValue(component, allData, 'editMode')?.editMode, false); // use false because components will use parent enabled by default
      const isEnabled =
        !readOnly &&
        (!Boolean(component?.enabledFunc) ||
          (typeof component?.enabledFunc === 'function' &&
            component?.enabledFunc(allData.data, allData.globalState, allData.formMode)));

      if (isEnabled) enabledComponents.push(key);
    }
  }
  return enabledComponents;
};

/**
 * Return field name for the antd form by a given expression
 *
 * @param expression field name in dot notation e.g. 'supplier.name' or 'fullName'
 */
export const getFieldNameFromExpression = (expression: string) => {
  if (!expression) return '';

  return expression.includes('.') ? expression.split('.') : expression;
};

export const getBoolean = (value: any) => {
  if (typeof value == 'boolean') {
    return value;
  } else if (value?.toLowerCase() === 'true') {
    return true;
  }
  return false;
};

export const hasBoolean = (value: any) => {
  if (typeof value == 'boolean') {
    return true;
  } else if (typeof value == 'string') {
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
export const getValidationRules = (component: IConfigurableFormComponent, options?: IFormValidationRulesOptions) => {
  const { validate } = component;
  const rules: Rule[] = [];

  // todo: implement more generic way (e.g. using validation providers)

  if (validate) {
    if (validate.required)
      rules.push({
        required: true,
        message: validate?.message || 'This field is required',
      });

    if (validate.minValue)
      rules.push({
        min: validate.minValue,
        type: 'number',
      });

    if (validate.maxValue)
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
            options?.formData
          ),
      });
  }

  return rules;
};

const DICTIONARY_ACCESSOR_REGEX = /(^[\s]*\{(?<key>[\w]+)\.(?<accessor>[^\}]+)\}[\s]*$)/;
const NESTED_ACCESSOR_REGEX = /((?<key>[\w]+)\.(?<accessor>[^\}]+))/;

/**
 * Evaluates an string expression and returns the evaluated value.
 *
 * Example: Given
 *  let const person = { name: 'First', surname: 'Last' };
 *  let expression = 'Full name is {{name}} {{surname}}';
 *
 * evaluateExpression(expression, person) will display 'Full name is First Last';
 *
 * @param expression the expression to evaluate
 * @param data the data to use to evaluate the expression
 * @returns
 */
export const evaluateStringLiteralExpression = (expression: string, data: any) => {
  return expression.replace(/\$\{(.*?)\}/g, (_, token) => nestedProperty.get(data, token));
};

/**
 * Evaluates an string expression and returns the evaluated value.
 *
 * Example: Given
 *  let const person = { name: 'First', surname: 'Last' };
 *  let expression = 'Full name is {{name}} {{surname}}';
 *
 * evaluateExpression(expression, person) will display 'Full name is First Last';
 *
 * @param expression the expression to evaluate
 * @param data the data to use to evaluate the expression
 * @returns
 */

export const evaluateExpression = (expression, data: any) => {
  return expression.replace(/\{\{(.*?)\}\}/g, (_, token) => nestedProperty.get(data, token)) as string;
};

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

const evaluateValueInternal = (value: string, dictionary: any, isRoot: boolean) => {
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

    // console.log({
    //   msg: 'regex parsed',
    //   key: match.groups.key,
    //   accessor: match.groups.accessor,
    //   evaluatedValue,
    // });

    return evaluatedValue;
  }
};

export const evaluateValue = (value: string, dictionary: any) => {
  return evaluateValueInternal(value, dictionary, true);
};

const TAGS_REGEX = /{(?<key>[\w]+)\.(?<accessor>[^\}]+)\}/;

export const replaceTags = (value: string, dictionary: any) => {
  if (!value) return value;

  const match = value.match(TAGS_REGEX);
  if (!match) return value;

  if (!dictionary) return null;

  const result = value.replace(TAGS_REGEX, (_match, key, accessor) => {
    const container = dictionary[key] || {};
    return container[accessor] || '';
  });

  return result;
};

export const convertActions = (ownerId: string, actions: IFormActions): IFormAction[] => {
  const result: IFormAction[] = [];
  for (const key in actions) {
    if (actions.hasOwnProperty(key)) {
      result.push({
        owner: ownerId,
        name: key,
        body: actions[key],
      });
    }
  }
  return result;
};

export const convertSectionsToList = (ownerId: string, sections: IFormSections): IFormSection[] => {
  const result: IFormSection[] = [];
  for (const key in sections) {
    if (sections.hasOwnProperty(key)) {
      result.push({
        owner: ownerId,
        name: key,
        body: sections[key],
      });
    }
  }

  return result;
};

export const findToolboxComponent = (
  availableComponents: IToolboxComponentGroup[],
  predicate: (component: IToolboxComponent) => boolean
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
  components.forEach((component) => {
    rules[component.propertyName] = getValidationRules(component) as [];
  });

  return rules;
};

export const validateConfigurableComponentSettings = (markup: FormMarkup, values: ValidateSource): Promise<void> => {
  const rules = getFormValidationRules(markup);
  const validator = new Schema(rules);

  return validator.validate(values);
};

export function listComponentToModelMetadata<TModel extends IConfigurableFormComponent>(
  component: IToolboxComponent<TModel>,
  model: TModel,
  metadata: IPropertyMetadata
): TModel {
  let mappedModel = model;

  // map standard properties
  if (metadata.label) mappedModel.label = metadata.label;
  if (metadata.description) mappedModel.description = metadata.description;

  // map configurable properties
  if (metadata.readonly === true) mappedModel.readOnly = true;
  if (metadata.isVisible === false) mappedModel.hidden = true;
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

const getContainerNames = (toolboxComponent: IToolboxComponent): string[] => {
  const containers = [...(toolboxComponent.customContainerNames ?? [])];
  if (!containers.includes('components')) containers.push('components');
  return containers;
};

export type ProcessingFunc = (child: IConfigurableFormComponent, parentId: string) => void;

export const processRecursive = (
  componentsRegistration: IToolboxComponentGroup[],
  parentId: string,
  component: IConfigurableFormComponent,
  func: ProcessingFunc
) => {
  func(component, parentId);

  const toolboxComponent = findToolboxComponent(componentsRegistration, (c) => c.type === component.type);
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
  components: IConfigurableFormComponent[]
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

export const getDefaultFormMarkup = (type: ViewType = 'blank') => {
  switch (type) {
    case 'blank':
      return blankViewMarkup;
    case 'dashboard':
      return dashboardViewMarkup;
    case 'details':
      return detailsViewMarkup;
    case 'form':
      return formViewMarkup;
    case 'masterDetails':
      return masterDetailsViewMarkup;
    case 'menu':
      return menuViewMarkup;
    case 'table':
      return tableViewMarkup;
    default:
      return blankViewMarkup;
  }
};
export const createComponentModelForDataProperty = (
  components: IToolboxComponentGroup[],
  propertyMetadata: IPropertyMetadata,
  migrator?: (
    componentModel: IConfigurableFormComponent,
    toolboxComponent: IToolboxComponent<any>
  ) => IConfigurableFormComponent
): IConfigurableFormComponent => {
  const toolboxComponent = findToolboxComponent(
    components,
    (c) =>
      Boolean(c.dataTypeSupported) &&
      c.dataTypeSupported({ dataType: propertyMetadata.dataType, dataFormat: propertyMetadata.dataFormat })
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
    //parentId: containerId,
    hidden: false,
    visibilityFunc: (_data) => true,
    isDynamic: false,
    validate: {},
  };
  if (toolboxComponent.initModel) componentModel = toolboxComponent.initModel(componentModel);

  if (toolboxComponent.migrator && migrator) componentModel = migrator(componentModel, toolboxComponent);

  componentModel = listComponentToModelMetadata(toolboxComponent, componentModel, propertyMetadata);

  return componentModel;
};

interface IKeyValue {
  key: string;
  value: string;
}

export const evaluateKeyValuesToObject = (arr: IKeyValue[], data: any): IAnyObject => {
  const queryParamObj: IAnyObject = {};

  if (arr?.length) {
    arr?.forEach(({ key, value }) => {
      if (key?.length && value.length) {
        queryParamObj[key] = evaluateString(value, data);
      }
    });

    return queryParamObj;
  }

  return {};
};

export interface IMatchData {
  match: string;
  data: any;
}

export const getMatchData = (dictionary: IMatchData[], name: string): any => {
  const item = dictionary.find((i) => i.match === name);
  return item?.data;
};

const convertToKeyValues = (obj: IAnyObject): IKeyValue[] => {
  return Object.keys(obj).map((key) => ({
    key,
    value: obj[key],
  }));
};

export const evaluateKeyValuesToObjectMatchedData = <T extends any>(
  obj: IKeyValue[] | IAnyObject,
  matches: IMatchData[]
): T => {
  const queryParamObj: IAnyObject = {};

  if (!obj) {
    return {} as T;
  }

  const valuesArray = Array.isArray(obj) ? obj : convertToKeyValues(obj);

  if (valuesArray?.length) {
    valuesArray?.forEach(({ key, value }) => {
      if (key?.length && value.length) {
        let matchedKey = '';

        const data =
          matches?.find(({ match }) => {
            const isMatch = value?.includes(match);

            if (isMatch) {
              matchedKey = match;
            }

            return isMatch;
          })?.data || {};

        queryParamObj[key] = evaluateString(value, matchedKey ? { [matchedKey]: data } : data);
      }
    });

    return queryParamObj as T;
  }

  return {} as T;
};

export const getObjectWithOnlyIncludedKeys = (obj: IAnyObject, includedProps: string[]): IAnyObject => {
  const response: IAnyObject = {};

  if (includedProps?.length) {
    includedProps?.forEach((key) => {
      if (obj[key]) {
        response[key] = obj[key];
      }
    });
  }

  return response;
};

export const pickStyleFromModel = (model: IConfigurableFormComponent, ...args: any[]): { [key: string]: any } => {
  let style = {};

  if (!args.length) {
    args = [
      'paddingTop',
      'paddingRight',
      'paddingBottom',
      'paddingLeft',
      'marginTop',
      'marginRight',
      'marginBottom',
      'marginLeft',
    ];
  }

  if (model) {
    args.forEach((arg) => {
      if (model[arg]) style = { ...style, [arg]: `${model[arg]}px` };
    });
  }

  return style;
};

export const getStyle = (
  style: string,
  formData: any = {},
  globalState: any = {},
  defaultStyle: object = {}
): CSSProperties => {
  if (!style) return defaultStyle;
  // tslint:disable-next-line:function-constructor
  return new Function('data, globalState', style)(formData, globalState);
};

export const getLayoutStyle = (model: IConfigurableFormComponent, args: { [key: string]: any }) => {
  const styling = JSON.parse(model?.stylingBox || '{}');
  let style = pickStyleFromModel(styling);

  try {
    return { ...style, ...(executeFunction(model?.style, args) || {}) };
  } catch (_e) {
    return style;
  }
};

export const getString = (expression: string, formData: any = {}, globalState: any = {}): string => {
  if (!expression) return null;
  return new Function('data, globalState', expression)(formData, globalState);
};
export const filterFormData = (data: any) => {
  if (typeof data === 'object' && Object.getOwnPropertyNames(data || {}).length) {
    return Object.entries(data)
      .filter(([k]) => !k.startsWith(SILENT_KEY))
      .reduce((accum, [k, v]) => {
        accum[k] = v;
        return accum;
      }, {});
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

  const makeProp = (container: object, name: string) => {
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

export const asFormRawId = (formId: FormIdentifier): FormUid | undefined => {
  return formId && typeof formId === 'string' ? (formId as FormUid) : undefined;
};

export const asFormFullName = (formId: FormIdentifier): FormFullName | undefined => {
  return formId && Boolean((formId as FormFullName)?.name) ? (formId as FormFullName) : undefined;
};

export const hasFormIdGotValue = (formId: FormIdentifier) => (typeof formId === 'string' ? !!formId : !!formId?.name);

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
  evaluationContext: EvaluationContext
): Promise<TArguments> => {
  if (!Boolean(argumentsConfiguration)) return Promise.resolve(null);

  return new Promise<TArguments>((resolve) => {
    const evaluated = evaluateRecursive(argumentsConfiguration, evaluationContext);
    resolve(evaluated as TArguments);
  });
};

export const genericActionArgumentsEvaluator = <TArguments = ActionParametersDictionary>(
  argumentsConfiguration: TArguments,
  evaluationData: GenericDictionary
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
  evaluationContext: GenericDictionary
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

        // todo: add promise support
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

export const executeCustomExpression = (expression: string, returnBoolean = false, formData = {}, globalState = {}) => {
  if (!expression) {
    if (returnBoolean) {
      return true;
    } else {
      console.error('Expected expression to be defined but it was found to be empty.');

      return false;
    }
  }

  /* tslint:disable:function-constructor */
  const evaluated = new Function('data, globalState', expression)(formData, globalState);

  // tslint:disable-next-line:function-constructor
  return typeof evaluated === 'boolean' ? evaluated : true;
};

export const executeCustomExpressionV2 = (expression: string, context: any, returnBoolean = false) => {
  if (!expression) {
    if (returnBoolean) {
      return true;
    } else {
      console.error('Expected expression to be defined but it was found to be empty.');

      return false;
    }
  }

  /* tslint:disable:function-constructor */
  const evaluated = new Function(Object.keys(context)?.join(','), expression)(...Object.values(context));

  // tslint:disable-next-line:function-constructor
  return typeof evaluated === 'boolean' ? evaluated : true;
};

type ComponentByTypePredicate = (component: IConfigurableFormComponent) => boolean;

export const getComponentNames = (components: IComponentsDictionary, predicate: ComponentByTypePredicate) => {
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
