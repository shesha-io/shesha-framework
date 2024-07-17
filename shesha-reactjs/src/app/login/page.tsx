'use client';

import React from 'react';
import { ConfigurableForm } from '@/components';
import { LOGIN_CONFIGURATION } from '@/components/mainLayout/constant';
import { FormFullName } from '@/providers';

const Login = () => <ConfigurableForm mode={'edit'} formId={LOGIN_CONFIGURATION as FormFullName} />;

export default Login;
