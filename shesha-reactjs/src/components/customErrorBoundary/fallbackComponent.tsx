import React, { FC } from 'react';
import { FallbackProps } from 'react-error-boundary';
import { FrownTwoTone } from '@ant-design/icons';
import { Button, Space } from 'antd';
import Router from 'next/router';
import './styles/index.less';

const errorBoundaryErrorHandler = ({ error }: Omit<FallbackProps, 'resetErrorBoundary'>) => {
  // Do something with the error
  // E.g. log to an error logging client here
  console.log('CustomErrorBoundary error :', error);
};

interface ICustomErrorBoundaryFallbackProps extends FallbackProps {
  fullScreen?: boolean;
}

const CustomErrorBoundaryFallbackComponent: FC<ICustomErrorBoundaryFallbackProps> = ({
  fullScreen = false,
  error,
  resetErrorBoundary,
}) => {
  errorBoundaryErrorHandler({ error });

  if (fullScreen) {
    return (
      <div className="custom-error-boundary">
        <h2 className="oops">Oops!</h2>
        <FrownTwoTone twoToneColor="#ffa800" className="error-icon" />
        <h3 className="primary-message">Aaaah! Something went wrong!</h3>
        <p className="secondary-message">
          Brace yourself till we get the error fixed. You may also refresh the page or try again later
        </p>

        <Space size="middle">
          <Button type="primary" onClick={() => Router.push('/')} className="take-me-home">
            TAKE ME HOME
          </Button>

          {typeof resetErrorBoundary === 'function' && (
            <Button onClick={resetErrorBoundary} className="take-me-home">
              Try again
            </Button>
          )}
        </Space>
      </div>
    );
  }

  return (
    <div className="error-screen">
      <h2>An error has occured</h2>
      <h4>{error?.message}</h4>
      {typeof resetErrorBoundary === 'function' && <button onClick={resetErrorBoundary}>Try again</button>}
    </div>
  );
};

export default CustomErrorBoundaryFallbackComponent;
