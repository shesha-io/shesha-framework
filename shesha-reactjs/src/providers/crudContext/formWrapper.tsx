import { Form, FormInstance, FormProps } from 'antd';
import { RefObject, PropsWithChildren, ComponentProps, ReactNode } from 'react';
import { useForm } from '@/providers';
import { IFormSettings, resolveFormLayout } from '@/providers/form/models';
import { IConfigurableTheme } from '@/providers/theme/contexts';
import { useThemeState } from '@/providers/theme';
import { useDelayedUpdateOrUndefined } from '../delayedUpdateProvider/index';
import { IDelayedUpdateGroup } from '../delayedUpdateProvider/models';
import { removeUndefinedProperties } from '@/utils/array';

interface FormWrapperProps<TData extends object = object> {
  initialValues: Partial<TData> | undefined;
  onValuesChange: FormProps<TData>['onValuesChange'];
  form: FormInstance<TData>;
  formSettings?: IFormSettings | undefined;
  delayedUpdate?: RefObject<IDelayedUpdateGroup[] | undefined> | undefined;
}

const extractantdFormPropertiesFromFormSettings = (formSettings: IFormSettings | undefined, theme: IConfigurableTheme): Partial<Pick<ComponentProps<typeof Form>, 'layout' | 'colon' | 'labelCol' | 'wrapperCol' | 'labelAlign' | 'size'>> => {
  if (!formSettings) return {};
  // The form's own layout settings, falling back to (or inheriting) the theme's.
  const { size } = formSettings;
  const { layout, labelCol, wrapperCol, labelAlign, colon } = resolveFormLayout(formSettings, theme);
  return {
    ...removeUndefinedProperties({ layout, labelCol, wrapperCol, size }),
    ...(labelAlign !== undefined ? { labelAlign } : {}),
    ...(colon !== undefined ? { colon } : {}),
  };
};


export const FormWrapper = <TData extends object = object>({ initialValues, onValuesChange, form, formSettings, delayedUpdate, children }: PropsWithChildren<FormWrapperProps<TData>>): ReactNode => {
  const { setFormData } = useForm();
  const { getPayload: getDelayedUpdate } = useDelayedUpdateOrUndefined() ?? {};

  if (delayedUpdate && getDelayedUpdate)
    delayedUpdate.current = getDelayedUpdate();

  const onValuesChangeInternal: FormProps<TData>['onValuesChange'] = (changedValues, values) => {
    // recalculate components visibility
    setFormData({ values, mergeValues: true });

    if (onValuesChange) onValuesChange(changedValues, values);
  };

  const { theme } = useThemeState();
  const formProps = extractantdFormPropertiesFromFormSettings(formSettings, theme);
  return (
    <Form<TData>
      component={false}
      form={form}
      onValuesChange={onValuesChangeInternal}
      {...formProps}
      {...(initialValues ? { initialValues } : {})}
    >
      {children}
    </Form>
  );
};
