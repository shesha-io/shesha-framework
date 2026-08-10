import { IToolboxComponent } from '@/interfaces';
import { CodeOutlined } from '@ant-design/icons';
import { ConfigurableFormItem } from '@/components/formDesigner/components/formItem';
import React, { FC } from 'react';
import { IConfigurableFormComponent } from '@/providers';
import { DataTypes, StringFormats } from '@/interfaces/dataTypes';
import { Select } from 'antd';
import { useDataContextManager } from '@/providers/dataContextManager/hooks';
import { SizeType } from 'antd/lib/config-provider/SizeContext';
import { throwError } from '@/utils/errors';

export interface IDataContextSelectorProps<TValue = string> {
  readOnly?: boolean | undefined;
  value?: TValue | null | undefined;
  size?: SizeType | undefined;
  onChange: (value: TValue) => void;
}
const DataContextSelector: FC<IDataContextSelectorProps> = (props) => {
  // Use parent DCM because this control usually used in the properties form and has own DCM
  const dcm = useDataContextManager();
  const { getDataContexts } = dcm.getParent() ?? dcm.getRoot() ?? throwError('DataContext not found');

  const dataContexts = getDataContexts('all');

  const onChange = (value: string): void => {
    props.onChange(value);
  };

  return (
    <Select<string>
      allowClear={true}
      disabled={props.readOnly ?? false}
      showSearch
      value={props.value ?? null}
      size={props.size}
      onChange={onChange}
      options={dataContexts.map((item) => ({ value: item.id, label: item.name }))}
    />
  );
};

type IDataContextSelectorComponentProps = IConfigurableFormComponent;

const DataContextSelectorComponent: IToolboxComponent<IDataContextSelectorComponentProps> = {
  type: 'dataContextSelector',
  isInput: true,
  isOutput: true,
  name: 'DataContext selector',
  icon: <CodeOutlined />,
  preserveDimensionsInDesigner: true,
  dataTypeSupported: ({ dataType, dataFormat }) => dataType === DataTypes.string && dataFormat === StringFormats.singleline,
  Factory: ({ model }) => {
    return (
      <ConfigurableFormItem<string> model={{ ...model }}>
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
