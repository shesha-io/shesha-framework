import { FC, ReactElement, ReactNode } from 'react';

export type PageWithLayout<T> = FC<T> & {
  getLayout?: (page: ReactElement) => ReactNode;
};