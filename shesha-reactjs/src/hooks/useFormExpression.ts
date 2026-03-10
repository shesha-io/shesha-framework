import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { GenericDictionary } from '@/providers';
import { useConfigurableActionDispatcher } from '@/providers/configurableActionsDispatcher';
import { IExecuteActionPayload } from '@/providers/configurableActionsDispatcher/contexts';
import { useAvailableConstantsData } from '..';
import { executeScriptSync } from '@/providers/form/utils';

interface IFormExpression {
  argumentsEvaluationContext: GenericDictionary;
  executeActionViaPayload: (payload: IExecuteActionPayload) => void;
  executeActionViaConfiguration: (payload: IConfigurableActionConfiguration) => void;
  executeBooleanExpression: (expression: string, returnBoolean?: boolean) => boolean;
  executeExpression: (expression?: string) => unknown;
}

export const useFormExpression = (): IFormExpression => {
  const { executeAction: executeConfig } = useConfigurableActionDispatcher();

  const allData: GenericDictionary = useAvailableConstantsData();

  const executeActionViaPayload = (payload: IExecuteActionPayload): void => {
    executeConfig(payload as IExecuteActionPayload);
  };
  const executeActionViaConfiguration = (payload: IConfigurableActionConfiguration): void => {
    executeConfig({ actionConfiguration: payload as IConfigurableActionConfiguration, argumentsEvaluationContext: allData });
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

  const executeExpression = (expression: string = ''): boolean => executeScriptSync<boolean>(expression, allData) ?? false;

  return { argumentsEvaluationContext: allData, executeBooleanExpression, executeExpression, executeActionViaPayload, executeActionViaConfiguration };
};
