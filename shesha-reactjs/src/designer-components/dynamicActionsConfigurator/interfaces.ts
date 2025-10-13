import { IObjectMetadata } from '@/interfaces';
import { IConfigurableFormComponent } from '@/providers/form/models';
import { ReactNode } from 'react';

export type IDynamicActionsConfiguratorComponentProps = IConfigurableFormComponent;

export interface ISettingsFormFactoryArgs<TModel extends object = object> {
  model: TModel;
  onSave: (values: TModel) => void;
  onCancel: () => void;
  onValuesChange?: (changedValues: any, values: TModel) => void;
  readOnly?: boolean;
  availableConstants?: IObjectMetadata;
}

export type IProviderSettingsFormFactory<TModel extends object = object> = (
  props: ISettingsFormFactoryArgs<TModel>
) => ReactNode;
