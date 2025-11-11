import RefListItemSelectorSettingsModal from '@/components/refListSelectorDisplay/options/modal';
import { IRefListItemSelectorSettingsModalProps } from '@/designer-components/settingsInput/interfaces';
import React, { FC } from 'react';

export const RefListItemSelectorSettingsModalWrapper: FC<IRefListItemSelectorSettingsModalProps> = (props) => {
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
