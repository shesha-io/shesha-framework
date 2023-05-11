import { IToolboxComponent } from 'interfaces';
import { IMapProps } from './interfaces';
import { MehOutlined } from '@ant-design/icons';
import React from 'react';
import { useForm, useFormData, useGlobalState } from 'providers';
import MapSettings from './settings';
import { evaluateString, evaluateValue } from 'formDesignerUtils';
import { Map } from './control';
import { evaluateFilters } from './utils';

const MapComponent: IToolboxComponent<IMapProps> = {
  type: 'map',
  name: 'map',
  icon: <MehOutlined />,
  factory: (model: IMapProps) => {
    const { isComponentHidden } = useForm();
    const { data: formData } = useFormData();
    const { globalState } = useGlobalState();

    const ownerId = evaluateValue(model?.ownerId, { data: formData });

    const evaluatedDefaultLat = evaluateString(model?.defaultViewPortLat as string, { data: formData, globalState });

    const evaluatedDefaultLng = evaluateString(model?.defaultViewPortLng as string, { data: formData, globalState });

    const evaluatedLat = evaluateString(model?.latitude as string, { data: formData, globalState });

    const evaluatedLng = evaluateString(model?.longitude as string, { data: formData, globalState });

    console.log('LOG:: MODEL', model);

    const evaluatedFilters = evaluateFilters(model, formData, globalState);

    if (isComponentHidden(model)) return null;

    return (
      <Map
        {...model}
        defaultViewPortLat={evaluatedDefaultLat}
        defaultViewPortLng={evaluatedDefaultLng}
        longitude={evaluatedLng}
        latitude={evaluatedLat}
        ownerId={ownerId}
        filters={evaluatedFilters}
        entityType={model?.entityType}
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
