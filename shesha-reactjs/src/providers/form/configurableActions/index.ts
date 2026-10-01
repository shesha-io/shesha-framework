import { useConfigurableActionImplementation } from "@/providers/configurableActionsDispatcher";
import { IShaFormInstance } from "../store/interfaces";
import { SheshaActionOwners } from "@/providers/configurableActionsDispatcher/models";
import { hasPreviousActionError } from "@/interfaces/configurableAction";
import { ISubmitActionArguments, ISubmitActionExecutionContext, IValidateActionExecutionContext } from "../models";
import { useRef } from "react";
import { isDefined } from "@/utils/nullables";
import { extractErrorInfo } from "@/utils/errors";
import { useBlockingLoaderActions } from "@/providers/blockingLoader";
import { CancelEditAction, RefreshAction, ResetAction, ResetValidationErrorsAction, SetValidationErrorsAction, StartEditAction, SubmitAction, ValidateAction } from "./descriptors";


export type UseShaFormActionsArgs<TData extends object = object> = {
  name: string;
  isActionsOwner: boolean;
  shaForm: IShaFormInstance<TData>;
};
export const useShaFormActions = <TData extends object = object>({ name, isActionsOwner, shaForm }: UseShaFormActionsArgs<TData>): void => {
  const actionsOwnerId = isActionsOwner ? SheshaActionOwners.Form : "";
  const actionDependencies = [actionsOwnerId];
  const prevFormData = useRef<TData>(undefined);

  useBlockingLoaderActions('form', name, actionsOwnerId);

  const actionOwnerName = name;

  useConfigurableActionImplementation(actionsOwnerId, StartEditAction, {
    owner: actionOwnerName,
    executer: () => {
      prevFormData.current = shaForm.formData;
      shaForm.setFormMode('edit');
      return Promise.resolve();
    },
  }, actionDependencies);

  useConfigurableActionImplementation(actionsOwnerId, CancelEditAction, {
    owner: actionOwnerName,
    executer: () => {
      shaForm.resetFields();
      shaForm.setFormData({ values: prevFormData.current ?? {} as TData, mergeValues: true });
      shaForm.setFormMode('readonly');
      return Promise.resolve();
    },
  }, actionDependencies);

  useConfigurableActionImplementation<ISubmitActionArguments, ISubmitActionExecutionContext>(actionsOwnerId, SubmitAction, {
    owner: actionOwnerName,
    executer: async (args: ISubmitActionArguments, actionContext) => {
      var formInstance = (actionContext.form?.formInstance ?? shaForm.antdForm);

      var skipValidation = args.validateFields === false;
      if (!skipValidation) {
        if (isDefined(actionContext.fieldsToValidate)) {
          if (actionContext.fieldsToValidate.length > 0)
            await formInstance.validateFields(actionContext.fieldsToValidate);
        } else
          await formInstance.validateFields();
      }

      const realShaForm = actionContext.form?.shaForm ?? shaForm;
      await realShaForm.submitData();
    },
  }, actionDependencies);

  useConfigurableActionImplementation(actionsOwnerId, ResetAction, {
    owner: actionOwnerName,
    executer: () => {
      shaForm.resetFields();
      return Promise.resolve();
    },
  }, actionDependencies);

  useConfigurableActionImplementation(actionsOwnerId, RefreshAction, {
    owner: actionOwnerName,
    executer: () => {
      return shaForm.fetchData();
    },
  }, actionDependencies);

  useConfigurableActionImplementation<object, IValidateActionExecutionContext>(actionsOwnerId, ValidateAction, {
    owner: actionOwnerName,
    executer: async (_, actionContext) => {
      var formInstance = actionContext.form?.formInstance ?? shaForm.antdForm;

      if (isDefined(actionContext.fieldsToValidate)) {
        if (actionContext.fieldsToValidate.length > 0)
          await formInstance.validateFields(actionContext.fieldsToValidate);
      } else
        await formInstance.validateFields();
    },
  }, actionDependencies);

  useConfigurableActionImplementation(actionsOwnerId, SetValidationErrorsAction, {
    owner: actionOwnerName,
    executer: (_args, actionContext) => {
      if (hasPreviousActionError(actionContext)) {
        const error = extractErrorInfo(actionContext.actionError);

        shaForm.setValidationErrors(error);
      }

      return Promise.resolve();
    },
  }, actionDependencies);

  useConfigurableActionImplementation(actionsOwnerId, ResetValidationErrorsAction, {
    owner: actionOwnerName,
    executer: () => {
      shaForm.setValidationErrors(undefined);
      return Promise.resolve();
    },
  }, actionDependencies);
};
