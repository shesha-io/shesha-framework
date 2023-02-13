import { CheckCircleOutlined, EditOutlined } from '@ant-design/icons';
import React, { FC } from 'react';
import { useAppConfigurator } from '../../providers';
import SwitchToEditModeConfirmation from './switchToEditModeConfirmation';
import SwitchToLiveModeConfirmation from './switchToLiveModeConfirmation';

export interface IAppEditModeTogglerProps {}

export const AppEditModeToggler: FC<IAppEditModeTogglerProps> = () => {
  const { mode, toggleCloseEditModeConfirmation, toggleEditModeConfirmation } = useAppConfigurator();

  const content =
    mode === 'edit' ? (
      <>
        <CheckCircleOutlined title="Click to close Edit Mode" onClick={() => toggleCloseEditModeConfirmation(true)} />
        <SwitchToLiveModeConfirmation />
      </>
    ) : (
      <>
        <EditOutlined title="Click to launch Edit Mode" onClick={() => toggleEditModeConfirmation(true)} />
        <SwitchToEditModeConfirmation />
      </>
    );

  return <div className="action-icon hidden-sm-scr">{content}</div>;
};

export default AppEditModeToggler;
