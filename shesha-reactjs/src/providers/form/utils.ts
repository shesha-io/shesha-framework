import { IAnyObject } from './../../interfaces/anyObject';
import {
  IFlatComponentsStructure,
  IConfigurableFormComponent,
  ROOT_COMPONENT_KEY,
  IComponentsDictionary,
  IComponentsContainer,
  IFormActions,
  IFormAction,
  FormMarkup,
  FormMarkupWithSettings,
  IFormSection,
  IFormSections,
  ViewType,
  IFormValidationRulesOptions,
  SILENT_KEY,
  FormIdentifier,
  FormFullName,
  FormUid,
  IFormSettings,
  DEFAULT_FORM_SETTINGS,
  ActionArguments,
  ActionParameters,
  ActionParametersDictionary,
  GenericDictionary,
} from './models';
import Mustache from 'mustache';
import {
  ITableColumn,
  IToolboxComponent,
  IToolboxComponentGroup,
  IToolboxComponents,
  SettingsMigrationContext,
} from '../../interfaces';
import Schema, { Rules, ValidateSource } from 'async-validator';
import { IPropertyMetadata } from '../../interfaces/metadata';
import { nanoid } from 'nanoid';
import { Rule, RuleObject } from 'antd/lib/form';
import nestedProperty from 'nested-property';
import { getFullPath } from '../../utils/metadata';
import blankViewMarkup from './defaults/markups/blankView.json';
import dashboardViewMarkup from './defaults/markups/dashboardView.json';
import detailsViewMarkup from './defaults/markups/detailsView.json';
import formViewMarkup from './defaults/markups/formView.json';
import masterDetailsViewMarkup from './defaults/markups/masterDetailsView.json';
import menuViewMarkup from './defaults/markups/menuView.json';
import tableViewMarkup from './defaults/markups/tableView.json';
import { useSheshaApplication } from '..';
import { CSSProperties, useMemo } from 'react';
import camelcase from 'camelcase';
import defaultToolboxComponents from './defaults/toolboxComponents';
import { Migrator } from '../../utils/fluentMigrator/migrator';

