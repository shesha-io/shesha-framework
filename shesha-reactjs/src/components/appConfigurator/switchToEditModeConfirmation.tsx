import React, { FC } from 'react';
import { Modal } from 'antd';
import { useAppConfigurator } from '@/providers';

export interface IProps {}

export const SwitchToEditModeConfirmation: FC<IProps> = () => {
  const { editModeConfirmationVisible, switchApplicationMode, toggleEditModeConfirmation } = useAppConfigurator();
  
  return (
    <Modal
      title="Launch Edit Mode"
      open={editModeConfirmationVisible}
      onCancel={() => toggleEditModeConfirmation(false)}
      onOk={() => switchApplicationMode('edit')}
    >
      <p>Would you like to leave 'Live Mode' and launch 'Edit Mode'?</p>
    </Modal>
  );
};

export default SwitchToEditModeConfirmation;
