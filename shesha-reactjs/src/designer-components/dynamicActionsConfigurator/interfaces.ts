import { IObjectMetadata } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { ReactNode } from 'react';

export interface IDynamicActionsConfiguratorComponentProps extends IConfigurableFormComponent {

}

export interface IProviderSettings {
}

export interface ISettingsFormFactoryArgs<TModel = IProviderSettings> {
  model: TModel;
  onSave: (values: TModel) => void;
  onCancel: () => void;
  onValuesChange?: (changedValues: any, values: TModel) => void;
  readOnly?: boolean;
  availableConstants?: IObjectMetadata;
}

export type IProviderSettingsFormFactory<TModel = IProviderSettings> = (
  props: ISettingsFormFactoryArgs<TModel>
) => ReactNode;
