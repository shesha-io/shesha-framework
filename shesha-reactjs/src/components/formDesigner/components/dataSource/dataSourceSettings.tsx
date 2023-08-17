import React, { FC, useMemo } from 'react';
import { Divider, Input, InputNumber, Select } from 'antd';
import { IDataSourceComponentProps } from './models';
import { MetadataProvider } from '../../../../providers/metadata';
import { ISettingsFormFactoryArgs, SectionSeparator } from '../../../../';
import EndpointsAutocomplete from '../../../endpointsAutocomplete/endpointsAutocomplete';
import { RawAutocomplete } from '../../../autocomplete';
import TableViewSelectorSettingsModal from '../../../../designer-components/dataTable/tableViewSelector/tableViewSelectorSettingsModal';
import SettingsForm, { useSettingsForm } from 'designer-components/_settings/settingsForm';
import SettingsFormItem from 'designer-components/_settings/settingsFormItem';

export const DataSourceSettingsForm: FC<ISettingsFormFactoryArgs<IDataSourceComponentProps>> = (props) => {
  return (
    SettingsForm<IDataSourceComponentProps>({...props, children: <DataSourceSettings {...props} />})
  );
};

const DataSourceSettings: FC<ISettingsFormFactoryArgs<IDataSourceComponentProps>> = ({readOnly}) => {
  const { model: state } = useSettingsForm<IDataSourceComponentProps>();

  const settings = (
    <>
      <SettingsFormItem name="componentName" label='Component name' required>
        <Input />
      </SettingsFormItem>
      <SettingsFormItem name="sourceType" label='Source Type'>
        <Select>
          <Select.Option key='Form' value='Form'>Form</Select.Option>
          <Select.Option key='Entity' value='Entity'>Entity</Select.Option>
          <Select.Option key='Url' value='Url'>Url</Select.Option>
        </Select>
      </SettingsFormItem>
      {(state.sourceType === 'Entity') &&
      <SettingsFormItem key='entityType' name="entityType" label='Entity Type' jsSetting>
        <RawAutocomplete dataSourceType='url' dataSourceUrl="/api/services/app/Metadata/EntityTypeAutocomplete" />
      </SettingsFormItem>
      }
      {(state.sourceType === 'Entity' || state.sourceType === 'Url') &&
      <SettingsFormItem key='endpoint' name="endpoint"  label='Endpoint' jsSetting>
        <EndpointsAutocomplete />
      </SettingsFormItem>
      }
      <SectionSeparator title="Filters" />
      <SettingsFormItem name="maxResultCount"  label='Max result count' tooltip='Leave empty to get all records' jsSetting>
        <InputNumber min={0}/>
      </SettingsFormItem>
      <Divider />
      <SettingsFormItem name="filters">
        <TableViewSelectorSettingsModal readOnly={readOnly} />
      </SettingsFormItem>
    </>
  );

  const meta = useMemo(() => {
    return <MetadataProvider id={state.id} modelType={state.entityType}>{settings}</MetadataProvider>;
  }, [state.entityType, state.sourceType]);

  return state.sourceType === 'Entity' && state.entityType ? meta : settings;
};
