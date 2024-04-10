"use client";

import React, { FC } from 'react';
import { FormIdentifier, DynamicPage } from '@shesha-io/reactjs';
import { notFound } from 'next/navigation';

interface PageProps {
  params: { path: string[] };
  searchParams: NodeJS.Dict<string | string[]>;
}

const DynamicPageInternal: FC<PageProps> = (props) => {
  const { params, searchParams } = props;

  // possible values of path:
  // 1. array with one element: [formName]
  // 2. array with two elements: [moduleName, formName]
  const fullPath = params.path && Array.isArray(params.path)
    ? params.path.length === 1
      ? [null, params.path[0]]
      : params.path.length === 2
        ? [params.path[0], params.path[1]]
        : [null, null]
    : [null, null];
  const moduleName = fullPath[0];
  const formName = fullPath[1];

  if (!formName)
    return notFound();

  const formId: FormIdentifier = {
    module: moduleName, 
    name: formName
  };

  return <DynamicPage {...searchParams} formId={ formId }/>;
};

export default DynamicPageInternal;