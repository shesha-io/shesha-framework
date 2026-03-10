import { Tag, TagProps } from 'antd';
import React, { FC } from 'react';

type TagWithText = {
  text: string;
} & TagProps;

export interface ITagProps {
  title?: string;
  tag: string | TagWithText;
}

export const PageHeaderTag: FC<ITagProps> = ({ title, tag }) => {
  const getTag = (): JSX.Element => {
    if (typeof tag === 'string') {
      return <span>{tag}</span>;
    }
    const { text, ...tagProps } = tag;

    return <Tag {...tagProps}>{text}</Tag>;
  };

  return (
    <span className="page-header-tags">
      <span className="page-header-tags-title">
        <strong>{title}</strong>
      </span>

      <span className="page-header-tags-tag">{getTag()}</span>
    </span>
  );
};

export default PageHeaderTag;
