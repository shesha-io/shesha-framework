import RefListItemSelectorSettingsModal from '@/components/refListSelectorDisplay/options/modal';
import { IRefListItemSelectorSettingsModalProps } from '@/designer-components/settingsInput/interfaces';
import React from 'react';
import { FCUnwrapped } from '@/providers/form/models';

export const RefListItemSelectorSettingsModalWrapper: FCUnwrapped<IRefListItemSelectorSettingsModalProps> = (props) => {
  const { referenceList, onChange } = props;
  return (
    <RefListItemSelectorSettingsModal
      {...props}
      onChange={(e) => onChange(e)}
      referenceList={referenceList}
      readOnly={false}
    />
  );
};
