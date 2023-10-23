import { message } from 'antd';
import moment from 'moment';
import { useFormData, useSheshaApplication } from '..';
import { useForm, useGlobalState } from '../providers';
import { axiosHttp } from '../utils/fetchers';

interface IFormExpression {
  executeBooleanExpression: (expression: string, returnBoolean?: boolean) => boolean;
  executeExpression: (expression?: string) => any;
}

export const useFormExpression = (): IFormExpression => {
  const { form, formMode, setFormDataAndInstance } = useForm();
  const { data: formData } = useFormData();
  const { globalState, setState: setGlobalState } = useGlobalState();
  const { backendUrl } = useSheshaApplication();

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
      setFormDataAndInstance,
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
      setFormDataAndInstance,
      moment
    );

  return { executeBooleanExpression, executeExpression };
};
