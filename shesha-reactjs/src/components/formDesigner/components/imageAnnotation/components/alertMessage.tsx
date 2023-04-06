import { Alert } from 'antd';
import React, { FC } from 'react';
import { IAlertMessage } from '../model';

const AlertMessage: FC<IAlertMessage> = ({ maxPoints, data }) => {

  const numberOfPoints = data?.length;

  const message = () => {
    if (!!maxPoints && numberOfPoints >= maxPoints) {
      return `You have reached the maximum of ${maxPoints} points required`;
    }
    return null;
  };

  return <>{!!message() && <Alert type="warning" showIcon message={message()} closable />}</>;
};

export default AlertMessage;
