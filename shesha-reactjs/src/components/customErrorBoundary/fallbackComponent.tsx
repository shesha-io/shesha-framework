import React, { FC } from 'react';
import { FallbackProps } from 'react-error-boundary';
import { FrownTwoTone } from '@ant-design/icons';
import { Button, Space } from 'antd';
import { useStyles } from './styles/styles';
import { useShaRouting } from '@/providers';
import ComponentError from '../componentErrors';
import { IModelValidation, SheshaError } from '@/utils/errors';
import { useFormDesignerComponentGetter } from '@/providers/form/hooks';

const errorBoundaryErrorHandler = ({ error }: Omit<FallbackProps, 'resetErrorBoundary'>) => {
  // Do something with the error
  // E.g. log to an error logging client here
  console.error('CustomErrorBoundary error :', error);
};

interface ICustomErrorBoundaryFallbackProps extends FallbackProps {
  fullScreen?: boolean;
  componentId?: string;
  componentName?: string;
  componentType?: string;
  model?: any;
}

const CustomErrorBoundaryFallbackComponent: FC<ICustomErrorBoundaryFallbackProps> = ({
  componentId,
  componentName,
  componentType,
  fullScreen = false,
  error,
  resetErrorBoundary,
  model,
}) => {
  const { styles } = useStyles();
  const { router } = useShaRouting();
  const getToolboxComponent = useFormDesignerComponentGetter();

  errorBoundaryErrorHandler({ error });

  if (fullScreen) {
    return (
      <div className={styles.customErrorBoundary}>
        <h2 className={styles.oops}>Oops!</h2>
        <FrownTwoTone twoToneColor="#ffa800" className={styles.errorIcon} />
        <h3 className={styles.primaryMessage}>Aaaah! Something went wrong!</h3>
        <p className={styles.secondaryMessage}>
          Brace yourself till we get the error fixed. You may also refresh the page or try again later
        </p>

        <Space size="middle">
          <Button type="primary" onClick={() => router.push('/')} className={styles.takeMeHome}>
            TAKE ME HOME
          </Button>

          {typeof resetErrorBoundary === 'function' && (
            <Button onClick={resetErrorBoundary} className={styles.takeMeHome}>
              Try again
            </Button>
          )}
        </Space>
      </div>
    );
  }

  const toolboxComponent = getToolboxComponent(componentType);

  if (SheshaError.isSheshaError(error)) {
    const shaErrors = error.cause?.errors;
    if (Boolean(shaErrors)) {
      if (!shaErrors.componentId) shaErrors.componentId = componentId;
      if (!shaErrors.componentName) shaErrors.componentName = componentName;
      if (!shaErrors.componentType) shaErrors.componentType = componentType;
      if (!shaErrors.model) shaErrors.model = model;
    }
    return <ComponentError errors={shaErrors} type={error.cause?.type} resetErrorBoundary={resetErrorBoundary} toolboxComponent={toolboxComponent}/>;
  }

  const shaError = {
    componentName: componentName,
    componentType: componentType,
    errors: [{ error: error.message, type: 'error' }],
    message: Boolean(componentName) || Boolean(componentType) 
      ? `An error has occurred when '${componentName}' (${componentType}) rendered`
      : `An error has occurred`,
    model: model,
  } as IModelValidation;

  return <ComponentError errors={shaError} type='error' resetErrorBoundary={resetErrorBoundary} toolboxComponent={toolboxComponent}/>;
};

export default CustomErrorBoundaryFallbackComponent;
