import React from 'react';
import dynamic from 'next/dynamic';
import { getLayout } from 'src/components/layouts';
import { NextPageWithLayout } from 'models';
import { FormIdentifier } from '@shesha/reactjs/dist/providers/form/models';

type FormMode = 'designer' | 'edit' | 'readonly';

interface IDynamicPageProps {
  /**
   * Form path.
   */
  path?: string;

  /**
   * Entity id. This should not be confused with the form id
   */
  id?: string;

  /**
   * form mode.
   */
  mode?: FormMode;
}

const LazyLoadedPage = dynamic(
  async () => {
    const modules = await import('@shesha/reactjs');
    return modules.DynamicPage;
  },
  { ssr: false }
);

const DynamicPage: NextPageWithLayout<IDynamicPageProps> = (props) => {
  // possible values of path:
  // 1. array with one element: [formName]
  // 2. array with two elements: [moduleName, formName]
  const fullPath = props.path && Array.isArray(props.path)
    ? props.path.length === 1
      ? [null, props.path[0]]
      : props.path.length === 2
        ? [props.path[0], props.path[1]]
        : [null, null]
    : [null, null];
  const module = fullPath[0];
  const formName = fullPath[1];

  const formId: FormIdentifier = {
    module: module, 
    name: formName
  };
  
  console.log('formId', formId, props)

  return <LazyLoadedPage {...props} formId={ formId }/>;
};

export default DynamicPage;

DynamicPage.getLayout = getLayout;
