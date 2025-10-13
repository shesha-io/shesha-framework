"use client";

import React from 'react';
import { useLayoutSelection } from '@/hooks/useLayoutSelection';

export default function CommonLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const { LayoutComponent } = useLayoutSelection('defaultLayout');

  return (
    <LayoutComponent noPadding>
      {children}
    </LayoutComponent>
  );
};
