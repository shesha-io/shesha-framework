import { IToolboxComponent } from '../../interfaces';
import { CodeOutlined } from '@ant-design/icons';
import React, { useMemo } from 'react';
import { IConfigurableFormComponent } from '../../providers';
import { DataContextProvider } from 'providers/dataContextProvider';
import { IModelMetadata, IPropertyMetadata } from 'interfaces/metadata';
import { DataTypes } from 'interfaces/dataTypes';
import { DataContextSettingsForm } from './settings';
import { ComponentsContainer } from 'components';

export interface IDataContextComponentProps extends IConfigurableFormComponent {
  items: IPropertyMetadata[];
  initialDataCode: string;
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
        return Promise.resolve({
          name: model.componentName,
          dataType: DataTypes.context,
          apiEndpoints: {},
          specifications: {},
          properties: model.items ?? []
        } as IModelMetadata);
      }, [model.id, model.componentName, model.items]);

      return (
        <DataContextProvider {...model} name={model.componentName} metadata={metadata}>
            <ComponentsContainer containerId={model.id} />
        </DataContextProvider>
      );
    },
    settingsFormFactory: (props) => {
      return <DataContextSettingsForm {...props}/>;
    },
    initModel: model => ({...model, description: model.componentName}),
    linkToModelMetadata: (model): IDataContextComponentProps => ({...model})
    ,
  };
  
  export default DataContextComponent;