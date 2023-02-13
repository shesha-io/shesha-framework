import React, { FC } from 'react';

interface IToolbarWrapperProps {}

export const ToolbarWrapper: FC<IToolbarWrapperProps> = ({ children }) => (
  <div className="toolbar-wrapper">
    {children}
  </div>
);

export default ToolbarWrapper;
