import React, { FC, PropsWithChildren, useRef } from 'react';
import FormComponentMemo from '@/components/formDesigner/formComponent';
import { ISettingContainerProps } from './settingComponentContainer';


export const SettingsContainerLive: FC<PropsWithChildren<ISettingContainerProps>> = ({ component }) => {
  
  const componentRef = useRef(null);

  return <FormComponentMemo componentModel={component} componentRef={componentRef} />;
};