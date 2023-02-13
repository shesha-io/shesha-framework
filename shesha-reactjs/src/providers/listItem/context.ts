import { ColProps } from 'antd';
import React from 'react';

export interface IListItemState {
  index?: number;
  prefix?: string;
  layout?: {
    labelCol?: ColProps;
    wrapperCol?: ColProps;
  };
}

export const ListItemContext = React.createContext<IListItemState>({
  index: undefined,
  prefix: undefined,
});
