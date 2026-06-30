import { StandardNodeTypes } from "@/interfaces/formComponent";
import { isPropertySettings } from "../_settings/utils/utils";
import { isDefined, isNullOrWhiteSpace } from "@/utils/nullables";
import { IConfigurableFormComponent } from "@/providers/form/models";

const migrateExpression = (expression: string | undefined, regexp: RegExp, newValue: string): string | undefined => {
  if (isNullOrWhiteSpace(expression))
    return expression;
  return expression.replaceAll(regexp, newValue);
};

const setFormData = (expr: string | undefined): string | undefined => migrateExpression(expr, /\b(setFormData)\b/mg, 'form.setFormData');
const formData = (expr: string | undefined): string | undefined => migrateExpression(expr, /\b(formData)\b/mg, 'form.data');
const formMode = (expr: string | undefined): string | undefined => migrateExpression(expr, /\b(formMode)\b/mg, 'form.formMode');

const withoutFormData = (expr: string | undefined): string | undefined => setFormData(formMode(expr));
const full = (expr: string | undefined): string | undefined => setFormData(formData(formMode(expr)));

const events = <T extends IConfigurableFormComponent>(model: T): T => ({
  ...model,
  onBlurCustom: withoutFormData(model.onBlurCustom),
  onChangeCustom: withoutFormData(model.onChangeCustom),
  onFocusCustom: withoutFormData(model.onFocusCustom),
});

const properties = <T extends object>(model: T): T => {
  const migrateProp = (prop: unknown): unknown => {
    if (!prop)
      return prop;

    if (isPropertySettings(prop)) {
      // migrate JS settings
      return { ...prop, _code: withoutFormData(prop._code) };
    } else if (typeof (prop) === "object" && "_type" in prop && prop._type === StandardNodeTypes.ConfigurableActionConfig && "actionName" in prop && prop.actionName === 'Execute Script') {
      // migrate configurable actions
      const actionArguments = "actionArguments" in prop && typeof (prop.actionArguments) === "object" &&
        isDefined(prop.actionArguments) && "expression" in prop.actionArguments && typeof (prop.actionArguments.expression) === "string"
        ? prop.actionArguments.expression
        : undefined;
      return { ...prop, actionArguments: { expression: withoutFormData(actionArguments) } };
    } else {
      // migrate complex settings
      return properties(prop);
    }
  };

  if (Array.isArray(model)) {
    return model.map((prop) => {
      // migrate properties
      return typeof prop === 'object' ? migrateProp(prop) : prop;
    }) as T;
  };

  const newModel = { ...model };
  for (const propName in newModel) {
    if (newModel.hasOwnProperty(propName)) {
      const prop = newModel[propName];
      if (prop && typeof prop === 'object') {
        // migrate properties
        newModel[propName as keyof T] = migrateProp(prop) as T[keyof T];
      }
      // or skip migration
    }
  }
  return newModel;
};

const eventsAndProperties = <T extends IConfigurableFormComponent>(model: T): T => (events(properties(model)));

export const migrateFormApi = {
  setFormData,
  formData,
  formMode,
  withoutFormData,
  full,
  events,
  properties,
  eventsAndProperties,
};

