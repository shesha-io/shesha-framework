import { useConfigurableAction } from "@/providers/configurableActionsDispatcher";
import { IShaFormInstance } from "../store/interfaces";
import { SheshaActionOwners } from "@/providers/configurableActionsDispatcher/models";
import { hasPreviousActionError } from "@/interfaces/configurableAction";
import { ISubmitActionArguments } from "../models";
import { useRef } from "react";


export type UseShaFormActionsArgs = {
  name: string;
  isActionsOwner: boolean;
  shaForm: IShaFormInstance;
};
export const useShaFormActions = ({ name, isActionsOwner, shaForm }: UseShaFormActionsArgs): void => {
  const actionsOwnerUid = isActionsOwner ? SheshaActionOwners.Form : null;
  const actionDependencies = [actionsOwnerUid];
  const prevFormData = useRef(null);

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
        shaForm.setFormData({ values: prevFormData?.current, mergeValues: true });
        shaForm.setFormMode('readonly');
        return Promise.resolve();
      },
    },
    actionDependencies,
  );

  useConfigurableAction(
    {
      name: 'Submit',
      owner: name,
      ownerUid: actionsOwnerUid,
      hasArguments: false,
      executer: async (args: ISubmitActionArguments, actionContext) => {
        var formInstance = (actionContext?.form?.formInstance ?? shaForm.antdForm);
        var fieldsToValidate = actionContext?.fieldsToValidate ?? null;
        if (args?.validateFields === true || fieldsToValidate?.length > 0) {
          await formInstance.validateFields(fieldsToValidate);
        }
        formInstance.submit();
        return Promise.resolve();
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

  useConfigurableAction(
    {
      name: 'Validate',
      description: 'Validate the form data and show validation errors if any',
      owner: name,
      ownerUid: actionsOwnerUid,
      hasArguments: false,
      executer: async (_, actionContext) => {
        var formInstance = actionContext?.form?.formInstance ?? shaForm.antdForm;
        var fieldsToValidate = actionContext?.fieldsToValidate ?? null;
        await formInstance.validateFields(fieldsToValidate);
        return Promise.resolve();
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
          const error = actionContext.actionError instanceof Error
            ? { message: actionContext.actionError.message }
            : actionContext.actionError;

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
