import React, { FC, PropsWithChildren } from 'react';

export interface IPageBtnContainerProps extends PropsWithChildren<any> {}

export const PageBtnContainer: FC<IPageBtnContainerProps> = ({ children }) => {
  return <div className="sha-page-btn-container">{children}</div>;
};

export default PageBtnContainer;
