import React, { FC, PropsWithChildren } from 'react';

interface IToolbarWrapperProps {}

export const ToolbarWrapper: FC<PropsWithChildren<IToolbarWrapperProps>> = ({ children }) => (
  <div className="toolbar-wrapper">
    {children}
  </div>
);

export default ToolbarWrapper;
