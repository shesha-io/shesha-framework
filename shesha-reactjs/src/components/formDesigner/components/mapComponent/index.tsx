import React from 'react';
import { IToolboxComponent } from '../../../../interfaces';
import { CheckSquareOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '../formItem';

import { DataTypes } from '../../../../interfaces/dataTypes';
import { useForm } from '../../../../providers';
import { MapSettings } from './settings';
import { ShaMap } from '../../../mapComponent';
import { IMapProps } from './models';
import { getStyle } from '../../../../providers/form/utils';
import Mustache from 'mustache';

const MapComponent: IToolboxComponent<IMapProps> = {
  type: 'map',
  name: 'Map',
  icon: <CheckSquareOutlined />,
  dataTypeSupported: ({ dataType }) => dataType === DataTypes.boolean,
  factory: (model: IMapProps) => {
    const { formData } = useForm();

    const getMustacheExpression = (template) => {
      return template && typeof template === 'string' ? Mustache.render(template, formData ?? {}) : template;
    };

    const lat = getMustacheExpression(model?.latitude);
    const lng = getMustacheExpression(model?.longitude);

    return (
      <ConfigurableFormItem
        model={{ ...model, hideLabel: true }}
        valuePropName="checked"
        initialValue={model?.defaultValue}
      >
        <ShaMap style={getStyle(model?.style, formData)} {...model} center={{ lat, lng }} />
      </ConfigurableFormItem>
    );
  },
  settingsFormFactory: ({ readOnly, model, onSave, onCancel, onValuesChange }) => {
    return (
      <MapSettings
        readOnly={readOnly}
        model={model}
        onSave={onSave}
        onCancel={onCancel}
        onValuesChange={onValuesChange}
      />
    );
  },
};

export default MapComponent;
