import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import React from 'react';
import { getSettings } from './settings';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { IToolboxComponent } from '@/interfaces';
import { LineOutlined } from '@ant-design/icons';
import { migrateCustomFunctions, migratePropertyName } from '@/designer-components/_common-migrations/migrateSettings';
import { ProgressProps } from 'antd';
import { ProgressType } from 'antd/lib/progress/progress';
import { ProgressWrapper } from './progressWrapper';
import { getStyle, validateConfigurableComponentSettings } from '@/providers/form/utils';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';

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
      style
    } = model;

    if (hidden) return null;

      const styles = getStyle(style);
    

    const getEvaluatedSuccessColor = () => {
      // tslint:disable-next-line:function-constructor
      return new Function(success)();
    };

    const getEvaluatedStrokeValue = () => {
      let color: string = strokeColor;
      let isLineOrCircle = false;

      if (progressType === 'line') {
        color = lineStrokeColor?.toString();
        isLineOrCircle = true;
      }

      if (progressType === 'circle') {
        color = circleStrokeColor?.toString();
        isLineOrCircle = true;
      }

      if (isLineOrCircle) {
        // tslint:disable-next-line:function-constructor
        return color;
      } else {
        return color;
      }
    };

    const getEvaluatedFormat = (incomingPercent?: number, incomingSuccessPercent?: number) => {
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
              style={styles}
            />);
        }}
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: data => getSettings(data),
  validateSettings: model => validateConfigurableComponentSettings(getSettings, model),
  migrator: (m) => m
    .add<IProgressProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
    .add<IProgressProps>(1, (prev) => ({...migrateFormApi.properties(prev)}))
  ,
};

export default ProgressComponent;
