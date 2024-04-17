import { message } from 'antd';
import moment from 'moment';
import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { GenericDictionary, useDataContextManager, useForm, useFormData, useGlobalState, useSheshaApplication } from '@/providers';
import { useConfigurableActionDispatcher } from '@/providers/configurableActionsDispatcher';
import { IExecuteActionPayload } from '@/providers/configurableActionsDispatcher/contexts';
import { axiosHttp } from '@/utils/fetchers';
import { SheshaCommonContexts } from '@/providers/dataContextManager/models';
import { useDataContext } from '@/providers/dataContextProvider/contexts';

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

  const dcm = useDataContextManager(false);
  const application = dcm?.getDataContext(SheshaCommonContexts.ApplicationContext);
  const dataContext = useDataContext();

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

    application: application?.getData(),
    formContext: dataContext?.getFull(),
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
      'data, formMode, form, globalState, http, message, setGlobalState, setFormData, moment, application, formContext',
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
      moment,
      argumentsEvaluationContext.application,
      argumentsEvaluationContext.formContext,
    );

    return typeof evaluated === 'boolean' ? evaluated : true;
  };

  const executeExpression = (expression: string = '') =>
    new Function('data, formMode, form, globalState, http, message, setGlobalState, setFormData, moment, application, formContext', expression)(
      formData,
      formMode,
      form,
      globalState,
      axiosHttp(backendUrl),
      message,
      setGlobalState,
      setFormData,
      moment,
      argumentsEvaluationContext.application,
      argumentsEvaluationContext.formContext,
    );

  return { argumentsEvaluationContext, executeAction, executeBooleanExpression, executeExpression };
};
