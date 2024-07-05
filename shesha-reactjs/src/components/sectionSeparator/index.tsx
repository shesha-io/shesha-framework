import React, { CSSProperties, FC, ReactNode } from 'react';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { ConfigProvider, Divider, Space, Tooltip } from 'antd';
import Show from '@/components/show';
import { useStyles } from './styles/styles';

export interface ISectionSeparatorProps {
  id?: string;
  title?: string | ReactNode;
  containerStyle?: CSSProperties;
  titleStyle?: CSSProperties;
  tooltip?: string;
  fontSize?: number;
  fontColor?: string;
  inline?: boolean;
  dashed?: boolean;
  lineColor?: string;
  lineThickness?: number;
  lineWidth?: number;
  lineHeight?: number;
  noMargin?: boolean;
  labelAlign?: 'left' | 'center' | 'right';
  dividerType?: 'horizontal' | 'vertical';
}

export const SectionSeparator: FC<ISectionSeparatorProps> = ({
  labelAlign,
  fontSize,
  fontColor,
  inline,
  dashed,
  lineColor,
  lineThickness,
  lineWidth = "100%",
  lineHeight,
  dividerType,
  containerStyle,
  titleStyle,
  tooltip,
  title,
  noMargin
}) => {
  const { styles } = useStyles();

  const borderStyle = {
    '--border-thickness': `${lineThickness}px`,
    '--border-style': dashed ? 'dashed' : 'solid',
    '--border-color': lineColor || styles.primaryColor,
    textAlign: labelAlign
  } as CSSProperties;

  const titleComponent = () => {
    if (!title) return null;

    const titleStyles = {
      ...titleStyle,
      ...(fontSize && { fontSize }),
      ...(fontColor && { color: fontColor }),
    };

    return (
      <span style={{
        ...titleStyles
      }}>
        <Space size="small" style={{ flexWrap: "nowrap", alignContent: "center" }}>
          {title}
          <Show when={Boolean(tooltip?.trim())}>
            <Tooltip title={tooltip}>
              <QuestionCircleOutlined className='tooltip-question-icon' style={{ fontSize: 14, color: 'gray', verticalAlign: "middle" }} />
            </Tooltip>
          </Show>
        </Space>
      </span>
    );
  };

  const commonProps = {
    style: { ...containerStyle, minWidth: "100px", width: lineWidth }
  };

  if (inline || dividerType === 'vertical') {
    return (
      <div {...commonProps}>
        <ConfigProvider
          theme={{
            token: {
              colorSplit: lineColor || styles.primaryColor,
              colorText: fontColor || '#000',
              lineWidth: lineThickness,
              fontSize: lineHeight || fontSize,
            },
          }}
        >
          <Divider
            type={dividerType}
            orientation={labelAlign}
            orientationMargin={noMargin ? "0" : undefined}
            dashed={dashed}
          >
            {titleComponent()}
          </Divider>
        </ConfigProvider>
      </div>
    );
  }

  return (
    <div {...commonProps}>
      <div className={styles.shaSectionSeparator} style={borderStyle}>
        {titleComponent()}
      </div>
    </div>
  );
};

export default SectionSeparator;