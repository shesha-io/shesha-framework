import { ClockCircleOutlined } from '@ant-design/icons';
import React from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { DataTypes } from '../../../../interfaces/dataTypes';
import { useForm } from '../../../../providers';
import { TimelineSettingsForm } from './settings';
import { evaluateValue } from '../../../../providers/form/utils';
import { ShaTimeline } from '../../../timeline/index';
import { ITimelineProps } from '../../../timeline/models';
import { migrateDynamicExpression } from 'designer-components/_common-migrations/migrateUseExpression';
import { migrateCustomFunctions, migratePropertyName } from 'designer-components/_common-migrations/migrateSettings';

const TimelineComponent: IToolboxComponent<ITimelineProps> = {
  type: 'timeline',
  name: 'Timeline',
  icon: <ClockCircleOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.boolean,

  factory: (model: ITimelineProps) => {
    const { formData } = useForm();
    const ownerId = evaluateValue(model.ownerId, { data: formData });

    return <ShaTimeline {...model} ownerId={ownerId} />;
  },

  settingsFormFactory: (props) => <TimelineSettingsForm {...props} />,
  migrator: (m) => m
    .add<ITimelineProps>(0, (prev) => {
      const result: ITimelineProps = {
        ...prev,
        entityType: prev['entityType'],
      };
      const useExpression = Boolean(result['useExpression']);
      delete result['useExpression'];

      if (useExpression) {
        const migratedExpression = migrateDynamicExpression(prev['filters'] ?? {});
        result.filters = migratedExpression;
      }

      return result;
    })
    .add<ITimelineProps>(1, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
  ,
};

export default TimelineComponent;
