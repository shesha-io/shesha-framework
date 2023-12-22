import React from 'react';
import { ConfigurableThemePage } from '@/generic-pages/settings/dynamic-theme';
import { getLayout } from '@/components/mainLayout/index';
import { PageWithLayout } from '@/interfaces';

const Page: PageWithLayout<{}> = (props) => {
  return <ConfigurableThemePage {...props} />;
};

Page.getLayout = getLayout;

export default Page;
