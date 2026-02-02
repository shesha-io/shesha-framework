'use client';

import React from 'react';
import { ConfigurableForm } from '@/components';
import { ACTIVE_LOGIN } from '@/components/mainLayout/constant';
import { PageWithLayout } from '@/index';

const Login: PageWithLayout = () => (
  <ConfigurableForm mode="edit" formId={ACTIVE_LOGIN} />
);

export default Login;
