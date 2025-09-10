import { createNamedContext } from '@/utils/react';
import { ColProps } from 'antd';

export interface IListItemState {
  index?: number;
  prefix?: string;
  layout?: {
    labelCol?: ColProps;
    wrapperCol?: ColProps;
  };
}

export const ListItemContext = createNamedContext<IListItemState>({
  index: undefined,
  prefix: undefined,
}, "ListItemContext");
