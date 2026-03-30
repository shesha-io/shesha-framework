import { Modal } from 'antd';
import React, { FC, useState } from 'react';
import { FilterItemSettingsEditor } from './filterItemSettingsEditor';
import { IStoredFilter } from '@/interfaces';

export interface IFilterItemSettingsModalProps {
  value?: IStoredFilter;
  onSave: (newValue: IStoredFilter) => void;
  onCancel: () => void;
  readOnly: boolean;
}

export const FilterItemSettingsModal: FC<IFilterItemSettingsModalProps> = ({ value, onSave, onCancel, readOnly }) => {
  const [localValue, setLocalValue] = useState({ ...value });

  const onOk = (): void => {
    onSave(localValue);
  };

  return (
    <Modal
      width="75%"
      open={true}
      title={readOnly ? 'View Filter' : 'Configure Filter'}
      onCancel={onCancel}
      cancelText={readOnly ? 'Close' : undefined}
      okText="Save"
      onOk={onOk}
      okButtonProps={{ hidden: readOnly }}
    >
      <FilterItemSettingsEditor value={localValue} onChange={setLocalValue} readOnly={readOnly} />
    </Modal>
  );
};