/**
 * Convert components tree to flat structure.
 * In flat structure we store components settings and their relations separately:
 *    allComponents - dictionary (key:value) of components. key - Id of the component, value - conponent settings
 *    componentRelations - dictionary of component relations. key - id of the container, value - ordered list of subcomponent ids
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
      visibilityFunc: getCustomVisibilityFunc(component),
      enabledFunc: getCustomEnabledFunc(component),
    };

    const level = result.componentRelations[parentId] || [];
    level.push(component.id);
    result.componentRelations[parentId] = level;

    if (component.type) {
      const componentRegistration = toolboxComponents[component.type];

      // custom containers
      const customContainerNames = componentRegistration?.customContainerNames || [];
      let subContainers: IComponentsContainer[] = [];
      customContainerNames.forEach(containerName => {
        const containers = component[containerName] as IComponentsContainer[];
        if (containers) subContainers = [...subContainers, ...containers];
      });
      if (component['components']) subContainers.push({ id: component.id, components: component['components'] });

      subContainers.forEach(subContainer => {
        if (subContainer && subContainer.components) {
          subContainer.components.forEach(c => {
            processComponent(c, subContainer.id);
          });
        }
      });
    }
  };

  if (components) {
    components.forEach(component => {
      processComponent(component, ROOT_COMPONENT_KEY);
    });
  }

  return result;
};

export const upgradeComponents = (toolboxComponents: IToolboxComponents, flatStructure: IFlatComponentsStructure) => {
  const { allComponents } = flatStructure;
  for (const key in allComponents) {
    if (allComponents.hasOwnProperty(key)) {
      const component = allComponents[key] as IConfigurableFormComponent;

      const componentDefinition = toolboxComponents[component.type];
      if (componentDefinition) {
        allComponents[key] = upgradeComponent(component, componentDefinition, flatStructure);
      }
    }
  }
};

export const upgradeComponentsTree = (
  toolboxComponents: IToolboxComponents,
  components: IConfigurableFormComponent[]
): IConfigurableFormComponent[] => {
  const flatStructure = componentsTreeToFlatStructure(toolboxComponents, components);
  upgradeComponents(toolboxComponents, flatStructure);
  return componentsFlatStructureToTree(toolboxComponents, flatStructure);
};

export const upgradeComponent = (
  componentModel: IConfigurableFormComponent,
  definition: IToolboxComponent,
  flatStructure: IFlatComponentsStructure
) => {
  if (!definition.migrator) return componentModel;

  const migrator = new Migrator<IConfigurableFormComponent, IConfigurableFormComponent>();
  const fluent = definition.migrator(migrator);
  if (componentModel.version === undefined) componentModel.version = -1;
  const model = fluent.migrator.upgrade(componentModel, { flatStructure, componentId: componentModel.id });
  return model;
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
  return table ? table['uniqueStateId'] ?? table.name : null;
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
    componentIds.forEach(id => {
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
        customContainers.forEach(containerName => {
          const childContainers = component[containerName] as IComponentsContainer[];

          if (childContainers) {
            childContainers.forEach(c => {
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

export const getCustomVisibilityFunc = ({ customVisibility, name }: IConfigurableFormComponent) => {
  if (customVisibility) {
    try {
      /* tslint:disable:function-constructor */

      const customVisibilityExecutor = new Function('value, data', customVisibility);

      const getIsVisible = (data = {}) => {
        try {
          return customVisibilityExecutor(data?.[name], data);
        } catch (e) {
          console.warn(`Custom Visibility of field ${name} throws exception: ${e}`);
          return true;
        }
      };

      return getIsVisible;
    } catch (e) {
      return () => {
        console.warn(`Incorrect syntax of the 'Custom Visibility', field name: ${name}, error: ${e}`);
      };
    }
  } else return () => true;
};

export const getCustomEnabledFunc = ({ customEnabled, name }: IConfigurableFormComponent) => {
  if (customEnabled) {
    try {
      const customEnabledExecutor = new Function('value, data', customEnabled);

      const getIsEnabled = (data = {}) => {
        try {
          return customEnabledExecutor(data?.[name], data);
        } catch (e) {
          console.error(`Custom Enabled of field ${name} throws exception: ${e}`);
          return true;
        }
      };

      return getIsEnabled;
    } catch (e) {
      return () => {
        console.warn(`Incorrect syntax of the 'Custom Enabled', field name: ${name}, error: ${e}`);
      };
    }
  } else return () => true;
};

