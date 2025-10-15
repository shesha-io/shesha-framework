import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { GenericDictionary } from '@/providers';
import { useConfigurableActionDispatcher } from '@/providers/configurableActionsDispatcher';
import { IExecuteActionPayload } from '@/providers/configurableActionsDispatcher/contexts';
import { useAvailableConstantsData } from '..';
import { executeScriptSync } from '@/providers/form/utils';

interface IFormExpression {
  argumentsEvaluationContext: GenericDictionary;
  executeAction: (payload: IExecuteActionPayload | IConfigurableActionConfiguration) => void;
  executeBooleanExpression: (expression: string, returnBoolean?: boolean) => boolean;
  executeExpression: (expression?: string) => any;
}

export const useFormExpression = (): IFormExpression => {
  const { executeAction: executeConfig } = useConfigurableActionDispatcher();

  const allData: GenericDictionary = useAvailableConstantsData();

  const executeAction = (payload: IExecuteActionPayload | IConfigurableActionConfiguration): void => {
    if ((payload as IExecuteActionPayload)?.argumentsEvaluationContext) {
      executeConfig(payload as IExecuteActionPayload);
    } else {
      executeConfig({ actionConfiguration: payload as IConfigurableActionConfiguration, argumentsEvaluationContext: allData });
    }
  };

  const executeBooleanExpression = (expression: string, returnBoolean = true): boolean => {
    if (!expression) {
      if (returnBoolean) {
        return true;
      } else {
        console.error('Expected expression to be defined but it was found to be empty.');
        return false;
      }
    }

    const evaluated = executeScriptSync(expression, allData);
    return typeof evaluated === 'boolean' ? evaluated : true;
  };

  const executeExpression = (expression: string = ''): boolean => executeScriptSync(expression, allData);

  return { argumentsEvaluationContext: allData, executeAction, executeBooleanExpression, executeExpression };
};
