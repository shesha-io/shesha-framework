import React from 'react';
import { EntityConfiguratorPage, PageWithLayout } from '@shesha/reactjs';
import dynamic from 'next/dynamic';
import { getLayout } from 'src/components/layouts';

const LazyLoadedPage = dynamic(
  async () => {
    const modules = await import('@shesha/reactjs');
    return modules.EntityConfiguratorPage;
  },
  { ssr: false }
);

export const Page: PageWithLayout<{ id: string }> = ({ id }) => {
  return <EntityConfiguratorPage />
  //return <LazyLoadedPage id={id} />;
};

Page.getLayout = getLayout;

export default Page;
