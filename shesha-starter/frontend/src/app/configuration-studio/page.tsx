"use client";

import React, { ReactElement } from 'react';
import { ConfigurationStudio, PageWithLayout } from '@shesha-io/reactjs';

const Page: PageWithLayout<{}> = () => {
  return <ConfigurationStudio />;
};

// Render full-screen: no MainLayout wrapper.
Page.getLayout = (page: ReactElement) => page;

export default Page;
