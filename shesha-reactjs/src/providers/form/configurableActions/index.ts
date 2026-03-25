import { useConfigurableAction } from "@/providers/configurableActionsDispatcher";
import { IShaFormInstance } from "../store/interfaces";
import { SheshaActionOwners } from "@/providers/configurableActionsDispatcher/models";
import { hasPreviousActionError } from "@/interfaces/configurableAction";
import { ISubmitActionArguments, ISubmitActionExecutionContext, IValidateActionExecutionContext } from "../models";
import { useRef } from "react";
import { isDefined } from "@/utils/nullables";
import { extractErrorInfo } from "@/utils/errors";


export type UseShaFormActionsArgs<TData extends object = object> = {
  name: string;
  isActionsOwner: boolean;
  shaForm: IShaFormInstance<TData>;
};
export const useShaFormActions = <TData extends object = object>({ name, isActionsOwner, shaForm }: UseShaFormActionsArgs<TData>): void => {
  const actionsOwnerUid = isActionsOwner ? SheshaActionOwners.Form : "";
  const actionDependencies = [actionsOwnerUid];
  const prevFormData = useRef<TData>();

  useConfigurableAction(
    {
      name: 'Start Edit',
      owner: name,
      ownerUid: actionsOwnerUid,
      hasArguments: false,
      executer: () => {
        prevFormData.current = shaForm.formData;
        shaForm.setFormMode('edit');
        return Promise.resolve();
      },
    },
    actionDependencies,
  );

  useConfigurableAction(
    {
      name: 'Cancel Edit',
      owner: name,
      ownerUid: actionsOwnerUid,
      hasArguments: false,
      executer: () => {
        shaForm.resetFields();
        shaForm.setFormData({ values: prevFormData.current ?? {} as TData, mergeValues: true });
        shaForm.setFormMode('readonly');
        return Promise.resolve();
      },
    },
    actionDependencies,
  );

  useConfigurableAction<ISubmitActionArguments, unknown, ISubmitActionExecutionContext>(
    {
      name: 'Submit',
      owner: name,
      ownerUid: actionsOwnerUid,
      hasArguments: false,
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
    },
    actionDependencies,
  );

  useConfigurableAction(
    {
      name: 'Reset',
      owner: name,
      ownerUid: actionsOwnerUid,
      hasArguments: false,
      executer: () => {
        shaForm.resetFields();
        return Promise.resolve();
      },
    },
    actionDependencies,
  );

  useConfigurableAction(
    {
      name: 'Refresh',
      description: 'Refresh the form data by fetching it from the back-end',
      owner: name,
      ownerUid: actionsOwnerUid,
      hasArguments: false,
      executer: () => {
        return shaForm.fetchData();
      },
    },
    actionDependencies,
  );

  useConfigurableAction<object, unknown, IValidateActionExecutionContext>(
    {
      name: 'Validate',
      description: 'Validate the form data and show validation errors if any',
      owner: name,
      ownerUid: actionsOwnerUid,
      hasArguments: false,
      executer: async (_, actionContext) => {
        var formInstance = actionContext.form?.formInstance ?? shaForm.antdForm;

        if (isDefined(actionContext.fieldsToValidate)) {
          if (actionContext.fieldsToValidate.length > 0)
            await formInstance.validateFields(actionContext.fieldsToValidate);
        } else
          await formInstance.validateFields();
      },
    },
    actionDependencies,
  );

  useConfigurableAction<{ data: object }>(
    {
      name: 'Set validation errors',
      description: 'Errors are displayed on the Validation Errors component attached to the form',
      owner: name,
      ownerUid: actionsOwnerUid,
      hasArguments: false,
      executer: (_args, actionContext) => {
        if (hasPreviousActionError(actionContext)) {
          const error = extractErrorInfo(actionContext.actionError);

          shaForm.setValidationErrors(error);
        }

        return Promise.resolve();
      },
    },
    actionDependencies,
  );

  useConfigurableAction(
    {
      name: 'Reset validation errors',
      description: 'Clear errors displayed on the Validation Errors component attached to the form',
      owner: name,
      ownerUid: actionsOwnerUid,
      hasArguments: false,
      executer: () => {
        shaForm.setValidationErrors(undefined);
        return Promise.resolve();
      },
    },
    actionDependencies,
  );
};
