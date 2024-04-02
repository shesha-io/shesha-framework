import { IToolboxComponent } from '@/interfaces';
import { CodeOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import React, { FC } from 'react';
import { IConfigurableFormComponent } from '@/providers';
import { DataTypes, StringFormats } from '@/interfaces/dataTypes';
import { Select } from 'antd';
import { useDataContextManager } from '@/providers/dataContextManager';

interface IDataContextSelectorComponentProps extends IConfigurableFormComponent {}

const DataContextSelector: FC<any> = (model) => {
  const { getActiveContext, getDataContexts } = useDataContextManager();
  
  const dataContext = getActiveContext();
  const dataContexts = getDataContexts(dataContext?.id);
  
  const onChange = (value: any) => {
    model.onChange(value);
  };

  return (
    <Select allowClear={true} disabled={model.readOnly} showSearch value={model.value} onChange={onChange}>
      {dataContexts.map((item) => {
        return <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>;
      })}
    </Select>
  );
};

const DataContextSelectorComponent: IToolboxComponent<IDataContextSelectorComponentProps> = {
    type: 'dataContextSelector',
    isInput: true,
    isOutput: true,
    name: 'DataContext selector',
    icon: <CodeOutlined />,
    dataTypeSupported: ({ dataType, dataFormat }) => dataType === DataTypes.string && dataFormat === StringFormats.singleline,
    Factory: ({ model }) => {
      return (
        <ConfigurableFormItem model={{...model}}>
          {(value, onChange) => {
            return <DataContextSelector {...model} value={value} onChange={onChange}/>;
          }}
        </ConfigurableFormItem>
      );
    },
    initModel: (model) => ({
      ...model,
    }),
    linkToModelMetadata: (model): IDataContextSelectorComponentProps => {
      return {
        ...model,
      };
    },
  };
  
  export { DataContextSelector } ;

  export default DataContextSelectorComponent;