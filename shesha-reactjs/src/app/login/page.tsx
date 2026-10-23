'use client';

import { FC } from 'react';
import { LOGIN_CONFIGURATION } from '@/components/mainLayout/constant';
import { ConfigurableForm } from '@/components/configurableForm';

const Login: FC = () => (
  <ConfigurableForm mode="edit" formId={LOGIN_CONFIGURATION} />
);

export default Login;
