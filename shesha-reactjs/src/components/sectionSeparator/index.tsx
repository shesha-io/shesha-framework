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
  orientation?: 'horizontal' | 'vertical';
}

export const SectionSeparator: FC<ISectionSeparatorProps> = ({
  labelAlign,
  fontSize,
  fontColor,
  inline,
  dashed,
  lineColor,
  lineThickness,
  lineWidth,
  lineHeight,
  orientation,
  containerStyle,
  titleStyle,
  tooltip,
  title,
  noMargin
}) => {
  const { styles } = useStyles();

  const borderStyle = {
    '--border-thickness': `${lineThickness || 2}px`,
    '--border-style': dashed ? 'dashed' : 'solid',
    '--border-color': lineColor || styles.primaryColor,
    textAlign: `${labelAlign || 'left'}`,
    marginBottom: '8px'
  } as CSSProperties;

  const titleComponent = () => {
    if (!title) return null;

    const titleStyles = {
      ...titleStyle,
      fontSize: fontSize,
      padding: inline ? '0 6px' : '0',
      ...(fontColor && { color: fontColor }),
    };

    return (
      <span style={{
        ...titleStyles
      }}>
        <Space size="small" style={{
          flexWrap: "nowrap",
        }}>

          {title}
          <Show when={Boolean(tooltip?.trim())}>
            <Tooltip title={tooltip}>
              <QuestionCircleOutlined className={`tooltip-question-icon ${styles.helpIcon}`} />
            </Tooltip>
          </Show>
        </Space>
      </span>
    );
  };

  const commonStyle = { ...containerStyle, minWidth: "100px", width: `${lineWidth}px` };

  if (inline || orientation === 'vertical') {
    return (
      <div style={commonStyle}>
        <ConfigProvider
          theme={{
            token: {
              colorSplit: lineColor || styles.primaryColor,
              colorText: fontColor || '#000',
              lineWidth: lineThickness || 2,
              fontSize: lineHeight || fontSize,
              margin: 8
            },
          }}
        >
          <Divider
            type={orientation}
            orientation={labelAlign}
            orientationMargin={noMargin ? "0" : null}
            dashed={dashed}
          >
            {titleComponent()}
          </Divider>
        </ConfigProvider>
      </div>
    );
  }

  return (
    <div style={commonStyle}>
      <div className={styles.shaSectionSeparator} style={borderStyle}>
        {titleComponent()}
      </div>
    </div>
  );
};

export default SectionSeparator;