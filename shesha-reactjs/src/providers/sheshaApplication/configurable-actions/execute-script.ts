import { FormMarkupFactory, IActionExecutionContext } from '@/interfaces/configurableAction';
import { nanoid } from '@/utils/uuid';
import { useConfigurableAction } from '@/providers/configurableActionsDispatcher';
import { SheshaActionOwners } from '../../configurableActionsDispatcher/models';
import { executeScript } from '../../form/utils';

export interface IExecuteScriptArguments {
  expression: string;
  executer?: (context: IActionExecutionContext) => Promise<unknown>;
}

const executeScriptArgumentsForm: FormMarkupFactory = ({ availableConstants, fbf }) => {
  return fbf()
    .addSettingsInput({
      id: nanoid(),
      inputType: 'codeEditor',
      propertyName: 'expression',
      label: 'Expression',
      mode: 'dialog',
      wrapInTemplate: true,
      templateSettings: {
        functionName: "executeScriptAsync",
        useAsyncDeclaration: true,
      },
      availableConstants: availableConstants,
    })
    .toJson();
};

export const useExecuteScriptAction = (): void => {
  useConfigurableAction<IExecuteScriptArguments>(
    {
      isPermament: true,
      owner: 'Common',
      ownerUid: SheshaActionOwners.Common,
      name: 'Execute Script',
      sortOrder: 1,
      hasArguments: true,
      argumentsFormMarkup: (formArgs) => executeScriptArgumentsForm(formArgs),
      executer: ({ expression, executer }, context) => {
        if (executer) {
          return executer(context);
        } else {
          if (!expression)
            return Promise.reject('Expected expression to be defined but it was found to be empty.');

          return executeScript(expression, context);
        }
      },
    },
    [],
  );
};
