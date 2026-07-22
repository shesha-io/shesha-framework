'use client';

import React, { FC } from 'react';
import { ACTIVE_LOGIN } from '@/components/mainLayout/constant';
import { ConfigurableForm } from '@/components/configurableForm';

const Login: FC = () => (
  <ConfigurableForm mode="edit" formId={ACTIVE_LOGIN} />
);

export default Login;
