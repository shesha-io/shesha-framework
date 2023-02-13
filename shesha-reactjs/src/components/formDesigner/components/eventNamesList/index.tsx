import React, { FC } from 'react';
import { IFormItem, IToolboxComponent } from '../../../../interfaces';
import { IConfigurableFormComponent } from '../../../../providers/form/models';
import { ThunderboltOutlined } from '@ant-design/icons';
import { Select } from 'antd';
import { validateConfigurableComponentSettings } from '../../../../providers/form/utils';
import { useForm } from '../../../../providers';
import { alertSettingsForm } from './settings';
import { EVENTS } from './eventNames';
import ConfigurableFormItem from '../formItem';

export interface IEventNamesComponentProps extends IConfigurableFormComponent {}

const EventNamesComponent: IToolboxComponent<IEventNamesComponentProps> = {
  type: 'eventNames',
  name: 'Event Names',
  icon: <ThunderboltOutlined />,
  isHidden: true,
  factory: (model: IEventNamesComponentProps) => {
    const { isComponentHidden } = useForm();

    const isHidden = isComponentHidden(model);

    if (isHidden) return null;

    return (
      <ConfigurableFormItem model={model}>
        <EventNames {...model} />
      </ConfigurableFormItem>
    );
  },
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
