import React, { FC, PropsWithChildren } from 'react';
import FormComponentMemo from '@/components/formDesigner/formComponent';
import { ISettingContainerProps } from './settingComponentContainer';

export const SettingsContainerLive: FC<PropsWithChildren<ISettingContainerProps>> = ({ component }) => {
  return <FormComponentMemo componentModel={component} />;
};
