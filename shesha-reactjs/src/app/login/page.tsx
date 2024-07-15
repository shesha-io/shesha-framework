'use client';

import React from 'react';
import { ConfigurableForm } from '@/components';

const Login = () => {
  return <ConfigurableForm mode={'edit'} formId={{ module: 'Shesha', name: 'loginTest' }} />;
};

export default Login;