/**
 * Evaluates the string using Mustache template.
 *
 * Given a the below expression
 *  const expression =  'My name is {{name}}';
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

      localData.dateFormat = function() {
        return function(timestamp, render) {
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

  Array.from(matches).forEach(matched => {
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

interface IEvaluateComplexStringResult {
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
  mappings: IMatchData[]
): IEvaluateComplexStringResult => {
  const matches = new Set([...expression?.matchAll(/\{\{(?:(?!}}).)*\}\}/g)].flat());

  let result = expression;

  let success = true;

  let complexResults;

  const unevaluatedExpressions = [];

  Array.from(matches).forEach(template => {
    mappings.forEach(({ match, data }) => {
      if (template.includes(`{{${match}`)) {
        // When the match = "", we wanna send data as it is as that would mean that the expression doe nto use dot notation
        // This is useful for backward compatibility
        // Initially expression would simply be {{expression}} and they wou be evaluated against formData
        // But dynamic expression now can use formData and globalState, so as a result the expressions need to use dot notation

        const evaluatedValue = evaluateString(template, match ? { [match]: data } : { data });

        if (!evaluatedValue?.trim()) {
          success = false;
          unevaluatedExpressions?.push(template);
        } else {
          let sterilizedResult: string;
          let filterHolder;
          let ruleJoin = typeof result === 'string' ? Object.keys(JSON.parse(result))[0] : Object.keys(result)[0];
          sterilizedResult = typeof result === 'string' ? JSON.parse(result) : result;

          filterHolder = sterilizedResult[ruleJoin]?.map(flt => {
            let operator = Object.keys(flt)[0];
            let mutated = flt[operator]?.map((vr, index) => {
              if (index) {
                const isExpression = vr.indexOf('{') == 0;
                let filtered;
                filtered = isExpression ? evaluateString(vr, match ? { [match]: data } : { data }) : vr;
                if (hasBoolean(vr)) {
                  return getBoolean(vr);
                } else {
                  return isNaN(filtered) ? filtered?.replace(/("|')/g, '') : parseInt(filtered);
                }
              } else {
                return vr;
              }
            });
            return {
              [operator]: mutated,
            };
          });

          complexResults = !!filterHolder ? JSON.stringify({ [ruleJoin]: filterHolder }) : '';

          result = result.replaceAll(template, evaluatedValue);
        }
      }
    });
  });

  return {
    result: complexResults || result,
    success,
    unevaluatedExpressions: Array.from(new Set(unevaluatedExpressions)),
  };
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
        argsDefinition += (argsDefinition ? ', ' : '') + argumentName;
        argList.push(expressionArgs[argumentName]);
      }

      const expressionExecuter = new Function(argsDefinition, expression);

      return expressionExecuter.apply(null, argList);
    } catch (e) {
      return onFail(e);
    }
  } else return defaultValue;
}

export function executeScript<TResult = any>(
  expression: string,
  expressionArgs: IExpressionExecuterArguments
): Promise<TResult> {
  return new Promise<TResult>((resolve, reject) => {
    if (!expression) reject('Expression must be defined');

    let argsDefinition = '';
    const argList: any[] = [];
    for (const argumentName in expressionArgs) {
      argsDefinition += (argsDefinition ? ', ' : '') + argumentName;
      argList.push(expressionArgs[argumentName]);
    }

    const expressionExecuter = new Function(argsDefinition, expression);

    const result = expressionExecuter.apply(null, argList);
    resolve(result);
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
export const getVisibleComponentIds = (components: IComponentsDictionary, values: any): string[] => {
  const visibleComponents: string[] = [];
  for (const key in components) {
    if (components.hasOwnProperty(key)) {
      const component = components[key] as IConfigurableFormComponent;

      if (!component || component.hidden || component.visibility === 'No' || component.visibility === 'Removed')
        continue;

      const isVisible = component.visibilityFunc == null || component.visibilityFunc(values);
      if (isVisible) visibleComponents.push(key);
    }
  }
  return visibleComponents;
};

/**
 * Return ids of visible components according to the custom enabled
 */
export const getEnabledComponentIds = (components: IComponentsDictionary, values: any): string[] => {
  const enabledComponents: string[] = [];
  for (const key in components) {
    if (components.hasOwnProperty(key)) {
      const component = components[key] as IConfigurableFormComponent;
      if (!component || component.disabled) continue;

      const isEnabled =
        !Boolean(component?.enabledFunc) ||
        (typeof component?.enabledFunc === 'function' && component?.enabledFunc(values));

      if (isEnabled) enabledComponents.push(key);
    }
  }
  return enabledComponents;
};

/**
 * Return field name for the antd form by a given expression
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

/* Convert string to camelCase */
export const camelcaseDotNotation = str =>
  str
    .split('.')
    .map(s => camelcase(s))
    .join('.');

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
 * @param expression the expression to evaluate
 * @param data the data to use to evaluate the expression
 * @returns
 */
export const evaluateStringLiteralExpression = (expression: string, data: any) => {
  return expression.replace(/\$\{(.*?)\}/g, (_, token) => nestedProperty.get(data, token));
};

