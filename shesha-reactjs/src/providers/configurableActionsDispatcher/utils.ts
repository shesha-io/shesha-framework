import { isDefined } from "@/utils";
import { CA_LABELS, IConfigurableActionGroupDictionary, SheshaActionOwners } from "./models";
import { getActualActionArguments, IConfigurableActionConfiguration } from ".";
import { getFormMarkup, IFormValidationRulesOptions, MESSAGES, validateConfigurableComponentSettings } from "../..";
import { collectValidationErrors, ComponentValidationError } from "@/utils/validation";
import { IActionDescriptor } from "@/interfaces/configurableAction";
import { FormActions } from "../form/configurableActions/descriptors";
import { appendValidationPath } from "../form/utils/validation";
import { isNullOrWhiteSpace } from "@/utils/nullables";

export const copyActionsTo = (src: IConfigurableActionGroupDictionary, dst: IConfigurableActionGroupDictionary): void => {
  for (const key in src) {
    if (src.hasOwnProperty(key) && isDefined(src[key])) {
      const srcGroup = src[key];
      if (!isDefined(dst[key])) {
        dst[key] = { ownerName: srcGroup.ownerName, actions: [...srcGroup.actions] };
      } else {
        const dstActions = [...dst[key].actions];
        srcGroup.actions.forEach((action) => {
          if (!dstActions.find((a) => a.name === action.name)) {
            dstActions.push(action);
          }
        });
        dst[key].actions = dstActions;
      }
    }
  }
};

export const mergeActionGroups = (left: IConfigurableActionGroupDictionary, right: IConfigurableActionGroupDictionary): IConfigurableActionGroupDictionary => {
  const result: IConfigurableActionGroupDictionary = {};
  copyActionsTo(left, result);
  copyActionsTo(right, result);
  return result;
};

const getAction = <TValues = unknown>(value: IConfigurableActionConfiguration, context: IFormValidationRulesOptions<TValues>): IActionDescriptor | undefined => {
  if (value.actionOwner === SheshaActionOwners.Form)
    return FormActions.find((a) => a.name === value.actionName);

  const getActionPayload = { owner: value.actionOwner, name: value.actionName };
  const action = isDefined(context.validator.getConfigurableActionOrNull)
    ? context.validator.getConfigurableActionOrNull(getActionPayload)
    : undefined;

  if (isDefined(action))
    return action;

  return !isNullOrWhiteSpace(context.componentId)
    ? context.contextConfigurableActionGetter({ ...getActionPayload, componentId: context.componentId }) ?? undefined
    : undefined;
};

export const validateActionConfiguration = async <TValues = unknown>(value: IConfigurableActionConfiguration, isRequired: boolean, context: IFormValidationRulesOptions<TValues>): Promise<void> => {
  if (isRequired && !isDefined(value))
    throw new ComponentValidationError(MESSAGES.THIS_FIELD_IS_REQUIRED, context.path, '');

  if (!isDefined(value))
    return;

  const errors: Error[] = [];

  // validate selected action
  const isEmpty = isNullOrWhiteSpace(value.actionOwner) || isNullOrWhiteSpace(value.actionName);
  if (isEmpty) {
    if (isRequired)
      throw new ComponentValidationError(MESSAGES.THIS_FIELD_IS_REQUIRED, context.path, '');
  } else {
    // find action and throw if action is unknown
    const action = getAction(value, context);
    if (!isDefined(action)) {
      errors.push(new ComponentValidationError(`Action '${value.actionName}' in the owner '${value.actionOwner}' not found.`, context.path, ''));
    } else {
      const fbf = context.validator.formBuilderFactory;
      if (isDefined(action.argumentsFormMarkup) && isDefined(fbf)) {
        const markup = getFormMarkup(action.argumentsFormMarkup, { fbf: fbf });

        if (isDefined(markup)) {
          const actionArgs = getActualActionArguments(action, value.actionArguments) ?? {};

          const nestedContext = appendValidationPath(context, { kind: 'setting', label: "Arguments", name: "arguments" });

          await collectValidationErrors(async () => {
            await validateConfigurableComponentSettings(markup, actionArgs, {
              ...nestedContext,
              getFormData: () => actionArgs, formData: actionArgs,
            });
          }, nestedContext.path, errors);
        }
      }
    }
  }

  const { handleFail, onFail, handleSuccess, onSuccess } = value;

  if (handleFail) {
    if (!onFail)
      errors.push(new ComponentValidationError(`'${CA_LABELS.ON_FAIL_HANDLER}' is mandatory when '${CA_LABELS.HANDLE_FAIL}' is enabled.`, context.path, 'onFail'));
    else {
      const onFailContext = appendValidationPath(context, { kind: 'setting', label: "On Fail", name: "onFail" });
      await collectValidationErrors(() => validateActionConfiguration(onFail, true, onFailContext), onFailContext.path, errors);
    }
  }

  if (handleSuccess) {
    if (!onSuccess)
      errors.push(new ComponentValidationError(`'${CA_LABELS.ON_SUCCESS_HANDLER}' is mandatory when '${CA_LABELS.HANDLE_SUCCESS}' is enabled.`, context.path, 'onSuccess'));
    else {
      const onSuccessContext = appendValidationPath(context, { kind: 'setting', label: "On Success", name: "onSuccess" });
      await collectValidationErrors(() => validateActionConfiguration(onSuccess, true, onSuccessContext), onSuccessContext.path, errors);
    }
  }

  if (errors.length > 0) {
    throw errors;
  }
};
