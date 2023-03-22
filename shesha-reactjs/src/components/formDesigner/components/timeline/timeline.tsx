import { ClockCircleOutlined } from '@ant-design/icons';
import React from 'react';
import { IToolboxComponent } from '../../../../interfaces';

import ConfigurableFormItem from '../formItem';

import { DataTypes } from '../../../../interfaces/dataTypes';
import { useForm } from '../../../../providers';
import TimelineSettings from './settings';

import { evaluateValue } from '../../../../providers/form/utils';
import { ShaTimeline } from '../../../timeline/index';
import { ITimelineProps } from '../../../timeline/models';

const TimelineComponent: IToolboxComponent<ITimelineProps> = {
  type: 'timeline',
  name: 'Timeline',
  icon: <ClockCircleOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.boolean,

  factory: (model: ITimelineProps) => {
    const { formData } = useForm();
    const ownerId = evaluateValue(model.ownerId, { data: formData });

    return (
      <ConfigurableFormItem model={{ ...model }} valuePropName="checked" initialValue={model?.defaultValue}>
        <ShaTimeline {...model} ownerId={ownerId} />
      </ConfigurableFormItem>
    );
  },

  settingsFormFactory: ({ readOnly, model, onSave, onCancel, onValuesChange }) => {
    return (
      <TimelineSettings
        readOnly={readOnly}
        model={model}
        onSave={onSave}
        onCancel={onCancel}
        onValuesChange={onValuesChange}
      />
    );
  },
};

export default TimelineComponent;