export const evaluateValue = (value: string, dictionary: any) => {
  return _evaluateValue(value, dictionary, true);
};

/**
 * Evaluates an string expression and returns the evaluated value.
 *
 * Example: Given
 *  let const person = { name: 'First', surname: 'Last' };
 *  let expression = 'Full name is {{name}} {{surname}}';
 *
 * evaluateExpression(expression, person) will display 'Full name is First Last';
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

export const _evaluateValue = (value: string, dictionary: any, isRoot: boolean) => {
  if (!value) return value;
  if (!dictionary) return null;

  const match = value.match(isRoot ? DICTIONARY_ACCESSOR_REGEX : NESTED_ACCESSOR_REGEX);
  if (!match) return value;

  // check nested properties
  if (match.groups.accessor.match(NESTED_ACCESSOR_REGEX)) {
    // try get value recursive
    return _evaluateValue(match.groups.accessor, dictionary[match.groups.key], false);
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

export const toolbarGroupsToComponents = (availableComponents: IToolboxComponentGroup[]): IToolboxComponents => {
  const allComponents: IToolboxComponents = {};
  if (availableComponents) {
    availableComponents.forEach(group => {
      group.components.forEach(component => {
        allComponents[component.type] = component;
      });
    });
  }
  return allComponents;
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

/** backward compatibility */
export const getComponentsAndSettings = (markup: FormMarkup): FormMarkupWithSettings => {
  return {
    components: getComponentsFromMarkup(markup),
    formSettings: getFromSettingsFromMarkup(markup),
  };
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

export const validateForm = (rules: Rules, values: ValidateSource): Promise<void> => {
  const validator = new Schema(rules);

  return validator.validate(values);
};

export const getFormValidationRules = (markup: FormMarkup): Rules => {
  const components = getComponentsFromMarkup(markup);

  const rules: Rules = {};
  components.forEach(component => {
    rules[component.name] = getValidationRules(component) as [];
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
  if (component.linkToModelMetadata) mappedModel = component.linkToModelMetadata(model, metadata);

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

  const toolboxComponent = findToolboxComponent(componentsRegistration, c => c.type === component.type);
  if (!toolboxComponent) return;
  const containers = getContainerNames(toolboxComponent);

  if (containers) {
    containers.forEach(containerName => {
      const containerComponents = component[containerName] as IConfigurableFormComponent[];
      if (containerComponents) {
        containerComponents.forEach(child => {
          func(child, component.id);
          processRecursive(componentsRegistration, parentId, child, func);
        });
      }
    });
  }
};

/**
 * Clone components and generate new ids for them
 * @param componentsRegistration
 * @param components
 * @returns
 */
export const cloneComponents = (
  componentsRegistration: IToolboxComponentGroup[],
  components: IConfigurableFormComponent[]
): IConfigurableFormComponent[] => {
  const result: IConfigurableFormComponent[] = [];

  components.forEach(component => {
    const clone = { ...component, id: nanoid() };

    result.push(clone);

    const toolboxComponent = findToolboxComponent(componentsRegistration, c => c.type === component.type);
    const containers = getContainerNames(toolboxComponent);

    if (containers) {
      containers.forEach(containerName => {
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
  propertyMetadata: IPropertyMetadata
): IConfigurableFormComponent => {
  const toolboxComponent = findToolboxComponent(
    components,
    c =>
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
    name: fullName,
    label: propertyMetadata.label,
    labelAlign: 'right',
    //parentId: containerId,
    hidden: false,
    visibility: 'Yes',
    customVisibility: null,
    visibilityFunc: _data => true,
    isDynamic: false,
    validate: {},
  };
  if (toolboxComponent.initModel) componentModel = toolboxComponent.initModel(componentModel);

  componentModel = listComponentToModelMetadata(toolboxComponent, componentModel, propertyMetadata);

  return componentModel;
};

export const useFormDesignerComponentGroups = () => {
  const app = useSheshaApplication(false);
  const appComponentGroups = app?.toolboxComponentGroups ?? [];

  const toolboxComponentGroups = [...(defaultToolboxComponents || []), ...appComponentGroups];
  return toolboxComponentGroups;
};

export const useFormDesignerComponents = () => {
  const componentGroups = useFormDesignerComponentGroups();

  const toolboxComponents = useMemo(() => toolbarGroupsToComponents(componentGroups), [componentGroups]);
  return toolboxComponents;
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

const convertToKeyValues = (obj: IAnyObject): IKeyValue[] => {
  return Object.keys(obj).map(key => ({
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
    includedProps?.forEach(key => {
      if (obj[key]) {
        response[key] = obj[key];
      }
    });
  }

  return response;
};

export const getStyle = (style: string, formData: any = {}, globalState: any = {}): CSSProperties => {
  if (!style) return {};
  // tslint:disable-next-line:function-constructor
  return new Function('data, globalState', style)(formData, globalState);
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
 * @param properties
 * @returns
 */
export const convertDotNotationPropertiesToGraphQL = (properties: string[], columns: ITableColumn[]): string => {
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
  // add id if missing
  if (!expandedProps.includes('id')) expandedProps.push('id');

  // special handling for entity references: expand properties list to include `id` and `_displayName`
  const entityColumns = columns.filter(c => c.dataType === 'entity');
  entityColumns.forEach(c => {
    const requiredProps = [`${c.propertyName}.Id`, `${c.propertyName}._displayName`];
    requiredProps.forEach(rp => {
      if (!expandedProps.includes(rp)) expandedProps.push(rp);
    });
  });

  // build properties tree
  expandedProps.forEach(p => {
    makeProp(tree, p);
  });

  const preparePropertyName = (name: string): string => {
    return name.startsWith('_') ? name : camelcase(name);
  };

  const getNodes = (container: object): string => {
    let result = '';
    for (const node in container) {
      if (result !== '') result += ' ';
      const nodeValue = container[node];
      if (typeof nodeValue === 'object') result += `${preparePropertyName(node)} { ${getNodes(nodeValue)} }`;
      else result += preparePropertyName(node);
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

export const convertToMarkupWithSettings = (markup: FormMarkup): FormMarkupWithSettings => {
  if (!markup) return null;
  const result = markup as FormMarkupWithSettings;
  if (result?.components && result.formSettings) return result;
  if (Array.isArray(markup)) return { components: markup, formSettings: DEFAULT_FORM_SETTINGS };

  return { components: [], formSettings: DEFAULT_FORM_SETTINGS };
};

const evaluateRecursive = (data: any, evaluationContext: GenericDictionary): any => {
  if (typeof data === 'string') {
    return evaluateString(data, evaluationContext);
  }
  if (Array.isArray(data)) {
    // note: `typeof` returns object for arrays too, we must to check isArray before `typeof`
    return data.map(item => evaluateRecursive(item, evaluationContext));
  }
  if (typeof data === 'object') {
    const evaluatedObject = {};
    for (const key in data) {
      if (data.hasOwnProperty(key)) {
        evaluatedObject[key] = evaluateRecursive(data[key], evaluationContext);
      }
    }
    return evaluatedObject;
  }
  return data;
};

export const genericActionArgumentsEvaluator = <TArguments = ActionParametersDictionary>(
  argumentsConfiguration: TArguments,
  evaluationContext: GenericDictionary
): Promise<TArguments> => {
  if (!Boolean(argumentsConfiguration)) return Promise.resolve(null);

  return new Promise<TArguments>(resolve => {
    const evaluated = evaluateRecursive(argumentsConfiguration, evaluationContext);
    resolve(evaluated as TArguments);
  });
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

  return new Promise<ActionArguments>(resolve => {
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

  Object.keys(components)?.forEach(key => {
    let component = components[key];

    if (predicate(component)) {
      componentNames.push(component.name);
    }
  });

  return componentNames;
};
