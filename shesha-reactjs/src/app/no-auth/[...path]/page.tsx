"use client";

import React, { ReactNode } from 'react';
import { FormIdentifier } from '@/interfaces';
import { DynamicPage } from '@/generic-pages/dynamic';
import { notFound } from 'next/navigation';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';

interface AsyncPageProps {
  params: Promise<{ path: string[] }>;
  searchParams: Promise<NodeJS.Dict<string | string[]>>;
}

const DynamicPageInternal = async (props: AsyncPageProps): Promise<ReactNode> => {
  const params = await props.params;
  const searchParams = await props.searchParams;

  // possible values of path:
  // 1. array with one element: [formName]
  // 2. array with two elements: [moduleName, formName]
  const fullPath = isDefined(params.path) && Array.isArray(params.path)
    ? params.path.length === 1
      ? [null, params.path[0]]
      : params.path.length === 2
        ? [params.path[0], params.path[1]]
        : [null, null]
    : [null, null];
  const moduleName = fullPath[0];
  const formName = fullPath[1];

  if (isNullOrWhiteSpace(moduleName) || isNullOrWhiteSpace(formName))
    return notFound();

  const formId: FormIdentifier = {
    module: moduleName,
    name: formName,
  };

  return <DynamicPage {...searchParams} formId={formId} />;
};

export default DynamicPageInternal;
