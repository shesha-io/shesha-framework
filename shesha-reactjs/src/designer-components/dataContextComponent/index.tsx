import { IToolboxComponent } from '../../interfaces';
import { CodeOutlined } from '@ant-design/icons';
import React from 'react';
import { IConfigurableFormComponent } from '../../providers';
import { DataContextProvider } from 'providers/dataContextProvider';
import ComponentsContainer from 'components/formDesigner/componentsContainer';

interface IDataContextComponentProps extends IConfigurableFormComponent {}

const DataContextComponent: IToolboxComponent<IDataContextComponentProps> = {
    type: 'dataContext',
    isInput: true,
    isOutput: true,
    name: 'DataContext ',
    icon: <CodeOutlined />,
    dataTypeSupported: () => false,
    factory: (model: IDataContextComponentProps, _c) => {
      return (
        <DataContextProvider {...model}>
            <ComponentsContainer
                containerId={model.id}
            />
        </DataContextProvider>
      );
    },
    initModel: (model) => ({
      ...model,
    }),
    linkToModelMetadata: (model): IDataContextComponentProps => {
      return {
        ...model,
      };
    },
  };
  
  export default DataContextComponent;