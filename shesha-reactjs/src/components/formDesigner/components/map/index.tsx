import { MehOutlined } from '@ant-design/icons';
import { evaluateString } from 'formDesignerUtils';
import { IToolboxComponent } from 'interfaces';
import { useForm, useFormData, useGlobalState } from 'providers';
import React from 'react';
import { Map } from './control';
import { IMapProps } from './interfaces';
import MapSettings from './settings';

const MapComponent: IToolboxComponent<IMapProps> = {
  type: 'map',
  name: 'map',
  icon: <MehOutlined />,
  factory: (model: IMapProps) => {
    const { isComponentHidden } = useForm();
    const { data: formData } = useFormData();
    const { globalState } = useGlobalState();

    const evaluatedDefaultLat = evaluateString(model?.defaultViewPortLat as string, { data: formData, globalState });

    const evaluatedDefaultLng = evaluateString(model?.defaultViewPortLng as string, { data: formData, globalState });

    const evaluatedLat = evaluateString(model?.latitude as string, { data: formData, globalState });

    const evaluatedLng = evaluateString(model?.longitude as string, { data: formData, globalState });

    if (isComponentHidden(model)) return null;

    return (
      <Map
        {...model}
        defaultViewPortLat={evaluatedDefaultLat}
        defaultViewPortLng={evaluatedDefaultLng}
        longitude={evaluatedLng}
        latitude={evaluatedLat}
      />
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
