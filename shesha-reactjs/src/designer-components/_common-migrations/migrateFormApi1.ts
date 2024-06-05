import { IConfigurableFormComponent } from "@/index";
import { StandardNodeTypes } from "@/interfaces/formComponent";
import { isPropertySetting } from "@/providers/form/utils";

const migrateExpression = (expression: string, regexp: RegExp, newValue: string): string => {
  if (!expression)
    return expression;
  return expression.replaceAll(regexp, newValue);
};

const setFormData = (expr: string): string => migrateExpression(expr, /\b(setFormData)\b/mg, 'form.setFormData');
const formData = (expr: string): string => migrateExpression(expr, /\b(formData)\b/mg, 'form.data');
const formMode = (expr: string): string => migrateExpression(expr, /\b(formMode)\b/mg, 'form.formMode');

const withoutFormData = (expr: string): string => setFormData(formMode(expr));
const full = (expr: string): string => setFormData(formData(formMode(expr)));

const events = <T extends IConfigurableFormComponent,>(model: T): T => ({
  ...model,
  onBlurCustom: withoutFormData(model.onBlurCustom),
  onChangeCustom: withoutFormData(model.onChangeCustom),
  onFocusCustom: withoutFormData(model.onFocusCustom),
});

const properties = <T,>(model: T): T => {
  if (Array.isArray(model)) {
    return model.map(properties) as T;
  };
  var newModel = {...model};
  for(const propName in newModel) {
    if (Object.prototype.hasOwnProperty.call(newModel, propName)) {
      const prop = newModel[propName];
      if (prop && typeof prop === 'object') {

        if (isPropertySetting(prop)) {
          // migrate JS settings
          newModel[propName] = {...prop, _code: withoutFormData(prop?._code)};
        } else if (prop['_type'] === StandardNodeTypes.ConfigurableActionConfig && prop['actionName'] === 'Execute Script') {
          // migrate configurable actions
          newModel[propName] = {...prop, actionArguments: {expression: withoutFormData(prop['actionArguments']?.expression)}};
        } else {
          // migrate complex settings
          newModel[propName] = properties(prop);
        }
      }
      // or skip migration
    }
  }
  return newModel;
};

const eventsAndProperties = <T extends IConfigurableFormComponent,>(model: T): T => (events(properties(model)));

export const migrateFormApi = {
  setFormData,
  formData,
  formMode,
  withoutFormData,
  full,
  events,
  properties,
  eventsAndProperties
};

