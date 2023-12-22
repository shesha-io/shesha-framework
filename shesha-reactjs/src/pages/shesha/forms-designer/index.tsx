import React from 'react';
import { FormIdentifier, PageWithLayout } from '@/interfaces';
import { FormsDesignerPage } from '@/generic-pages/forms-designer';
import { getLayout } from '@/components/mainLayout';

interface IFormsDesignerPageProps {
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

const Page: PageWithLayout<IFormsDesignerPageProps> = (props) => {
    const formId: FormIdentifier = props.id
        ? props.id
        : {
            name: props.name,
            module: props.module
        };

    return <FormsDesignerPage {...props} formId={formId} />;
};

export default Page;

Page.getLayout = getLayout;
