import React, { useMemo, useState } from 'react';
import { Divider, Form, Input, InputNumber, Select } from 'antd';
import { IDataSourceComponentProps, IDataSourceSettingsProps } from './models';
import { MetadataProvider } from '../../../../providers/metadata';
import { SectionSeparator } from '../../../../';
import EndpointsAutocomplete from '../../../endpointsAutocomplete/endpointsAutocomplete';
import { RawAutocomplete } from '../../../autocomplete';
import TableViewSelectorSettingsModal from '../dataTable/tableViewSelector/tableViewSelectorSettingsModal';

function DataSourceSettings(props: IDataSourceSettingsProps) {
  const [form] = Form.useForm();
  const [ state, setState ] = useState<IDataSourceComponentProps>(props.model);

  const handleValuesChange = (changedValues: any, values: IDataSourceComponentProps) => {
    if (props.onValuesChange) {
      props.onValuesChange(changedValues, values);
    }
  };

  const settings = (
    <Form form={form} onFinish={props.onSave} onValuesChange={handleValuesChange} initialValues={props.model}
      wrapperCol={{ span: 24 }}
      labelCol={{ span: 24 }}
    >
      <Form.Item name="name"  label='Name'>
        <Input />
      </Form.Item>
      <Form.Item name="sourceType" label='Source Type'>
        <Select onChange={(item) => { 
          setState({...state, sourceType: item}); 
        }}>
          <Select.Option key='Form' value='Form'>Form</Select.Option>
          <Select.Option key='Entity' value='Entity'>Entity</Select.Option>
          <Select.Option key='Url' value='Url'>Url</Select.Option>
        </Select>
      </Form.Item>
      {(state.sourceType === 'Entity') &&
      <Form.Item key='entityType' name="entityType" label='Entity Type'>
        <RawAutocomplete dataSourceType='url' dataSourceUrl="/api/services/app/Metadata/EntityTypeAutocomplete" 
          onChange={(item) => { 
            setState({...state, entityType: item}); 
          }}
        />
      </Form.Item>
      }
      {(state.sourceType === 'Entity' || state.sourceType === 'Url') &&
      <Form.Item key='endpoint' name="endpoint"  label='Endpoint'>
        <EndpointsAutocomplete />
      </Form.Item>
      }
      <SectionSeparator title="Filters" />
      <Form.Item name="maxResultCount"  label='Max result count' tooltip='Leave empty to get all records'>
        <InputNumber min={0}/>
      </Form.Item>
      <Divider />
      <Form.Item name="filters">
        <TableViewSelectorSettingsModal readOnly={props.readOnly} />
      </Form.Item>
    </Form>
  );

  const meta = useMemo(() => {
    return <MetadataProvider id={state.id} modelType={state.entityType}>{settings}</MetadataProvider>;
  }, [state.entityType, state.sourceType]);

  return state.sourceType === 'Entity' && state.entityType ? meta : settings;
}

export default DataSourceSettings;
