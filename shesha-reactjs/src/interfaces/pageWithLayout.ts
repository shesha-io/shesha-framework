import { FC, ReactElement, ReactNode } from 'react';

export type PageWithLayout<T = any> = FC<T> & {
  getLayout?: (page: ReactElement) => ReactNode;
  requireAuth?: boolean;
};
