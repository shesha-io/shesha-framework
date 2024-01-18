"use client";

import React from 'react';
import { FormIdentifier, PageWithLayout } from '@/interfaces';
import { FormsDesignerPage } from '@/generic-pages/forms-designer';

interface ISearchParams {
    /**
     * Form name.
     */
    name?: string;

    /**
     * Module name.
     */
    module?: string;

    /**
     * Form id
     */
    id?: string;
}
interface IFormsDesignerPageProps {
    searchParams: ISearchParams;
}

const Page: PageWithLayout<IFormsDesignerPageProps> = ({ searchParams }) => {
    const formId: FormIdentifier = searchParams.id
        ? searchParams.id
        : {
            name: searchParams.name,
            module: searchParams.module
        };

    console.log("LOG: formId", formId, searchParams);

    return <FormsDesignerPage formId={formId} />;
};

export default Page;
