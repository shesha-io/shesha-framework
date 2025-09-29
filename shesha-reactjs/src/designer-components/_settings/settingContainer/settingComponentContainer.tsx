import React, { FC, PropsWithChildren, useMemo } from 'react';
import { useIsDrawingForm } from '@/providers/form';
import { IComponentsContainerProps } from '@/components/formDesigner/containers/componentsContainer';
import { IConfigurableFormComponent } from '@/index';
import { SettingsContainerLive } from './settingContainerLive';
import { SettingContainerDesigner } from './settingContainerDesigner';

export interface ISettingContainerProps extends PropsWithChildren<IComponentsContainerProps> {
  component: IConfigurableFormComponent | undefined;
  propertyName?: string;
}

export const SettingComponentContainerInner: FC<ISettingContainerProps> = (props) => {
  const isDrawing = useIsDrawingForm();

  const model = useMemo(() => {
    return { ...props.component, propertyName: props.propertyName };
  }, [props.component, props.propertyName]);

  return isDrawing
    ? <SettingContainerDesigner {...props} component={model} />
    : <SettingsContainerLive {...props} component={model} />
  ;
};

export const SettingComponentContainer = React.memo(SettingComponentContainerInner);
