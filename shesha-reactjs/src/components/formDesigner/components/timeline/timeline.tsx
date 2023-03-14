import React from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { IConfigurableFormComponent } from '../../../../providers/form/models';
import { ClockCircleOutlined } from '@ant-design/icons';

import ConfigurableFormItem from '../formItem';

import { DataTypes } from '../../../../interfaces/dataTypes';
import { FormIdentifier, useForm } from '../../../../providers';
import ReadOnlyDisplayFormItem from '../../../readOnlyDisplayFormItem';
import { ICommonContainerProps } from '../../componentsContainer';
import TimelineSettings from './settings';

import { ShaTimeline } from '../../../timeline/index';
import { evaluateValue } from '../../../../providers/form/utils';

export interface ITimelineProps extends IConfigurableFormComponent, ICommonContainerProps {
  useExpression: string | boolean;
  entityType: string;
  permissions?: any;
  buttonsLayout?: any;
  properties?: string[];
  formId?: FormIdentifier;
  ownerId: string;
  queryParamsExpression?: string;
  readOnly?: boolean;
  labelPlacement?: any;
  activeItem: any;
  dataSource?: 'form' | 'api';
  customApiUrl?: string;
  apiSource?: 'entity' | 'custom';
  timelineType?: 'default' | 'vertical' | 'horizontal';
}

const TimelineComponent: IToolboxComponent<ITimelineProps> = {
  type: 'timeline',
  name: 'Timeline',
  icon: <ClockCircleOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.boolean,

  factory: (model: ITimelineProps) => {
    const { formMode, isComponentDisabled, formData } = useForm();
    const isReadOnly = model?.readOnly || formMode === 'readonly';

    const disabled = isComponentDisabled(model);

    const ownerId = evaluateValue(model.ownerId, { data: formData });

    return (
      <ConfigurableFormItem model={{ ...model }} valuePropName="checked" initialValue={model?.defaultValue}>
        {isReadOnly ? (
          <ReadOnlyDisplayFormItem type="checkbox" disabled={disabled} />
        ) : (
          <ShaTimeline {...model} ownerId={ownerId} />
        )}
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
