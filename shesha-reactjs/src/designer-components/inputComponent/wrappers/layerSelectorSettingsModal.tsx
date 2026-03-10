import LayerSelectorSettingsModal from '@/components/layerEditor/modal';
import { ILayerSelectorSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { FC } from 'react';

export const LayerSelectorSettingsModalWrapper: FC<ILayerSelectorSettingsInputProps> = (props) => {
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
