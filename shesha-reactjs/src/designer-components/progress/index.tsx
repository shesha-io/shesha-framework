import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import React from 'react';
import { getSettings } from './settings';
import { IConfigurableFormComponent, IFormComponentStyles, IInputStyles } from '@/providers/form/models';
import { IToolboxComponent } from '@/interfaces';
import { LineOutlined } from '@ant-design/icons';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { Progress, ProgressProps } from 'antd';
import { GapPlacement, GapPosition, ProgressType, SuccessProps } from 'antd/lib/progress/progress';
import { getStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';
import { isNullOrWhiteSpace } from '@/utils/nullables';

interface IProgressProps
  extends Omit<ProgressProps, 'style' | 'type' | 'size' | 'format' | 'success' | 'strokeColor'>,
  IConfigurableFormComponent {
  format?: string | undefined;
  progressType?: ProgressType | undefined;
  success?: string | undefined;
  strokeColor?: string | undefined;
  lineStrokeColor?: string | undefined;
  circleStrokeColor?: string | undefined;
  stylingBox?: string | undefined;
  allStyles?: IFormComponentStyles | undefined;
}

const gapPositionToPlacement = (value: GapPosition | undefined): GapPlacement | undefined => {
  switch (value) {
    case 'top':
      return 'top';
    case 'bottom':
      return 'bottom';
    case 'left':
      return 'start';
    case 'right':
      return 'end';
    default:
      return undefined;
  }
};

const ProgressComponent: IToolboxComponent<IProgressProps> = {
  type: 'progress',
  name: 'Progress',
  icon: <LineOutlined />,
  isInput: true,
  isOutput: true,
  initModel: (model) => {
    return {
      ...model,
      hideLabel: true,
    };
  },
  Factory: ({ model }) => {
    const {
      progressType,
      lineStrokeColor,
      circleStrokeColor,
      format,
      percent,
      status,
      showInfo,
      strokeColor,
      strokeLinecap,
      success,
      trailColor,
      steps,
      gapPosition,
      strokeWidth,
      width,
      hidden,
      gapDegree,
      style,
      allStyles,
    } = model;

    if (hidden) return null;

    const styles = getStyle(style);
    const finalStyle = allStyles?.fullStyle || styles;


    const getEvaluatedSuccessColor = (): SuccessProps => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      return !isNullOrWhiteSpace(success) ? new Function(success)() : {};
    };

    const getEvaluatedStrokeValue = (): string | undefined => {
      switch (progressType) {
        case 'line':
          return lineStrokeColor ?? strokeColor;
        case 'circle':
          return circleStrokeColor ?? strokeColor;
        default:
          return strokeColor;
      }
    };

    const getEvaluatedFormat = (incomingPercent?: number, incomingSuccessPercent?: number): React.ReactNode => {
      return !isNullOrWhiteSpace(format)
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        ? new Function('percent, successPercent', format)(incomingPercent, incomingSuccessPercent)
        : undefined;
    };

    const finalStrokeColor = getEvaluatedStrokeValue();
    const gapPlacement = gapPositionToPlacement(gapPosition);

    return (
      <ConfigurableFormItem<number> model={model}>
        {(value) => {
          const finalPercent = percent ?? value;
          return (
            <Progress
              {...(progressType && { type: progressType })}
              {...(finalStrokeColor && { strokeColor: finalStrokeColor })}
              format={getEvaluatedFormat}
              {...(finalPercent ? { percent: finalPercent } : {})}
              size={width}
              {...(strokeWidth && { strokeWidth })}
              {...(gapPlacement && { gapPlacement })}
              {...(steps && { steps })}
              {...(trailColor && { railColor: trailColor })}
              {...(status && { status })}
              {...(showInfo && { showInfo })}
              {...(strokeLinecap && { strokeLinecap })}
              success={getEvaluatedSuccessColor()}
              {...(gapDegree && { gapDegree })}
              style={finalStyle}
            />
          );
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  migrator: (m) => m
    .add<IProgressProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IProgressProps>(1, (prev) => ({ ...migrateFormApi.properties(prev) }))
    .add<IProgressProps>(2, (prev) => {
      const styles: IInputStyles = {
        stylingBox: prev.stylingBox,
        style: prev.style,
      };
      return { ...prev, desktop: { ...styles }, tablet: { ...styles }, mobile: { ...styles } };
    })
    .add<IProgressProps>(3, (prev) => ({ ...migratePrevStyles(prev, {}) })),
};

export default ProgressComponent;
