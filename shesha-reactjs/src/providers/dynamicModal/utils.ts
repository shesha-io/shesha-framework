import { IActionExecutionContext } from "@/interfaces/configurableAction";
import { executeScript } from "../form/utils";

export const prepareDialogArguments = (expression: string, context: IActionExecutionContext): Promise<any> => {
  if (!expression?.trim())
    return Promise.resolve({});

  return executeScript(expression, context);
};
