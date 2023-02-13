import React from 'react';
import { SortableContainer as SortableContainerWrapper } from 'react-sortable-hoc';

export const SortableContainer = SortableContainerWrapper(({ children }) => {
  return <tbody>{children}</tbody>;
});
