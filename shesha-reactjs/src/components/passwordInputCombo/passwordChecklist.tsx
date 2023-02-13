import React, { FC } from 'react';
import { getPasswordValidations } from './utils';
import { ValidationIcon } from './validationIcon';
import { toWords } from 'number-to-words';

interface IProps {
  readonly password: string;
  readonly passwordLength?: number;
}

export const PasswordChecklist: FC<IProps> = ({ password, passwordLength = 4 }) => {
  const { hasEightChars, hasLowerCaseChar, hasNumericChar, hasSpecialChar, hasUpperCaseChar } = getPasswordValidations(
    password,
    passwordLength
  );

  return (
    <div className="password-checklist">
      <p>{<ValidationIcon valid={hasLowerCaseChar} />} contain at least 1 lowercase alphabetical character</p>
      <p>{<ValidationIcon valid={hasUpperCaseChar} />} contain at least 1 uppercase alphabetical character</p>
      <p>{<ValidationIcon valid={hasNumericChar} />} contain at least 1 numeric character</p>
      <p>{<ValidationIcon valid={hasSpecialChar} />} contain at least one special character</p>
      <p>
        {<ValidationIcon valid={hasEightChars} />} be {toWords(passwordLength)} characters or longer
      </p>
    </div>
  );
};

export default PasswordChecklist;
