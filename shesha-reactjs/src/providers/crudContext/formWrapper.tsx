import { Form, FormInstance, FormProps } from 'antd';
import React, { FC, MutableRefObject, PropsWithChildren } from 'react';
import { useForm } from '@/providers';
import { IFormSettings } from '@/providers/form/models';
import { useDelayedUpdate } from '../delayedUpdateProvider/index';
import { IDelayedUpdateGroup } from '../delayedUpdateProvider/models';

interface FormWrapperProps {
  initialValues: object;
  onValuesChange: FormProps['onValuesChange'];
  form: FormInstance;
  formSettings?: IFormSettings;
  delayedUpdate?: MutableRefObject<IDelayedUpdateGroup[]>;
}

export const FormWrapper: FC<PropsWithChildren<FormWrapperProps>> = ({ initialValues, onValuesChange, form, formSettings, delayedUpdate, children }) => {
  const { setFormData } = useForm();
  const { getPayload: getDelayedUpdate } = useDelayedUpdate(false) ?? {};

  if (delayedUpdate)
    delayedUpdate.current = getDelayedUpdate();

  const onValuesChangeInternal = (changedValues: any, values: any): void => {
    // recalculate components visibility
    setFormData({ values, mergeValues: true });

    if (onValuesChange) onValuesChange(changedValues, values);
  };

  return (
    <Form
      component={false}
      form={form}
      initialValues={initialValues}
      onValuesChange={onValuesChangeInternal}
      {...formSettings}
    >
      {children}
    </Form>
  );
};
