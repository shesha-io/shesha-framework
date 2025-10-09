import { DownOutlined } from '@ant-design/icons';
import { Checkbox, Dropdown, Empty, Menu } from 'antd';
import moment from 'moment';
import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, momentLocalizer, SlotInfo, View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useDeepCompareEffect } from 'react-use';
import { EventComponent } from './eventComponent';
import { useCalendarLayers } from './hooks';
import { getLayerOptions, getLayerEvents, isDateDisabled, getDayStyles } from './utils';
import { useCalendarStyles } from './styles/styles';
import {
  evaluateString,
  executeScript,
  useAvailableConstantsData,
  useConfigurableActionDispatcher,
  useForm,
  useFormData,
  useGlobalState,
  useHttpClient,
  useSheshaApplication,
  useTheme
} from '@/index';
import { ICalendarLayersProps } from '@/providers/layersProvider/models';
import { ICalendarProps } from '@/designer-components/calendar/interfaces';
import { DataContextProvider } from '@/providers/dataContextProvider';

moment.locale('en-za');
const localizer = momentLocalizer(moment);

export const CalendarControl: FC<ICalendarProps> = (props) => {
  const {
    items,
    displayPeriod,
    minDate,
    maxDate,
    onSlotClick,
    onViewChange,
    externalStartDate,
    externalEndDate,
    styles,
    componentName,
    id
  } = props;

  const { executeAction } = useConfigurableActionDispatcher();
  const allData = useAvailableConstantsData();
  const { theme } = useTheme();
  const { styles: calendarStyles } = useCalendarStyles();
  const { backendUrl } = useSheshaApplication();
  const httpClient = useHttpClient();
  const { data } = useFormData();
  const form = useForm();
  const { globalState } = useGlobalState();
  const { layerEvents, fetchData, fetchDefaultCalendarView, updateDefaultCalendarView } = useCalendarLayers(items);

  const [events, setEvents] = useState<any>([]);
  const [defaultView, setDefaultView] = useState<View>(displayPeriod?.[0]);
  const [internalStartDate, setInternalStartDate] = useState<string>(externalStartDate);
  const [internalEndDate, setInternalEndDate] = useState<string>(externalEndDate);

  const clickTimeoutRef = useRef<number | null>(null);
  const lastClickedEventRef = useRef<ICalendarLayersProps | null>(null);

  const primaryColor = theme.application.primaryColor;
  const defaultVisibleLayers = getLayerOptions(items)?.map((item) => item.value);

  const dummyEvent = {
    start: new Date(internalStartDate),
    end: new Date(internalEndDate),
    color: primaryColor,
  };

  const updatedEvents = useMemo(() =>
    events.map((event: any) => ({
      ...event,
      title: evaluateString(event.title, event),
    })),
    [events]
  );

  // Handle external date changes
  useEffect(() => {
    if (externalStartDate) {
      executeScript(externalStartDate, allData).then(res => {
        setInternalStartDate(res);
      });
    }
    if (externalEndDate) {
      executeScript(externalEndDate, allData).then(res => {
        setInternalEndDate(res ? res : internalStartDate);
      });
    }
  }, [externalStartDate, externalEndDate, allData]);

  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Load saved default calendar view
  useEffect(() => {
    fetchDefaultCalendarView()
      .then((response) => setDefaultView(response.result ? response.result : displayPeriod?.[0]))
      .catch(() => setDefaultView(displayPeriod?.[0]));
  }, []);

  // Ensure default view is valid
  useEffect(() => {
    if (displayPeriod?.length && defaultView && !displayPeriod.includes(defaultView)) {
      setDefaultView(displayPeriod[0]);
    }
  }, [displayPeriod, defaultView]);

  // Update events when layer events change
  useDeepCompareEffect(() => {
    setEvents(getLayerEvents(layerEvents, defaultVisibleLayers));
  }, [layerEvents]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        window.clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  const onChange = (checked: string[]) => {
    setEvents(getLayerEvents(layerEvents, checked as string[]));
  };

  const handleCustomSelect = (event: ICalendarLayersProps) => {
    // Prevent selection if the event date is disabled
    if (event.startTime && isDateDisabled(new Date(event.startTime), minDate, maxDate)) {
      return;
    }

    // Store the clicked event and set a timeout to execute the single click action
    lastClickedEventRef.current = event;

    // Clear any existing timeout
    if (clickTimeoutRef.current) {
      window.clearTimeout(clickTimeoutRef.current);
    }

    // Set a timeout to execute the single click action after a delay
    clickTimeoutRef.current = window.setTimeout(() => {
      // Only execute if this is still the last clicked event (no double click occurred)
      if (lastClickedEventRef.current === event) {
        const evaluationContext = {
          ...allData,
          events,
          selectedRow: event,
        };

        executeAction({
          actionConfiguration: event.onSelect,
          argumentsEvaluationContext: evaluationContext,
        });
      }
    }, 300); // 300ms delay to detect double clicks
  };

  const handleCustomDoubleClick = (event: ICalendarLayersProps) => {
    // Prevent double click if the event date is disabled
    if (event.startTime && isDateDisabled(new Date(event.startTime), minDate, maxDate)) {
      return;
    }

    // Clear the single click timeout to prevent it from executing
    if (clickTimeoutRef.current) {
      window.clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }

    // Clear the last clicked event reference
    lastClickedEventRef.current = null;

    const evaluationContext = {
      ...allData,
      events,
      selectedRow: event,
      event,
    };

    executeAction({
      actionConfiguration: event.onDblClick,
      argumentsEvaluationContext: evaluationContext,
    });
  };

  const handleViewChange = (view: View) => {
    const evaluationContext = {
      ...allData,
      event: view,
    };
    executeAction({
      actionConfiguration: onViewChange,
      argumentsEvaluationContext: evaluationContext,
    });
  };

  const handleSlotClick = (slotInfo: SlotInfo) => {
    // Prevent slot click if the date is disabled
    if (isDateDisabled(slotInfo.start, minDate, maxDate)) {
      return;
    }

    const evaluationContext = {
      ...allData,
      event: slotInfo,
    };
    executeAction({
      actionConfiguration: onSlotClick,
      argumentsEvaluationContext: evaluationContext,
    });
  };

  const menu = (
    <Menu className={calendarStyles.calendarMenu}>
      <Checkbox.Group options={getLayerOptions(items)} onChange={onChange} defaultValue={defaultVisibleLayers} />
    </Menu>
  );

  const renderLegend = () => (
    <div className={calendarStyles.calendarLegendContainer}>
      {items?.map((layer) =>
        layer.showLegend ? (
          <div key={layer.id} className={calendarStyles.calendarLegendItem}>
            <div
              className={calendarStyles.calendarLegendColor}
              style={{
                backgroundColor: (layer.color as any) || primaryColor,
              }}
            />
            <span className={calendarStyles.calendarLegendLabel}>{layer.label}</span>
          </div>
        ) : null,
      )}
    </div>
  );

  const renderHeader = () => (
    <div className={calendarStyles.calendarHeader}>
      {renderLegend()}
      <Dropdown overlay={menu}>
        <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
          Views <DownOutlined />
        </a>
      </Dropdown>
    </div>
  );

  const exposedData = useMemo(() => Promise.resolve({
    events: updatedEvents,
    defaultView,
    startDate: internalStartDate,
    endDate: internalEndDate,
    visibleLayers: defaultVisibleLayers,
  }), [updatedEvents, defaultView, internalStartDate, internalEndDate, defaultVisibleLayers]);

  const calendarContent = () => {
    if (!displayPeriod?.length) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Selected Calendar Views!" />;
    }

    return (
      <>
        {renderHeader()}
        <Calendar
          views={displayPeriod as any}
          onView={(view) => {
            updateDefaultCalendarView(view);
            setDefaultView(view);
            handleViewChange(view);
          }}
          selectable
          localizer={localizer}
          defaultDate={new Date()}
          view={displayPeriod?.includes(defaultView) ? defaultView : displayPeriod?.[0]}
          events={updatedEvents.concat(dummyEvent)}
          style={styles}
          onSelectEvent={handleCustomSelect}
          onDoubleClickEvent={handleCustomDoubleClick}
          onSelectSlot={handleSlotClick}
          eventPropGetter={(event: any) => ({
            style: { backgroundColor: event.color || primaryColor, height: '100%' },
          })}
          components={{
            event: EventComponent,
          }}
          dayPropGetter={(date: Date) => getDayStyles(date, minDate, maxDate)}
        />
      </>
    );
  };

  if (componentName) {
    return (
      <DataContextProvider
        id={id}
        name={componentName}
        type="control"
        initialData={exposedData}
      >
        {calendarContent()}
      </DataContextProvider>
    );
  }

  return calendarContent();
};

export default CalendarControl;
