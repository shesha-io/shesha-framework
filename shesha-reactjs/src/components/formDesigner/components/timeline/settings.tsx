import React, { FC } from 'react';
import { Checkbox, Input, Select } from 'antd';
import SectionSeparator from '../../../sectionSeparator';
import Show from '../../../show';
import { AutocompleteRaw } from '../../../autocomplete';
import { QueryBuilderComponentRenderer } from 'designer-components/queryBuilder/queryBuilderComponent';
import { QueryBuilderWithModelType } from 'designer-components/queryBuilder/queryBuilderWithModelType';
import Properties from '../../../properties';
import { ITimelineProps } from '../../../timeline/models';
import { ISettingsFormFactoryArgs } from 'interfaces';
import SettingsForm, { useSettingsForm } from 'designer-components/_settings/settingsForm';
import SettingsFormItem from 'designer-components/_settings/settingsFormItem';
import SettingsCollapsiblePanel from 'designer-components/_settings/settingsCollapsiblePanel';

const { Option } = Select;

export const TimelineSettingsForm: FC<ISettingsFormFactoryArgs<ITimelineProps>> = (props) => {
  return (
    SettingsForm<ITimelineProps>({...props, children: <TimelineSettings {...props}/>})
  );
};

const TimelineSettings: FC<ISettingsFormFactoryArgs<ITimelineProps>> = ({readOnly}) => {
  const { model: state, onValuesChange } = useSettingsForm<ITimelineProps>();

  return (
    <>
      <SettingsCollapsiblePanel header='Data'>

      <SettingsFormItem name="componentName" initialValue={state.propertyName} label="Component name" rules={[{ required: true }]}>
        <Input disabled={readOnly} />
      </SettingsFormItem>

      <SettingsFormItem name="label" initialValue={state.label} label="Label" jsSetting>
        <Input disabled={readOnly} />
      </SettingsFormItem>

      <SettingsFormItem name="hidden" label="Hidden" valuePropName="checked" jsSetting>
        <Checkbox disabled={readOnly} />
      </SettingsFormItem>

      <SettingsFormItem
        name="apiSource"
        label="Api source"
        tooltip="An option to use entity option or custom api. Bare in mind that everything works the same as entity for custom api, the source is the only thing that differs."
        initialValue={['entity']}
      >
        <Select disabled={readOnly}>
          <Option value="entity">entity</Option>
          <Option value="custom">custom Url</Option>
        </Select>
      </SettingsFormItem>

      <Show when={state.apiSource === 'custom'}>
        <SettingsFormItem name={'ownerId'} label="id">
          <Input disabled={readOnly} />
        </SettingsFormItem>
      </Show>

      <Show when={state?.apiSource === 'entity'}>
        <SettingsFormItem name="entityType" label="Entity type">
          {(value) =>
          <AutocompleteRaw
            value={value}
            dataSourceType="url"
            dataSourceUrl="/api/services/app/Metadata/TypeAutocomplete"
            readOnly={state.readOnly}
            disabled={readOnly} 
            onChange={(val) => onValuesChange({entityType: val, filters: null, properties: null})}
          />
          }
        </SettingsFormItem>
        <Show when={Boolean(state?.entityType)}>
          <SettingsFormItem name="properties" label="Properties">
            <Properties modelType={state?.entityType} mode="multiple" value={state?.properties} disabled={readOnly} />
          </SettingsFormItem>

          <SectionSeparator title="Query builder" />

          <QueryBuilderWithModelType modelType={state?.entityType}>
            <QueryBuilderComponentRenderer
              readOnly={readOnly}
              propertyName="filters"
              type={''}
              id={''}
              label="Query builder"
            />
          </QueryBuilderWithModelType>
        </Show>
      </Show>

      <Show when={state?.apiSource === 'custom'}>
        <SettingsFormItem label="Custom Api URL" name="customApiUrl" tooltip="The URL for a custom Api.">
          <Input readOnly={readOnly} />
        </SettingsFormItem>
      </Show>
      </SettingsCollapsiblePanel>
    </>
  );
};

export default TimelineSettings;
