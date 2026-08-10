import React, { CSSProperties, FC, ReactNode, useEffect, useRef, useState } from 'react';
import { useStyles } from './styles/styles';
import Show from '../show';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { addPx } from '@/utils/style';
import { titleDefaultStyles } from './utils';
import { useAvailableConstantsData } from '@/providers/form/utils';

export interface ISectionSeparatorProps {
  title?: string | ReactNode;
  containerStyle?: CSSProperties | undefined;
  titleStyle?: CSSProperties | undefined;
  tooltip?: string | undefined;
  inline?: boolean | undefined;
  lineColor?: string | undefined;
  lineThickness?: number | undefined;
  lineWidth?: string | undefined;
  lineHeight?: string | undefined;
  titleMargin?: number | undefined;
  marginBottom?: string | number | undefined;
  labelAlign?: 'left' | 'center' | 'right' | undefined;
  orientation?: 'horizontal' | 'vertical' | undefined;
  fontSize?: string | number | undefined;
  lineType?: string | undefined;
}

export const SectionSeparator: FC<ISectionSeparatorProps> = ({
  labelAlign = 'left',
  inline,
  lineType = 'solid',
  lineColor,
  lineThickness,
  lineWidth,
  lineHeight,
  orientation,
  containerStyle,
  titleStyle = titleDefaultStyles(),
  tooltip,
  title,
  titleMargin,
  marginBottom,
}) => {
  const { styles } = useStyles();
  const titleRef = useRef<HTMLDivElement>(null);
  const [titleWidth, setTitleWidth] = useState(0);
  const allData = useAvailableConstantsData();

  useEffect(() => {
    if (titleRef.current) {
      setTitleWidth(titleRef.current.offsetWidth);
    }
  }, [title]);

  const vertical = orientation === 'vertical';

  const borderStyle: CSSProperties = {
    '--border-thickness': `${lineThickness ?? 2}px`,
    '--border-style': lineType,
    '--border-color': lineColor || styles.primaryColor,
    "textAlign": labelAlign,
    "marginBottom": marginBottom || '8px',
  } as CSSProperties;

  const baseStyle: CSSProperties = {
    borderBottom: inline ? `${lineThickness || 2}px ${lineType} ${lineColor || styles.primaryColor}` : 'none',
  };

  const getLineStyles = (isLeft: boolean): CSSProperties => {
    if ((isLeft && labelAlign === 'left') || (!isLeft && labelAlign === 'right')) {
      return { width: `calc(${titleMargin || 0}% - ${titleWidth / 2}px)` };
    }

    return { flex: 1 };
  };

  const renderTitle = (): ReactNode => {
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
      <div className={styles.titleContainer} style={{ alignItems: 'center', display: 'flex', width: '100%' }}>
        <div style={{ ...getLineStyles(true), ...baseStyle }}></div>
        <div ref={titleRef} style={{ ...titleStyle, ...titleMarginStyle, whiteSpace: 'nowrap' }}>
          {title}
          <Show when={Boolean(tooltip?.trim())}>
            <Tooltip title={tooltip}>
              <QuestionCircleOutlined className={styles.helpIcon} />
            </Tooltip>
          </Show>
        </div>
        <div style={{ ...getLineStyles(false), ...baseStyle }}> </div>
      </div>
    );
  };

  return vertical ? (
    <div
      className={styles.vertical}
      style={{ ...borderStyle, ...containerStyle, width: 'max-content', height: addPx(lineHeight || '0.9em', allData) }}
    >
    </div>
  ) : (
    <div
      style={{
        ...containerStyle,
        height: 'max-content',
        width: addPx(lineWidth, allData) ?? '100%',
      }}
    >
      <div className={!inline || !title ? styles.shaSectionSeparator : ''} style={borderStyle}>
        {renderTitle()}
      </div>
    </div>
  );
};

export default SectionSeparator;
