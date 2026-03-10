import { QuestionCircleOutlined } from '@ant-design/icons';
import { Tooltip } from 'antd';
import { css, cx } from 'antd-style';
import React, { PropsWithChildren, FC } from 'react';


export interface IHelpTextPopoverProps {
  content?: string;
}

export const HelpTextPopover: FC<PropsWithChildren<IHelpTextPopoverProps>> = ({ content, children }) => {
  const className = cx("sha-help-icon", css`
        cursor: help;
        font-size: 14px;
        color: #aaa;
        margin-left: 5px;
    `);
  return content
    ? (
      <>
        {children}
        <Tooltip title={content}>
          <QuestionCircleOutlined className={className} />
        </Tooltip>
      </>
    )
    : <>{children}</>;
};

export default HelpTextPopover;
