import LayerSelectorSettingsModal from '@/components/layerEditor/modal';
import { ILayerSelectorSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';

export const LayerSelectorSettingsModalWrapper: FCUnwrapped<ILayerSelectorSettingsInputProps> = (props) => {
  const { value, readOnly, onChange, settings } = props;
  return (
    <LayerSelectorSettingsModal
      value={value}
      onChange={(e) => onChange(e)}
      readOnly={readOnly}
      settings={settings}
    />
  );
};
