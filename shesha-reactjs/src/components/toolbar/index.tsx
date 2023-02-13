import React, { FC } from 'react';
import { nanoid } from 'nanoid/non-secure';
import NodeOrFuncRenderer, { ReactNodeOrFunc } from '../nodeOrFuncRenderer';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import classNames from 'classnames';
import ToolbarButtonGroup from './toolbarButtons';
import { IToolbarButtonItem } from './models';

export interface IIndexToolbarProps {
  items: IToolbarButtonItem[];
  elementsRight?: ReactNodeOrFunc;
  className?: string;
  btnSize?: SizeType;
}

export const Toolbar: FC<IIndexToolbarProps> = ({ items, elementsRight, className, btnSize = 'middle' }) => {
  return (
    <div className={classNames('sha-index-toolbar', className)}>
      <div className="sha-index-toolbar-left">
        <ToolbarButtonGroup items={items} btnSize={btnSize} />
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

export default Toolbar;
