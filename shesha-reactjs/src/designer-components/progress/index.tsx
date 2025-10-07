import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import React from 'react';
import { getSettings } from './settings';
import { IConfigurableFormComponent, IFormComponentStyles, IInputStyles } from '@/providers/form/models';
import { IToolboxComponent } from '@/interfaces';
import { LineOutlined } from '@ant-design/icons';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { ProgressProps } from 'antd';
import { ProgressType, SuccessProps } from 'antd/lib/progress/progress';
import { ProgressWrapper } from './progressWrapper';
import { getStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';
import { migratePrevStyles } from '../_common-migrations/migrateStyles';

interface IProgressProps
  extends Omit<ProgressProps, 'style' | 'type' | 'size' | 'format' | 'success' | 'strokeColor'>,
  IConfigurableFormComponent {
  format?: string;
  progressType?: ProgressType;
  success?: string;
  strokeColor?: string;
  lineStrokeColor?: string;
  circleStrokeColor?: string;
  defaultValue?: number;
  stylingBox?: string;
  allStyles?: IFormComponentStyles;
}

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
      defaultValue,
      hidden,
      gapDegree,
      style,
      allStyles,
    } = model;

    if (hidden) return null;

    const styles = getStyle(style);
    const finalStyle = allStyles?.fullStyle || styles;


    const getEvaluatedSuccessColor = (): SuccessProps => {
      // tslint:disable-next-line:function-constructor
      return new Function(success)();
    };

    const getEvaluatedStrokeValue = (): string => {
      let color: string = strokeColor;
      let isLineOrCircle = false;

      if (progressType === 'line') {
        color = lineStrokeColor?.toString() ?? strokeColor?.toString();
        isLineOrCircle = true;
      }

      if (progressType === 'circle') {
        color = circleStrokeColor?.toString() ?? strokeColor?.toString();
        isLineOrCircle = true;
      }

      if (isLineOrCircle) {
        // tslint:disable-next-line:function-constructor
        return color;
      } else {
        return color;
      }
    };

    const getEvaluatedFormat = (incomingPercent?: number, incomingSuccessPercent?: number): React.ReactNode => {
      // tslint:disable-next-line:function-constructor
      return new Function('percent, successPercent', format)(incomingPercent, incomingSuccessPercent);
    };

    return (
      <ConfigurableFormItem model={model}>
        {(value) => {
          return (
            <ProgressWrapper
              type={progressType}
              strokeColor={getEvaluatedStrokeValue()}
              format={getEvaluatedFormat}
              percent={percent || value}
              width={width}
              strokeWidth={strokeWidth}
              gapPosition={gapPosition}
              steps={steps}
              trailColor={trailColor}
              status={status}
              showInfo={showInfo}
              strokeLinecap={strokeLinecap}
              success={getEvaluatedSuccessColor()}
              defaultValue={defaultValue}
              gapDegree={gapDegree}
              style={finalStyle}
            />
          );
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
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
