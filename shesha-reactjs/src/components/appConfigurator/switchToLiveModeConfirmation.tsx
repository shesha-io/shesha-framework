import React, { FC } from 'react';
import { Modal } from 'antd';
import { useAppConfigurator } from '../../providers';

export interface IProps {}

export const SwitchToLiveModeConfirmation: FC<IProps> = () => {
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
      <p>Would you like to leave 'Edit Mode' and launch 'Live Mode'?</p>
    </Modal>
  );
};

export default SwitchToLiveModeConfirmation;
