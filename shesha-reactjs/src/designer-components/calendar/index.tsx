import { FolderOpenOutlined } from '@ant-design/icons';
import React, { CSSProperties } from 'react';
import CalendarControl from '../../components/calendar';
import { CalendarActionsAccessor } from '../../components/calendar/configurable-actions/calendar-actions-processor';
import { getSettings } from './settingsForm';
import { validateConfigurableComponentSettings } from '@/formDesignerUtils';
import { IToolboxComponent } from '@/interfaces/formDesigner';
import { LayerGroupConfiguratorProvider } from '@/providers/layersProvider';
import { migratePrevStyles } from '@/index';
import { defaultStyles } from './utils';
import { ICalendarProps } from './interfaces';

const CalendarComponent: IToolboxComponent<ICalendarProps> = {
  type: 'calendar',
  isInput: true,
  name: 'Calendar',
  icon: <FolderOpenOutlined />,
  Factory: ({ model }) => {
    const { allStyles } = model;

    if (model.hidden) return null;

    const additionalStyles: CSSProperties = ({
      ...allStyles.dimensionsStyles,
      ...allStyles.stylingBoxAsCSS,
    });

    return (
      <LayerGroupConfiguratorProvider>
        <CalendarActionsAccessor>
          <CalendarControl
            {...model}
            styles={additionalStyles}
          />
        </CalendarActionsAccessor>
      </LayerGroupConfiguratorProvider>
    );
  },
  settingsFormMarkup: getSettings,
  validateSettings: (model) => validateConfigurableComponentSettings(getSettings, model),
  migrator: (m) =>
    m.add<any>(0, (prev) => ({ ...migratePrevStyles(prev, defaultStyles()) }))
      .add<ICalendarProps>(1, (prev) => ({ ...prev, displayPeriod: ['month', 'week', 'work_week', 'day', 'agenda'] })),

};

export default CalendarComponent;
