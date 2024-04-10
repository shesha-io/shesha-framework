import React, { FC } from 'react';
import { ValidationIcon } from '../validationIcon';
import { getPasswordValidations } from 'utils/auth';

interface IProps {
  readonly password?: string;
}

export const PasswordChecklist: FC<IProps> = ({ password }) => {
  const { hasEightChars, hasLowerCaseChar, hasNumericChar, hasSpecialChar, hasUpperCaseChar } = getPasswordValidations(
    password || ''
  );

  return (
    <div className="password-checklist">
      <p>{<ValidationIcon valid={hasLowerCaseChar} />} contain at least 1 lowercase alphabetical character</p>
      <p>{<ValidationIcon valid={hasUpperCaseChar} />} contain at least 1 uppercase alphabetical character</p>
      <p>{<ValidationIcon valid={hasNumericChar} />} contain at least 1 numeric character</p>
      <p>{<ValidationIcon valid={hasSpecialChar} />} contain at least one special character</p>
      <p>{<ValidationIcon valid={hasEightChars} />} be eight characters or longer</p>
    </div>
  );
};

export default PasswordChecklist;
