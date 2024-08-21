import { Alert } from 'antd';
import React, { FC } from 'react';

interface IErrorMessage {
  maxPoints: number;
  maxReached?: boolean;
  isReadonly: boolean;
  width?: number;
  url?: string;
  notFoundUrl?: boolean;
}

const WarningMessage: FC<IErrorMessage> = ({ maxReached, maxPoints, isReadonly, width, url, notFoundUrl = false }) => {
  return (
    <>
      {!isReadonly && maxReached ? (
        <Alert message={`Maximum of ${maxPoints} points has been recorded`} banner closable style={{ width }} />
      ) : null}
      {notFoundUrl && <Alert message={`Image not found on this url : ${url}`} banner closable style={{ width }} />}
    </>
  );
};

export default WarningMessage;
