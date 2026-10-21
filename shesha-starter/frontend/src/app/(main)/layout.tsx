"use client";

import { useLayoutSelection } from '@shesha-io/reactjs';
import { LAYOUT_MODE, ACTIVE_HEADER, ACTIVE_FOOTER } from '@/app-constants/layout';
import { FC, PropsWithChildren } from 'react';

const Layout: FC<PropsWithChildren> = ({ children }) => {
  const { LayoutComponent } = useLayoutSelection(LAYOUT_MODE);

  return (
    <LayoutComponent
      noPadding
      headerFormId={ACTIVE_HEADER}
      footerFormId={ACTIVE_FOOTER}
    >
      {children}
    </LayoutComponent>
  );
};

export default Layout;
