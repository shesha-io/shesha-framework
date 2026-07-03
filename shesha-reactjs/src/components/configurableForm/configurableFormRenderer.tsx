import { ValidateErrorEntity } from '@/interfaces';
import { DEFAULT_FORM_SETTINGS, useSheshaApplication } from '@/providers';
import { useDelayedUpdateOrUndefined } from '@/providers/delayedUpdateProvider';
import { ROOT_COMPONENT_KEY } from '@/providers/form/models';
import { ComponentsContainerProvider } from '@/providers/form/nesting/containerContext';
import { useShaFormInstance } from '@/providers/form/providers/shaFormProvider';
import { Button, Form, Result } from 'antd';
import classNames from 'classnames';
import Link from 'next/link';
import React, {
  PropsWithChildren,
  ReactNode,
} from 'react';
import { ShaSpin } from '..';
import ComponentsContainer from '../formDesigner/containers/componentsContainer';
import { ComponentsContainerForm } from '../formDesigner/containers/componentsContainerForm';
import { IConfigurableFormRendererProps } from './models';
import { useStyles } from './styles/styles';
import { extractErrorInfo } from '@/utils/errors';

export const ConfigurableFormRenderer = <Values extends object = object>({
  children,
  form,
  parentFormValues,
  initialValues,
  beforeSubmit,
  onFinish,
  onFinishFailed,
  onSubmittedFailed,
  showDataSubmitIndicator = true,
  ...props
}: PropsWithChildren<IConfigurableFormRendererProps<Values>>): ReactNode => {
  const { getPayload: getDelayedUpdates } = useDelayedUpdateOrUndefined() ?? {};

  const shaForm = useShaFormInstance();
  const { settings: formSettings = DEFAULT_FORM_SETTINGS, setValidationErrors } = shaForm;
  shaForm.setDataSubmitContext({ getDelayedUpdates });

  const { styles } = useStyles();
  const { anyOfPermissionsGranted } = useSheshaApplication();

  const onValuesChangeInternal = (_changedValues: Partial<Values>, values: Values): void => {
    shaForm.setFormData({ values: values, mergeValues: true });
  };

  const onFinishInternal = async (): Promise<void> => {
    setValidationErrors(undefined);

    try {
      await shaForm.submitData();
    } catch (error) {
      onSubmittedFailed?.();
      setValidationErrors(extractErrorInfo(error));
      console.error('Submit failed: ', error);
    }
  };

  const onFinishFailedInternal = (errorInfo: ValidateErrorEntity<Values>): void => {
    setValidationErrors(undefined);
    onFinishFailed?.(errorInfo);
  };

  const mergedProps = {
    layout: props.layout ?? formSettings.layout,
    labelCol: props.labelCol ?? formSettings.labelCol,
    wrapperCol: props.wrapperCol ?? formSettings.wrapperCol,
    colon: formSettings.colon,
  };

  if (formSettings.access === 4 && !anyOfPermissionsGranted(formSettings.permissions || [])) {
    return (
      <Result
        status="403"
        style={{ height: '100vh - 55px' }}
        title="403"
        subTitle="Sorry, you are not authorized to access this page."
        extra={(
          <Button type="primary">
            <Link href="/">
              Back Home
            </Link>
          </Button>
        )}
      />
    );
  }

  const { dataSubmitState } = shaForm;

  return (
    <ComponentsContainerProvider ContainerComponent={ComponentsContainerForm}>
      <ShaSpin spinning={showDataSubmitIndicator && dataSubmitState.status === 'loading'} tip="Saving data...">
        <Form
          {...(form ? { form } : {})}
          labelWrap
          size={props.size}
          onFinish={onFinishInternal}
          onFinishFailed={onFinishFailedInternal}
          onValuesChange={onValuesChangeInternal}
          {...(initialValues ? { initialValues } : {})}
          className={classNames(styles.shaForm, props.className)}
          {...mergedProps}
          {...(shaForm.form
            ? {
              "data-sha-form-id": shaForm.form.id,
              "data-sha-form-name": `${shaForm.form.module}/${shaForm.form.name}`,
            }
            : {})}
        >
          <ComponentsContainer containerId={ROOT_COMPONENT_KEY} />
          {children}
        </Form>
      </ShaSpin>
    </ComponentsContainerProvider>
  );
};
