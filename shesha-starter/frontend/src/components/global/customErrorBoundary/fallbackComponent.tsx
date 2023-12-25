import React, { FC } from 'react';
import Router from 'next/router';
import { Button } from 'antd';
import { CustomErrorBoundaryContainer } from './styles';
import { FallbackProps } from 'react-error-boundary';
import { FrownTwoTone } from '@ant-design/icons';

const errorBoundaryErrorHandler = ({ error }: FallbackProps) => {
  // Do something with the error
  // E.g. log to an error logging client here
  console.log('CustomErrorBoundary error :', error.message);
};

const CustomErrorBoundaryFallbackComponent: FC<FallbackProps> = (props) => {
  errorBoundaryErrorHandler(props);

  return (
    <CustomErrorBoundaryContainer>
      <h2 className="oops">Oops!</h2>
      <FrownTwoTone twoToneColor="#ffa800" className="error-icon" />
      <h3 className="primary-message">Aaaah! Something went wrong!</h3>
      <p className="secondary-message">
        Brace yourself till we get the error fixed. You may also refresh the page or try again later
      </p>

      <Button type="primary" onClick={() => Router.push('/')} className="take-me-home">
        TAKE ME HOME
      </Button>
    </CustomErrorBoundaryContainer>
  );
};

export default CustomErrorBoundaryFallbackComponent;
