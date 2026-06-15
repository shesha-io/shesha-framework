import RefListItemSelectorSettingsModal from '@/components/refListSelectorDisplay/options/modal';
import { IRefListItemSelectorSettingsModalProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';

export const RefListItemSelectorSettingsModalWrapper: FCUnwrapped<IRefListItemSelectorSettingsModalProps> = (props) => {
  const { referenceList, value, onChange } = props;
  return (
    <RefListItemSelectorSettingsModal
      {...props}
      value={value}
      onChange={(e) => onChange?.(e)}
      referenceList={referenceList}
      readOnly={false}
    />
  );
};
