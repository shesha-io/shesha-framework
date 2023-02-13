import React from 'react';
import dynamic from 'next/dynamic';
import { getLayout } from 'src/components/layouts';
import { NextPageWithLayout } from 'models';
import { FormIdentifier } from '@shesha/reactjs/dist/providers/form/models';

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

const LazyLoadedPage = dynamic(
    async () => {
        const modules = await import('@shesha/reactjs');
        return modules.FormsDesignerPage;
    },
    { ssr: false }
);

const FormsDesignerPage: NextPageWithLayout<IFormsDesignerPageProps> = (props) => {
    const formId: FormIdentifier = props.id
        ? props.id
        : {
            name: props.name,
            module: props.module
        };

    console.log('formId', formId, props)

    return <LazyLoadedPage {...props} formId={formId} />;
};

export default FormsDesignerPage;

FormsDesignerPage.getLayout = getLayout;
