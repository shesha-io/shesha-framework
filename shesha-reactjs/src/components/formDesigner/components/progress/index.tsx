import React, { FC } from 'react';
import { IToolboxComponent, IValuable } from '../../../../interfaces';
import { IConfigurableFormComponent } from '../../../../providers/form/models';
import { LineOutlined } from '@ant-design/icons';
import { Progress, ProgressProps } from 'antd';
import { validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { useForm } from '../../../../providers';
import { alertSettingsForm } from './settings';
import { ProgressType } from 'antd/lib/progress/progress';
import ConfigurableFormItem from '../formItem';

interface IProgressProps
  extends Omit<ProgressProps, 'style' | 'type' | 'size' | 'format' | 'success' | 'strokeColor'>,
    IConfigurableFormComponent {
  format?: string;
  progressType?: ProgressType;
  success?: string;
  strokeColor?: string;
  lineStrokeColor?: string;
  circleStrokeColor?: string;
}

const ProgressComponent: IToolboxComponent<IProgressProps> = {
  type: 'progress',
  name: 'Progress',
  icon: <LineOutlined />,
  factory: (model: IProgressProps) => {
    const { isComponentHidden } = useForm();
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
    } = model;

    const isHidden = isComponentHidden(model);

    if (isHidden) return null;

    const getEvaluatedSuccessColor = () => {
      // tslint:disable-next-line:function-constructor
      return new Function(success)();
    };

    const getEvaluatedStrokeValue = () => {
      let color = strokeColor;
      let isLineOrCircle = false;

      if (progressType === 'line') {
        color = lineStrokeColor;
        isLineOrCircle = true;
      }

      if (progressType === 'circle') {
        color = circleStrokeColor;
        isLineOrCircle = true;
      }

      if (isLineOrCircle) {
        // tslint:disable-next-line:function-constructor
        return new Function(color)();
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
        <ProgressWrapper
          type={progressType}
          strokeColor={getEvaluatedStrokeValue()}
          format={getEvaluatedFormat}
          percent={percent}
          width={width}
          strokeWidth={strokeWidth}
          gapPosition={gapPosition}
          steps={steps}
          trailColor={trailColor}
          status={status}
          showInfo={showInfo}
          strokeLinecap={strokeLinecap}
          success={getEvaluatedSuccessColor()}
        />
      </ConfigurableFormItem>
    );
  },
  settingsFormMarkup: alertSettingsForm,
  validateSettings: model => validateConfigurableComponentSettings(alertSettingsForm, model),
};

const ProgressWrapper: FC<IValuable & ProgressProps> = ({ percent, value, ...props }) => {
  return <Progress {...props} percent={percent || value} />;
};

export default ProgressComponent;
