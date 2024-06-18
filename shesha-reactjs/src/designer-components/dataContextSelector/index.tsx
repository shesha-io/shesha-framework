import { IToolboxComponent } from '@/interfaces';
import { CodeOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '@/components/formDesigner/components/formItem';
import React, { FC } from 'react';
import { IConfigurableFormComponent } from '@/providers';
import { DataTypes, StringFormats } from '@/interfaces/dataTypes';
import { Select } from 'antd';
import { useDataContextManager } from '@/providers/dataContextManager';
import { useDataContext } from '@/providers/dataContextProvider/contexts';

export interface IDataContextSelectorProps<TValue = any> {
  readOnly?: boolean;
  value?: TValue;
  onChange?: (value: TValue) => void;
}
const DataContextSelector: FC<IDataContextSelectorProps> = (props) => {
  const { getDataContexts } = useDataContextManager();

  const dataContext = useDataContext(false);
  const dataContexts = getDataContexts(dataContext?.id);

  const onChange = (value: any) => {
    props?.onChange(value);
  };

  return (
    <Select allowClear={true} disabled={props.readOnly} showSearch value={props.value} onChange={onChange}>
      {dataContexts.map((item) => {
        return <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>;
      })}
    </Select>
  );
};

interface IDataContextSelectorComponentProps extends IConfigurableFormComponent { }

const DataContextSelectorComponent: IToolboxComponent<IDataContextSelectorComponentProps> = {
  type: 'dataContextSelector',
  isInput: true,
  isOutput: true,
  name: 'DataContext selector',
  icon: <CodeOutlined />,
  dataTypeSupported: ({ dataType, dataFormat }) => dataType === DataTypes.string && dataFormat === StringFormats.singleline,
  Factory: ({ model }) => {
    return (
      <ConfigurableFormItem model={{ ...model }}>
        {(value, onChange) => {
          return <DataContextSelector {...model} value={value} onChange={onChange} />;
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

export { DataContextSelector };

export default DataContextSelectorComponent;