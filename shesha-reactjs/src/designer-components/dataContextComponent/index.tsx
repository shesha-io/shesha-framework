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
import { executeScript, useAvailableConstantsData } from '@/providers/form/utils';
import { migrateFormApi } from '../_common-migrations/migrateFormApi1';

export interface IDataContextComponentProps extends IConfigurableFormComponent {
  items: IPropertyMetadata[];
  initialDataCode: string;
  onChangeAction?: IConfigurableActionConfiguration;
}

const DataContextComponent: IToolboxComponent<IDataContextComponentProps> = {
  type: 'dataContext',
  isInput: false,
  name: 'DataContext ',
  icon: <CodeOutlined />,
  dataTypeSupported: () => false,
  Factory: ({ model }) => {
    const allData = useAvailableConstantsData({ topContextId: model.id });

    const metadata: Promise<IModelMetadata> = useMemo(() => {
      return Promise.resolve({ ...DEFAULT_CONTEXT_METADATA, name: model.componentName, properties: model.items ?? [] } as IModelMetadata);
    }, [model.id, model.componentName, model.items]);

    const initialData: Promise<any> = useMemo(() => {
      return allData.form?.formMode === 'designer' ? null : executeScript(model.initialDataCode, allData);
    }, [model.initialDataCode]);

    return (
      <DataContextProvider
        {...model}
        name={model.componentName}
        metadata={metadata}
        initialData={allData.form?.formMode === 'designer' ? null : initialData}
        type="control"
      >
        <ComponentsContainer containerId={model.id} />
      </DataContextProvider>
    );
  },
  settingsFormFactory: (props) => {
    return <DataContextSettingsForm {...props} />;
  },
  linkToModelMetadata: (model): IDataContextComponentProps => ({ ...model }),
  migrator: (m) => m
    .add<IDataContextComponentProps>(0, (prev) => ({ ...prev, description: prev.description ?? prev.componentName, items: [], initialDataCode: null }))
    .add<IDataContextComponentProps>(1, (prev) => ({ ...prev, onChangeAction: migrateNavigateAction(prev.onChangeAction) }))
    .add<IDataContextComponentProps>(2, (prev) => ({
      ...migrateFormApi.properties(prev),
      initialDataCode: migrateFormApi.withoutFormData(prev?.initialDataCode),
    })),
};

export default DataContextComponent;
