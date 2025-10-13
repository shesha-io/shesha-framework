import React, { FC } from 'react';
import { Modal } from 'antd';
import { useAppConfigurator } from '@/providers';

export const SwitchToEditModeConfirmation: FC = () => {
  const { editModeConfirmationVisible, switchApplicationMode, toggleEditModeConfirmation } = useAppConfigurator();

  return (
    <Modal
      title="Launch Edit Mode"
      open={editModeConfirmationVisible}
      onCancel={() => toggleEditModeConfirmation(false)}
      onOk={() => switchApplicationMode('edit')}
    >
      <p>Would you like to leave &apos;Live Mode&apos; and launch &apos;Edit Mode&apos;?</p>
    </Modal>
  );
};

export default SwitchToEditModeConfirmation;
