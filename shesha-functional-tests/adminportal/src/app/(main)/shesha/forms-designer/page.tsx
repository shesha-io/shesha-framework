"use client";

import React, { FC } from 'react';
import { FormIdentifier, FormsDesignerPage } from '@shesha-io/reactjs';
import { useSearchParams, notFound } from 'next/navigation';

const Page: FC = () => {
    const query = useSearchParams();
    const id = query.get("id");
    const name = query.get("name");
    const moduleName = query.get("module");

    const formId: FormIdentifier = id
        ? id
        : name
            ? {
                name: name,
                module: moduleName
            }
            : undefined;

    if (!formId)
        return notFound();

    return <FormsDesignerPage formId={formId} />;
};

export default Page;
