import React, { FC } from 'react';
import { nanoid } from 'nanoid/non-secure';
import NodeOrFuncRenderer, { ReactNodeOrFunc } from '../nodeOrFuncRenderer';
import { IToolbarItem } from '../../interfaces';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import ActionButtonGroup from '../actionButtonGroup';
import classNames from 'classnames';

export interface IIndexToolbarProps {
  items: IToolbarItem[];
  elementsRight?: ReactNodeOrFunc;
  className?: string;
  btnSize?: SizeType;
}

export const IndexToolbar: FC<IIndexToolbarProps> = ({ items, elementsRight, className, btnSize = 'middle' }) => {
  return (
    <div className={classNames('sha-index-toolbar', className)}>
      <div className="sha-index-toolbar-left">
        <ActionButtonGroup items={items} btnSize={btnSize} />
      </div>

      <div className="sha-index-toolbar-right">
        {Array.isArray(elementsRight) ? (
          elementsRight?.map(element => <span key={nanoid()}>{element}</span>)
        ) : (
          <NodeOrFuncRenderer>{elementsRight}</NodeOrFuncRenderer>
        )}
      </div>
    </div>
  );
};

export default IndexToolbar;
