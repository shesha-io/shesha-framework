import { CSSProperties, FC, ReactNode } from 'react';
import { useStyles } from './styles/styles';
import Show from '../show';
import { Tooltip } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import { ISectionSeparatorComponentProps } from '@/designer-components/sectionSeprator/interfaces';
import { isDefined } from '@/utils';

export interface ISectionSeparatorProps extends Omit<ISectionSeparatorComponentProps, 'containerStyle' | 'titleStyle' | 'labelAlign' | 'type' | 'id'> {
  title?: string | ReactNode;
  containerStyle?: CSSProperties | undefined;
  titleStyle?: CSSProperties | undefined;
  tooltip?: string | undefined;
  inline?: boolean | undefined;
  lineColor?: string | undefined;
  lineThickness?: number | undefined;
  titleMargin?: number | undefined;
  marginBottom?: string | number | undefined;
  labelAlign?: 'left' | 'center' | 'right' | undefined;
  orientation?: 'horizontal' | 'vertical' | undefined;
  fontSize?: string | number | undefined;
  lineType?: string | undefined;
  additionalDomProperties?: Record<string, unknown> | undefined;
}

export const SectionSeparator: FC<ISectionSeparatorProps> = (props) => {
  const {
    orientation,
    containerStyle,
    titleStyle,
    tooltip,
    title,
    labelAlign,
    additionalDomProperties,
  } = props;

  const { styles } = useStyles(props);

  return orientation === 'vertical'
    ? (
      <div className={styles.shaSectionSeparatorWrapperVertical} style={containerStyle} {...additionalDomProperties}>
        <div className={styles.vertical} />
      </div>
    )
    : (
      <div className={styles.shaSectionSeparatorWrapperHorisontal} style={containerStyle} {...additionalDomProperties}>
        <div className={styles.shaSectionSeparator}>
          <Show when={isDefined(title) && title !== ''}>
            <div className={styles.titleContainer}>
              {labelAlign !== 'left' && <div className={styles.shaSectionSeparatorLineLeft} />}
              <div className={styles.shaSectionSeparatorTitle} style={titleStyle}>
                {title}
                <Show when={Boolean(tooltip?.trim())}><Tooltip title={tooltip}><QuestionCircleOutlined className={styles.helpIcon} /></Tooltip></Show>
              </div>
              {labelAlign !== 'right' && <div className={styles.shaSectionSeparatorLineRight} />}
            </div>
          </Show>
        </div>
      </div>
    );
};

export default SectionSeparator;
