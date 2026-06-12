import React, { FC } from 'react';
import { FallbackProps } from 'react-error-boundary';
import { FrownTwoTone } from '@ant-design/icons';
import { Button, Space } from 'antd';
import { useStyles } from './styles/styles';
import { useShaRouting } from '@/providers';
import ComponentError from '../componentErrors';
import { IModelValidation, SheshaError } from '@/utils/errors';
import { isDefined } from '@/utils/nullables';

const errorBoundaryErrorHandler = ({ error }: Omit<FallbackProps, 'resetErrorBoundary'>): void => {
  // Do something with the error
  // E.g. log to an error logging client here
  console.error('CustomErrorBoundary error :', error);
};

interface ICustomErrorBoundaryFallbackProps extends FallbackProps {
  fullScreen?: boolean | undefined;
  componentId?: string | undefined;
  componentName?: string | undefined;
  componentType?: string | undefined;
}

const CustomErrorBoundaryFallbackComponent: FC<ICustomErrorBoundaryFallbackProps> = ({
  componentId,
  componentName,
  componentType,
  fullScreen = false,
  error,
  resetErrorBoundary,
}) => {
  const { styles } = useStyles();
  const { router } = useShaRouting();
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

  if (SheshaError.isSheshaError(error)) {
    const shaErrors = error.cause?.errors;
    if (isDefined(shaErrors)) {
      if (!shaErrors.componentId) shaErrors.componentId = componentId;
      if (!shaErrors.componentName) shaErrors.componentName = componentName;
      if (!shaErrors.componentType) shaErrors.componentType = componentType;
    }
    return <ComponentError errors={shaErrors} message={error.message} type={error.cause?.type} />;
  }

  const shaError = {
    hasErrors: true,
    componentName: componentName,
    componentType: componentType,
    errors: [{ error: error.message }],
  } as IModelValidation;

  const shaMessage = `An error has occurred when '${componentName}' (${componentType}) rendered`;

  return <ComponentError errors={shaError} message={shaMessage} type="error" />;
};

export default CustomErrorBoundaryFallbackComponent;
