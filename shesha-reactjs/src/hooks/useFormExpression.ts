import { message } from 'antd';
import moment from 'moment';
import { useFormData, useSheshaApplication } from '..';
import { IConfigurableActionConfiguration } from '../interfaces/configurableAction';
import { GenericDictionary, useForm, useGlobalState } from '../providers';
import { useConfigurableActionDispatcher } from '../providers/configurableActionsDispatcher';
import { IExecuteActionPayload } from '../providers/configurableActionsDispatcher/contexts';
import { axiosHttp } from '../utils/fetchers';

interface IFormExpression {
  argumentsEvaluationContext: GenericDictionary;
  executeAction: (payload: IExecuteActionPayload | IConfigurableActionConfiguration) => void;
  executeBooleanExpression: (expression: string, returnBoolean?: boolean) => boolean;
  executeExpression: (expression?: string) => any;
}

export const useFormExpression = (): IFormExpression => {
  const { form, formMode, setFormData } = useForm();
  const { data: formData } = useFormData();
  const { globalState, setState: setGlobalState } = useGlobalState();
  const { backendUrl } = useSheshaApplication();
  const { executeAction: executeConfig } = useConfigurableActionDispatcher();

  const argumentsEvaluationContext: GenericDictionary = {
    data: formData,
    formMode,
    globalState,
    form,
    http: axiosHttp(backendUrl),
    message,
    setGlobalState,
    setFormData,
    moment,
  };

  const executeAction = (payload: IExecuteActionPayload | IConfigurableActionConfiguration) => {
    if ((payload as IExecuteActionPayload)?.argumentsEvaluationContext) {
      executeConfig(payload as IExecuteActionPayload);
    } else {
      executeConfig({ actionConfiguration: payload as IConfigurableActionConfiguration, argumentsEvaluationContext });
    }
  };

  const executeBooleanExpression = (expression: string, returnBoolean = true) => {
    if (!expression) {
      if (returnBoolean) {
        return true;
      } else {
        console.error('Expected expression to be defined but it was found to be empty.');
        return false;
      }
    }

    const evaluated = new Function(
      'data, formMode, form, globalState, http, message, setGlobalState, setFormData, moment',
      expression
    )(
      formData,
      formMode,
      form,
      globalState,
      axiosHttp(backendUrl),
      message,
      setGlobalState,
      setFormData,
      moment
    );

    return typeof evaluated === 'boolean' ? evaluated : true;
  };

  const executeExpression = (expression: string = '') =>
    new Function('data, formMode, form, globalState, http, message, setGlobalState, setFormData, moment', expression)(
      formData,
      formMode,
      form,
      globalState,
      axiosHttp(backendUrl),
      message,
      setGlobalState,
      setFormData,
      moment
    );

  return { argumentsEvaluationContext, executeAction, executeBooleanExpression, executeExpression };
};
