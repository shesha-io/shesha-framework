import React, { FC } from 'react';
import { Modal } from 'antd';
import { useAppConfigurator } from '@/providers';

export const SwitchToLiveModeConfirmation: FC = () => {
  const {
    closeEditModeConfirmationVisible,
    switchApplicationMode,
    toggleCloseEditModeConfirmation,
  } = useAppConfigurator();
  return (
    <Modal
      title="Launch Live Mode"
      open={closeEditModeConfirmationVisible}
      onOk={() => switchApplicationMode('live')}
      onCancel={() => toggleCloseEditModeConfirmation(false)}
    >
      <p>Would you like to leave &apos;Edit Mode&apos; and launch &apos;Live Mode&apos;?</p>
    </Modal>
  );
};

export default SwitchToLiveModeConfirmation;
