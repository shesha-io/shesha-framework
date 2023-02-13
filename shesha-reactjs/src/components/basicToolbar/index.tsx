import React, { FC, ReactNode, Fragment } from 'react';
import ToolbarWrapper from '../toolbarWrapper';
import { Button, Tooltip } from 'antd';
import { nanoid } from 'nanoid/non-secure';
import { IToolbarItem } from '../..';

interface IBasicToolbarProps {
  items: IToolbarItem[];
  extra?: ReactNode;
}

export const BasicToolbar: FC<IBasicToolbarProps> = ({ items, extra }) => (
  <ToolbarWrapper>
    <div className="toolbar-wrapper-left">
      <Fragment>
        {items.map(({ title, icon, onClick, hide, className, disabled, tooltip, tooltipName }) =>
          !hide ? (
            <Button
              onClick={onClick}
              disabled={disabled}
              className={`toolbar-item ${disabled ? 'disabled' : ''} ${className || ''}`}
              key={nanoid()}
              type="link"
              icon={icon}
            >
              {tooltipName || tooltip ? (
                <Tooltip title={tooltipName || tooltip} placement="right">
                  <span>{title}</span>
                </Tooltip>
              ) : (
                title
              )}
            </Button>
          ) : (
            undefined
          )
        )}
      </Fragment>
    </div>
    <div className="toolbar-wrapper-right">{extra}</div>
  </ToolbarWrapper>
);

export default BasicToolbar;
