import React, { useMemo } from 'react';
import { CodeOutlined } from '@ant-design/icons';
import { ComponentsContainer } from '@/components';
import { DataContextProvider } from '@/providers/dataContextProvider';
import { DataContextSettingsForm } from './settings';
import { IConfigurableActionConfiguration, IConfigurableFormComponent } from '@/providers';
import { IModelMetadata, IPropertyMetadata } from '@/interfaces/metadata';
import { IToolboxComponent } from '@/interfaces';
import { migrateNavigateAction } from '../_common-migrations/migrate-navigate-action';
import { DEFAULT_CONTEXT_METADATA } from '@/providers/dataContextManager/models';

export interface IDataContextComponentProps extends IConfigurableFormComponent {
  items: IPropertyMetadata[];
  initialDataCode: string;
  onChangeAction?: IConfigurableActionConfiguration;
}

const DataContextComponent: IToolboxComponent<IDataContextComponentProps> = {
    type: 'dataContext',
    isInput: true,
    isOutput: true,
    name: 'DataContext ',
    icon: <CodeOutlined />,
    dataTypeSupported: () => false,
    Factory: ({ model }) => {

      const metadata: Promise<IModelMetadata> = useMemo(() => {
        return Promise.resolve({ ...DEFAULT_CONTEXT_METADATA, name: model.componentName, properties: model.items ?? []} as IModelMetadata);
      }, [model.id, model.componentName, model.items]);

      return (
        <DataContextProvider {...model} name={model.componentName} metadata={metadata} type='control'>
            <ComponentsContainer containerId={model.id} />
        </DataContextProvider>
      );
    },
    settingsFormFactory: (props) => {
      return <DataContextSettingsForm {...props}/>;
    },
    linkToModelMetadata: (model): IDataContextComponentProps => ({...model}),
    migrator: (m) => m
      .add<IDataContextComponentProps>(0, prev => ({ ...prev, description: prev.description ?? prev.componentName, items: [], initialDataCode: null }))
      .add<IDataContextComponentProps>(1, prev => ({ ...prev, onChangeAction: migrateNavigateAction(prev.onChangeAction) })),
  };
  
  export default DataContextComponent;