import { ISettingsFormFactoryArgs } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { ReactNode } from 'react';

export type IDynamicActionsConfiguratorComponentProps = IConfigurableFormComponent;

export type IProviderSettingsFormFactory<TModel extends object = object> = (
  props: ISettingsFormFactoryArgs<TModel>,
) => ReactNode;
