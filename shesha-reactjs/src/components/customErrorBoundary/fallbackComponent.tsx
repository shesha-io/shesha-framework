import React, { FC } from 'react';
import { FallbackProps } from 'react-error-boundary';
import { FrownTwoTone } from '@ant-design/icons';
import { Button, Space } from 'antd';
import { useStyles } from './styles/styles';
import { useShaRouting } from '@/providers';

const errorBoundaryErrorHandler = ({ error }: Omit<FallbackProps, 'resetErrorBoundary'>) => {
  // Do something with the error
  // E.g. log to an error logging client here
  console.error('CustomErrorBoundary error :', error);
};

interface ICustomErrorBoundaryFallbackProps extends FallbackProps {
  fullScreen?: boolean;
}

const CustomErrorBoundaryFallbackComponent: FC<ICustomErrorBoundaryFallbackProps> = ({
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

  return (
    <div className={styles.errorScreen}>
      <h2>An error has occured</h2>
      <h4>{error?.message}</h4>
      {typeof resetErrorBoundary === 'function' && <button onClick={resetErrorBoundary}>Try again</button>}
    </div>
  );
};

export default CustomErrorBoundaryFallbackComponent;
