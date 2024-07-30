import React, { CSSProperties, FC, ReactNode, useEffect, useRef, useState } from 'react';
import { useStyles } from './styles/styles';
import { addPx } from './utils';
import Show from '../show';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';

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
  fontWeight?: string;
}

export const SectionSeparator: FC<ISectionSeparatorProps> = ({
  id,
  labelAlign = 'left',
  fontSize = 14,
  fontColor = '#000',
  fontWeight = '500',
  inline,
  dashed,
  lineColor,
  lineThickness = 2,
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
  const titleRef = useRef<HTMLDivElement>(null);
  const [titleWidth, setTitleWidth] = useState(0);

  useEffect(() => {
    if (titleRef.current) {
      setTitleWidth(titleRef.current.offsetWidth);
    }
  }, [title]);

  const vertical = orientation === 'vertical';

  const borderStyle: CSSProperties = {
    '--border-thickness': `${lineThickness ?? 2}px`,
    '--border-style': dashed ? 'dashed' : 'solid',
    '--border-color': lineColor || styles.primaryColor,
    textAlign: labelAlign,
    marginBottom: '8px',
  } as CSSProperties;

  const baseStyle: CSSProperties = {
    borderBottom: inline ? `${lineThickness}px ${dashed ? 'dashed' : 'solid'} ${lineColor || styles.primaryColor}` : 'none',
  };

  const getLineStyles = (isLeft: boolean) => {

    if ((isLeft && labelAlign === 'left') || (!isLeft && labelAlign === 'right')) {
      return { width: `calc(${titleMargin || 0}% - ${titleWidth / 2}px)` };
    }

    return { flex: 1 };
  };

  const renderTitle = () => {
    if (!title) return null;

    let titleMarginStyle: CSSProperties = { margin: '0 8px', display: 'flex', alignItems: 'center' };
    if (titleMargin) {
      titleMarginStyle = { margin: `0 8px`, display: 'flex', alignItems: 'center' };
    } else if (labelAlign === 'left') {
      titleMarginStyle = { margin: '0 8px 0 0', display: 'flex', alignItems: 'center' };
    } else if (labelAlign === 'right') {
      titleMarginStyle = { margin: '0 0 0 8px', display: 'flex', alignItems: 'center' };
    }

    return (
      <div className={styles.titleContainer} style={{ alignItems: 'center', display: 'flex', width: '100%' }
      }>
        <div style={{ ...getLineStyles(true), ...baseStyle }}></div>
        < div ref={titleRef} style={{ ...titleStyle, ...titleMarginStyle, whiteSpace: 'nowrap', color: fontColor, fontSize, fontWeight }
        }>
          {title}
          < Show when={Boolean(tooltip?.trim())}>
            <Tooltip title={tooltip}>
              <QuestionCircleOutlined
                className={styles.helpIcon}
              />
            </Tooltip>
          </Show>
        </div>
        < div style={{ ...getLineStyles(false), ...baseStyle }}> </div>
      </div>
    );
  };

  return (
    vertical ? (<div className={styles.vertical} style={{ ...borderStyle, ...containerStyle, height: addPx(lineHeight || '0.9em') }}></div>) :
      <div style={{
        ...containerStyle,
        width: addPx(lineWidth),
        margin: '8px 0',
      }} key={id} >
        <div className={!inline || !title ? styles.shaSectionSeparator : ''} style={borderStyle} >
          {renderTitle()}
        </div>
      </div>
  );
};

export default SectionSeparator;
