import { FolderOpenOutlined } from '@ant-design/icons';
import React from 'react';
import CalendarControl from '../../components/calendar';
import { CalendarActionsAccessor } from '../../components/calendar/configurable-actions/calendar-actions-processor';
import { getSettings } from './settingsForm';
import { validateConfigurableComponentSettings } from '@/formDesignerUtils';
import { IToolboxComponent } from '@/interfaces/formDesigner';
import { LayerGroupConfiguratorProvider } from '@/providers/calendar';
import { ICalendarProps } from '@/providers/calendar/models';

const CalendarComponent: IToolboxComponent<ICalendarProps> = {
  type: 'calendar',
  isInput: true,
  name: 'Calendar',
  icon: <FolderOpenOutlined />,
  Factory: ({ model }) => {
    const { description } = model;

    if (model.hidden) return null;

    return (
      <LayerGroupConfiguratorProvider>
        <CalendarActionsAccessor>
          <CalendarControl
            {...model}
            description={description}
          />
        </CalendarActionsAccessor>
      </LayerGroupConfiguratorProvider>
    );
  },
  settingsFormMarkup: (data) => getSettings(data),
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings(model), model),
};

export default CalendarComponent;
