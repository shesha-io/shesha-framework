"use client";

import React from 'react';
import { PageWithLayout } from '@/interfaces';
import { DemoForm } from './demoForm';
import KeyboardTree from './tree';
import FileTree from './fileTree';
import TabContextMenuExample from './tabs';

const treeData = [
  {
    title: 'Parent 1',
    key: 'p1',
    children: [
      { title: 'Child 1', key: 'c1' },
      { title: 'Child 2', key: 'c2' },
    ],
  },
  {
    title: 'Parent 2',
    key: 'p2',
    children: [
      { title: 'Child 3', key: 'c3' },
      { title: 'Child 4', key: 'c4' },
    ],
  },
];

const Page: PageWithLayout<{}> = () => {
  return (
    <TabContextMenuExample/>
  );
  return (
    <FileTree/>
  );
  return (
    <KeyboardTree treeData={treeData} />
  );
  const initialValues = {
    name: 'John Doe',
    email: 'john@example.com',
    description: 'Initial description',
  };

  return <DemoForm initialValues={initialValues} />;
};

export default Page;