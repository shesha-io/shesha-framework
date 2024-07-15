'use client';

import React from 'react';
import { ConfigurableForm } from '@/components';

const Login = () => {
  return <ConfigurableForm mode={'edit'} formId={{ module: 'TestModule', name: 'demo-test' }} />;
};

export default Login;
