import { nanoid } from "nanoid";
import { useSheshaApplication } from "../../..";
import { DesignerToolbarSettings } from "../../../interfaces/toolbarSettings";
import { useConfigurableAction } from "../../configurableActionsDispatcher";
import { SheshaActionOwners } from "../../configurableActionsDispatcher/models";
import { executeScript } from "../../form/utils";

export interface IExecuteScriptArguments {
  expression: string;
}

const executeScriptArgumentsForm = new DesignerToolbarSettings()
  .addCodeEditor({
    id: nanoid(),
    name: 'expression',
    label: 'Expression',
    mode: "dialog",
    exposedVariables: [
      { id: "724f460e-a121-44f0-ac6e-db4bb42d39c4", name: "data", description: "Selected form values", type: "object" },
      { id: "3d001ce9-c9ae-4eff-b992-86141f9d3e6e", name: "event", description: "Event callback when user input", type: "object" },
      { id: "67dbff99-f11c-4b77-b6ba-61042e7fafe5", name: "form", description: "Form instance", type: "FormInstance" },
      { id: "21682825-2764-4640-8ca0-98cf6d0c051f", name: "formMode", description: "The form mode", type: "'readonly' | 'edit' | 'designer'" },
      { id: "aedfa7dd-ca0f-40eb-85c6-b1aea0a2aeb8", name: "globalState", description: "The global state of the application", type: "object" },
      { id: "fd0bf164-13b8-458a-b2de-276259c9ce81", name: "http", description: "axios instance used to make http requests", type: "object" },
      { id: "d6d04fc1-8e6d-49fd-a4bb-31f333385bb8", name: "message", description: "This is the Ant API for displaying toast messages. See: https://ant.design/components/message/#header", type: "object" },
      { id: "b8a230c7-2cd5-4974-b4ed-c9753ac12c1d", name: "moment", description: "The moment.js object", type: "object" },
      { id: '1cbcefbe-4e2c-464c-853c-b46376ca84b0', name: 'setGlobalState', description: 'Setting the global state of the application', type: '(payload: { key: string, data: any } ) => void;' },
    ]
  })
  .toJson();

export const useExecuteScriptAction = () => {
  const { backendUrl, httpHeaders } = useSheshaApplication();
  useConfigurableAction<IExecuteScriptArguments>({
    owner: 'Common',
    ownerUid: SheshaActionOwners.Common,
    name: 'Execute Script',
    hasArguments: true,
    argumentsFormMarkup: executeScriptArgumentsForm,
    executer: (actionArgs, context) => {
      if (!actionArgs.expression)
        return Promise.reject('Expected expression to be defined but it was found to be empty.');

      console.log('context is: ', context);

      return executeScript(actionArgs.expression, context);
    }
  }, [backendUrl, httpHeaders]);
};
