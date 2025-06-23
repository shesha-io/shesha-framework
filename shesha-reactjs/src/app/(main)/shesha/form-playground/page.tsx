"use client";

import React from 'react';
import { PageWithLayout } from '@/interfaces';
import { DemoForm } from './demoForm';

const Page: PageWithLayout<{}> = () => {
    const initialValues = {
        name: 'John Doe',
        email: 'john@example.com',
        description: 'Initial description',
    };

    return <DemoForm initialValues={initialValues} />;
};

export default Page;