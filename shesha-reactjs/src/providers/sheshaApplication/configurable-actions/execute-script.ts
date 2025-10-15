import { ICodeExposedVariable } from '@/components/codeVariablesTable';
import { FormMarkupFactory } from '@/interfaces/configurableAction';
import { nanoid } from '@/utils/uuid';
import { DesignerToolbarSettings } from '@/interfaces/toolbarSettings';
import { useConfigurableAction } from '@/providers/configurableActionsDispatcher';
import { SheshaActionOwners } from '../../configurableActionsDispatcher/models';
import { executeScript } from '../../form/utils';

export interface IExecuteScriptArguments {
  expression: string;
}

const executeScriptArgumentsForm: FormMarkupFactory = (props) => {
  const standardVariables: ICodeExposedVariable[] = [
    {
      id: '3b19a708-e81a-4625-bcbb-3fe8451d0491',
      name: 'actionError',
      description: 'Error action response',
      type: 'object',
    },
    {
      id: '3ae3beb8-7d6b-44af-90ea-d23339a3b6b2',
      name: 'actionResponse',
      description: 'Success action response',
      type: 'object',
    },
  ];
  const customVariables = props.exposedVariables ?? [
    { id: '724f460e-a121-44f0-ac6e-db4bb42d39c4', name: 'data', description: 'Selected form values', type: 'object' },
    {
      id: '81ce18bb-1ad5-423f-b308-359d0d7911dc',
      name: 'fileSaver',
      description: 'API for saving files on the client',
      type: 'object',
    },
    { id: '67dbff99-f11c-4b77-b6ba-61042e7fafe5', name: 'form', description: 'Form instance', type: 'FormInstance' },
    {
      id: '21682825-2764-4640-8ca0-98cf6d0c051f',
      name: 'formMode',
      description: 'The form mode',
      type: "'readonly' | 'edit' | 'designer'",
    },
    {
      id: 'aedfa7dd-ca0f-40eb-85c6-b1aea0a2aeb8',
      name: 'globalState',
      description: 'The global state of the application',
      type: 'object',
    },
    {
      id: 'fd0bf164-13b8-458a-b2de-276259c9ce81',
      name: 'http',
      description: 'axios instance used to make http requests',
      type: 'object',
    },
    {
      id: 'd6d04fc1-8e6d-49fd-a4bb-31f333385bb8',
      name: 'message',
      description:
        'This is the Ant API for displaying toast messages. See: https://ant.design/components/message/#header',
      type: 'object',
    },
    {
      id: 'b8a230c7-2cd5-4974-b4ed-c9753ac12c1d',
      name: 'moment',
      description: 'The moment.js object',
      type: 'object',
    },
    {
      id: '1cbcefbe-4e2c-464c-853c-b46376ca84b0',
      name: 'setGlobalState',
      description: 'Setting the global state of the application',
      type: '(payload: { key: string, data: any } ) => void;',
    },
    {
      id: '8d1541db-2591-4568-b925-d7777cea7f0f',
      name: 'setFormData',
      description: 'A function used to update the form data',
      type: '({ values: object, mergeValues: boolean}) => void',
    },
    {
      id: 'a9df21db-2591-4568-b925-b730acea7f0f',
      name: 'contexts',
      description: 'Data contexts',
      type: 'object',
    },
  ];

  const variables = [...standardVariables, ...customVariables];

  return new DesignerToolbarSettings()
    .addSettingsInput({
      id: nanoid(),
      inputType: 'codeEditor',
      propertyName: 'expression',
      label: 'Expression',
      mode: 'dialog',
      fileName: 'expression',
      wrapInTemplate: true,
      templateSettings: {
        functionName: "executeScriptAsync",
        useAsyncDeclaration: true,
      },
      availableConstants: props.availableConstants,
      /**
       * @deprecated to be removed
       */
      exposedVariables: variables,
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
      hasArguments: true,
      argumentsFormMarkup: (formArgs) => executeScriptArgumentsForm(formArgs),
      executer: (actionArgs, context) => {
        if (!actionArgs.expression)
          return Promise.reject('Expected expression to be defined but it was found to be empty.');

        return executeScript(actionArgs.expression, context);
      },
    },
    [],
  );
};
