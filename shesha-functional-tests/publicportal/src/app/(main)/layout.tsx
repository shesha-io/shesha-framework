"use client";

import { ReactNode } from 'react';
import { MainLayout } from '@shesha-io/reactjs';

export default function Layout({
  children,
}: {
  children: ReactNode;
}): ReactNode {
  return (
    <MainLayout>
      {children}
    </MainLayout>
  );
};
