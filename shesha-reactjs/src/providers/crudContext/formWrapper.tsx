import { Form, FormInstance, FormProps } from 'antd';
import React, { FC, MutableRefObject, PropsWithChildren } from 'react';
import { useForm } from '@/providers';
import { IFormSettings } from '@/providers/form/models';
import { useDelayedUpdateOrUndefined } from '../delayedUpdateProvider/index';
import { IDelayedUpdateGroup } from '../delayedUpdateProvider/models';

interface FormWrapperProps {
  initialValues: object | undefined;
  onValuesChange: FormProps['onValuesChange'];
  form: FormInstance;
  formSettings?: IFormSettings | undefined;
  delayedUpdate?: MutableRefObject<IDelayedUpdateGroup[] | undefined> | undefined;
}

export const FormWrapper: FC<PropsWithChildren<FormWrapperProps>> = ({ initialValues, onValuesChange, form, formSettings, delayedUpdate, children }) => {
  const { setFormData } = useForm();
  const { getPayload: getDelayedUpdate } = useDelayedUpdateOrUndefined() ?? {};

  if (delayedUpdate && getDelayedUpdate)
    delayedUpdate.current = getDelayedUpdate();

  const onValuesChangeInternal = (changedValues: object, values: object): void => {
    // recalculate components visibility
    setFormData({ values, mergeValues: true });

    if (onValuesChange) onValuesChange(changedValues, values);
  };

  return (
    <Form
      component={false}
      form={form}
      onValuesChange={onValuesChangeInternal}
      {...(initialValues ? { initialValues } : {})}
      {...formSettings}
    >
      {children}
    </Form>
  );
};
