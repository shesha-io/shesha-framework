import { FC, ReactElement, ReactNode } from 'react';

export type PageWithLayout<T = unknown> = FC<T> & {
  getLayout?: (page: ReactElement) => ReactNode;
  requireAuth?: boolean;
};
