import React, { FC, PropsWithChildren, useContext } from 'react';
import { IListItemState, ListItemContext } from './context';

const ListItemProvider: FC<PropsWithChildren<IListItemState>> = ({ children, ...props }) => {
  return <ListItemContext.Provider value={props}>{children}</ListItemContext.Provider>;
};

const useListItemIndex = () => {
  const state = useContext(ListItemContext);

  return state;
};

export { ListItemProvider, useListItemIndex };

export default ListItemProvider;
