import React, { FC } from 'react';
import { CloseCircleFilled } from '@ant-design/icons';
import { IAsyncValidationError } from '@/interfaces';
import { Popover } from 'antd';

export interface IValidationIconProps {
  validationErrors: IAsyncValidationError[];
}

export const ValidationIcon: FC<IValidationIconProps> = ({ validationErrors }) => {
  const getPopupContent = (): JSX.Element => {
    return (
      <ul className="sha-component-validation-errors">
        {validationErrors.map((error, idx) => (
          <li key={idx}>
            {error.field && <strong>{error.field}:</strong>}
            {error.message}
          </li>
        ))}
      </ul>
    );
  };

  return (
    <Popover content={getPopupContent()}>
      <CloseCircleFilled className="sha-component-validation-icon" />
    </Popover>
  );
};

export default ValidationIcon;
