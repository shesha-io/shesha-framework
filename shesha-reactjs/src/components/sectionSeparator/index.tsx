import React, { CSSProperties, FC, ReactNode } from 'react';
import { ConfigProvider, Divider } from 'antd';
import { useStyles } from './styles/styles';
import { addPx } from './utils';
import Title from './title';

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
  lineWidth?: string;
  lineHeight?: string;
  titleMargin?: number;
  labelAlign?: 'left' | 'center' | 'right';
  orientation?: 'horizontal' | 'vertical';
}

export const SectionSeparator: FC<ISectionSeparatorProps> = ({
  id,
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
  titleMargin
}) => {
  const { styles } = useStyles();

  const vertical = orientation === 'vertical';

  const borderStyle = {
    '--border-thickness': `${lineThickness || 2}px`,
    '--border-style': dashed ? 'dashed' : 'solid',
    '--border-color': lineColor || styles.primaryColor,
    textAlign: `${labelAlign || 'left'}`,
    marginBottom: '8px',
  } as CSSProperties;

  const renderTitle = () => {

    const titleStyles = {
      ...titleStyle,
      fontSize: fontSize || 14,
      color: fontColor || '#000',
    };

    return <Title
      labelAlign={labelAlign}
      title={title}
      tooltip={tooltip}
      titleStyles={{ ...titleStyles, }}
      titleMargin={titleMargin} />;
  };

  const defaultWidth = vertical ? 'max-content' : '100%';
  const commonStyle = {
    ...containerStyle,
    width: lineWidth && !vertical ? addPx(lineWidth)
      : defaultWidth, margin: vertical ? 8 : '8px 0px'
  };

  const dividerMargin = Number((titleMargin / 100).toFixed(2));

  if (inline || vertical) {
    return (
      <div style={commonStyle} key={id}>
        <ConfigProvider
          theme={{
            components: {
              Divider: {
                colorSplit: lineColor || styles.primaryColor,
                colorText: fontColor || '#000',
                lineWidth: lineThickness || 2,
                fontSize: addPx(lineHeight) || addPx(fontSize) || 14,
                orientationMargin: dividerMargin || 0.05,
                margin: 8,
              },
            },
          }}
        >
          <Divider
            type={orientation}
            orientation={labelAlign || 'left'}
            dashed={dashed}
            style={vertical ? { top: 0 } : {}}
            orientationMargin={titleMargin === 0 ? '0' : null}
          >
            {renderTitle()}
          </Divider>
        </ConfigProvider>
      </div>
    );
  }

  return (
    <div style={commonStyle} key={id}>
      <div className={styles.shaSectionSeparator} style={borderStyle}>
        {renderTitle()}
      </div>
    </div>
  );
};

export default SectionSeparator;