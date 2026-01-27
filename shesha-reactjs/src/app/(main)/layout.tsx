"use client";

import React from 'react';
import { useLayoutSelection } from '@/hooks/useLayoutSelection';
import { LAYOUT_MODE } from '@/components/mainLayout/constant';

export default function CommonLayout({
  children,
}: {
  children: React.ReactNode;
}): JSX.Element {
  const { LayoutComponent } = useLayoutSelection(LAYOUT_MODE);

  return (
    <LayoutComponent noPadding>
      {children}
    </LayoutComponent>
  );
};
