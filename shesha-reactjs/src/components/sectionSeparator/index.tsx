import { QuestionCircleOutlined } from '@ant-design/icons';
import { Space, Tooltip } from 'antd';
import Show from '@/components/show';
import React, { CSSProperties, FC, ReactNode } from 'react';

export interface ISectionSeparatorProps {
  /**
   * @deprecated - use `title` instead
   * Section name
   */
  sectionName?: string;

  /**
   * Title of the section
   */
  title?: string | ReactNode;

  /**
   * The style that will be applied to the container of the section
   */
  containerStyle?: CSSProperties;

  /**
   * The style that will be applied to the style of the section
   */
  titleStyle?: CSSProperties;

  /**
   * The tooltip of the section
   */
  tooltip?: string;
}

/** A component for separating the content on the form */
export const SectionSeparator: FC<ISectionSeparatorProps> = ({
  sectionName = '',
  containerStyle,
  titleStyle,
  tooltip,
  title,
}) => {
  const sectionTitle = title || sectionName;

  return (
    <div className="sha-section-separator" style={containerStyle}>
      <span className="sha-section-separator-section-name" style={titleStyle}>
        <Space size="small">
          {sectionTitle}
          <Show when={Boolean(tooltip?.trim())}>
            <Tooltip title={tooltip}>{<QuestionCircleOutlined className='tooltip-question-icon' size={14} />}</Tooltip>
          </Show>
        </Space>
      </span>
    </div>
  );
};

export default SectionSeparator;
