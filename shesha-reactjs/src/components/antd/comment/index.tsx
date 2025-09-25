import classNames from 'classnames';
import * as React from 'react';
import { ConfigProvider } from 'antd';

import useStyle from './style';

const { ConfigContext } = ConfigProvider;

export interface CommentProps {
  /** List of action items rendered below the comment content */
  actions?: React.ReactNode[];
  /** The element to display as the comment author. */
  author?: React.ReactNode;
  /** The element to display as the comment avatar - generally an antd Avatar */
  avatar?: React.ReactNode;
  /** ClassName of comment */
  className?: string;
  /** The main content of the comment */
  content: React.ReactNode;
  /** Nested comments should be provided as children of the Comment */
  children?: React.ReactNode;
  /** Comment prefix defaults to '.ant-comment' */
  prefixCls?: string;
  /** Additional style for the comment */
  style?: React.CSSProperties;
  /** A datetime element containing the time to be displayed */
  datetime?: React.ReactNode;
}

const Comment: React.FC<CommentProps> = ({
  actions,
  author,
  avatar,
  children,
  className,
  content,
  prefixCls: customizePrefixCls,
  datetime,
  ...otherProps
}) => {
  const { getPrefixCls, direction } = React.useContext(ConfigContext) ?? {};

  const renderNested = (prefixCls: string, nestedChildren: any) => (
        <div className={classNames(`${prefixCls}-nested`)}>{nestedChildren}</div>
  );

  const prefixCls = getPrefixCls('comment', customizePrefixCls);
  const [wrapSSR, hashId] = useStyle(prefixCls);

  const avatarDom = avatar ? (
        <div className={`${prefixCls}-avatar`}>
            {typeof avatar === 'string' ? <img src={avatar} alt="comment-avatar" /> : avatar}
        </div>
  ) : null;

  const actionDom =
        actions && actions.length ? (
            <ul className={`${prefixCls}-actions`}>
                {actions.map((action, index) => (
                    <li key={`action-${index}`}>{action}</li>
                ))}
            </ul>
        ) : null;

  const authorContent = (author || datetime) && (
        <div className={`${prefixCls}-content-author`}>
            {author && <span className={`${prefixCls}-content-author-name`}>{author}</span>}
            {datetime && <span className={`${prefixCls}-content-author-time`}>{datetime}</span>}
        </div>
  );

  const contentDom = (
        <div className={`${prefixCls}-content`}>
            {authorContent}
            <div className={`${prefixCls}-content-detail`}>{content}</div>
            {actionDom}
        </div>
  );

  const cls = classNames(
    prefixCls,
    {
      [`${prefixCls}-rtl`]: direction === 'rtl',
    },
    className,
    hashId,
  );

  return wrapSSR(
        <div {...otherProps} className={cls}>
            <div className={`${prefixCls}-inner`}>
                {avatarDom}
                {contentDom}
            </div>
            {children ? renderNested(prefixCls, children) : null}
        </div>,
  );
};

export default Comment;
