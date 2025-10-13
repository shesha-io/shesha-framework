"use client";

import React from 'react';
import { SettingsPage } from '@/generic-pages/settings-editor';
import { PageWithLayout } from '@/interfaces';

const Page: PageWithLayout = (props) => {
  return <SettingsPage {...props} />;
};

export default Page;
