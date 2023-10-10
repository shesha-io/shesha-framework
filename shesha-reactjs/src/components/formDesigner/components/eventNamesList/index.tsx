import React, { FC } from 'react';
import { IFormItem, IToolboxComponent } from '../../../../interfaces';
import { IConfigurableFormComponent } from '../../../../providers/form/models';
import { ThunderboltOutlined } from '@ant-design/icons';
import { Select } from 'antd';
import { validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { alertSettingsForm } from './settings';
import { EVENTS } from './eventNames';
import ConfigurableFormItem from '../formItem';
import { migrateCustomFunctions, migratePropertyName } from 'designer-components/_common-migrations/migrateSettings';

export interface IEventNamesComponentProps extends IConfigurableFormComponent {}

const EventNamesComponent: IToolboxComponent<IEventNamesComponentProps> = {
  type: 'eventNames',
  name: 'Event Names',
  icon: <ThunderboltOutlined />,
  isHidden: true,
  canBeJsSetting: true,
  factory: (model: IEventNamesComponentProps) => {
    if (model.hidden) return null;

    return (
      <ConfigurableFormItem model={model}>
        {(value, onChange) => <EventNames {...model} name={model.propertyName} value={value} onChange={onChange}/>}
      </ConfigurableFormItem>
    );
  },
  migrator: (m) => m
    .add<IEventNamesComponentProps>(0, (prev) => migratePropertyName(migrateCustomFunctions(prev)))
  ,
  settingsFormMarkup: alertSettingsForm,
  validateSettings: model => validateConfigurableComponentSettings(alertSettingsForm, model),
};

interface IEventNamesProps extends IFormItem {}

// TODO: Make this configurable by exposing an EventsProvider that all components that can listen to events will be able to register them
const EventNames: FC<IEventNamesProps> = props => {
  return (
    <Select {...props} allowClear showSearch>
      {EVENTS?.map(event => (
        <Select.Option value={event.name} key={event.name}>
          {event.displayName}
        </Select.Option>
      ))}
      <Select.Option value="CUSTOM_EVENT">( add custom event )</Select.Option>
    </Select>
  );
};

export default EventNamesComponent;
