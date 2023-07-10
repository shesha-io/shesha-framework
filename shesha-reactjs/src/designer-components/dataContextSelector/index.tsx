import { IToolboxComponent } from '../../interfaces';
import { CodeOutlined } from '@ant-design/icons';
import ConfigurableFormItem from '../../components/formDesigner/components/formItem';
import React from 'react';
import { IConfigurableFormComponent, useForm } from '../../providers';
import { DataTypes, StringFormats } from '../../interfaces/dataTypes';
import { Select } from 'antd';
import { useDataContextManager } from 'providers/dataContextManager';
import { useFormDesigner } from 'providers/formDesigner';

interface IDataContextSelectorComponentProps extends IConfigurableFormComponent {}

const DataContextSelectorComponent: IToolboxComponent<IDataContextSelectorComponentProps> = {
    type: 'dataContextSelector',
    isInput: true,
    isOutput: true,
    name: 'DataContext selector',
    icon: <CodeOutlined />,
    dataTypeSupported: ({ dataType, dataFormat }) => dataType === DataTypes.string && dataFormat === StringFormats.singleline,
    factory: (model: IDataContextSelectorComponentProps, _c, _f, _ch) => {
      const { formMode, isComponentDisabled } = useForm();
      const disabled = isComponentDisabled(model);
      const readOnly = model?.readOnly || disabled || (formMode === 'readonly');
  
      const { getParentComponent } = useFormDesigner();
      const context = getParentComponent(_f.getFieldValue('id'), 'dataContext');

      const { getDataContexts } = useDataContextManager();
      const dataContexts = getDataContexts(context?.id);

      return (
        <ConfigurableFormItem model={model}>
            <Select allowClear={true} disabled={readOnly} showSearch >
                <Select.Option key={0} value='formData'>FormData</Select.Option>
                {dataContexts.map((item) => {
                  return <Select.Option key={item.id} value={item.id}>{item.name}</Select.Option>;
                })}
            </Select>
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
  
  export default DataContextSelectorComponent;