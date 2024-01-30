import React, { FC } from 'react';
import { ValidationIcon } from '@/components';

interface IConfirmPasswordChecklistProps {
  readonly password?: string;
  readonly confirmPassword?: string;
}

export const ConfirmPasswordChecklist: FC<IConfirmPasswordChecklistProps> = ({ password, confirmPassword }) => {
  return (
    <div className="confirm-password-checklist">
      {<ValidationIcon valid={Boolean(password) && password === confirmPassword} />} confirm password must match the
      password
    </div>
  );
};

export default ConfirmPasswordChecklist;
