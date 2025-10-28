import { DownOutlined } from '@ant-design/icons';
import { Checkbox, Dropdown, Empty, Menu } from 'antd';
import moment from 'moment';
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, momentLocalizer, SlotInfo, View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useDeepCompareEffect } from 'react-use';
import { EventComponent } from './eventComponent';
import { useCalendarLayers } from './hooks';
import { getLayerOptions, getLayerEvents, isDateDisabled, getDayStyles } from './utils';
import { useCalendarStyles } from './styles/styles';
import {
  evaluateString,
  useActualContextExecution,
  useAvailableConstantsData,
  useConfigurableActionDispatcher,
  useTheme
} from '@/index';
import { ICalendarProps } from '@/designer-components/calendar/interfaces';
import { DataContextProvider } from '@/providers/dataContextProvider';
import { ICalendarEvent } from '@/providers/layersProvider/models';

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
    id,
    dummyEventColor,
  } = props;

  const { executeAction } = useConfigurableActionDispatcher();
  const allData = useAvailableConstantsData();
  const { theme } = useTheme();
  const { styles: calendarStyles } = useCalendarStyles();
  const { layerEvents, fetchData, fetchDefaultCalendarView, updateDefaultCalendarView } = useCalendarLayers(items);

  const [events, setEvents] = useState<any>([]);
  const [defaultView, setDefaultView] = useState<View>(displayPeriod?.[0]);

  const clickTimeoutRef = useRef<number | null>(null);
  const lastClickedEventRef = useRef<ICalendarEvent | null>(null);

  const primaryColor = theme.application.primaryColor;
  const defaultVisibleLayers = getLayerOptions(items)?.map((item) => item.value);

  const startDate = useActualContextExecution(externalStartDate);
  const endDate = useActualContextExecution(externalEndDate);

  const dummyEvent =
    startDate && endDate
      ? (() => {
        const s = new Date(startDate);
        const e = new Date(endDate);
        return isNaN(s.getTime()) || isNaN(e.getTime()) ? null : { start: s, end: e, color: dummyEventColor || primaryColor };
      })()
      : null;

  const updatedEvents = useMemo(() =>
    events.map((event: any) => ({
      ...event,
      title: evaluateString(event.title, event),
    })),
    [events]
  );


  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Load saved default calendar view
  useEffect(() => {
    fetchDefaultCalendarView()
      .then((response) => setDefaultView(response?.result ?? displayPeriod?.[0]))
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

  const onChange = useCallback((checked: string[]) => {
    setEvents(getLayerEvents(layerEvents, checked as string[]));
  }, [layerEvents]);

  const handleCustomSelect = (event: ICalendarEvent) => {
    // Prevent selection if the event date is disabled
    if (event.start && isDateDisabled(event.start, minDate, maxDate)) {
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

  const handleCustomDoubleClick = (event: ICalendarEvent) => {
    // Prevent double click if the event date is disabled
    if (event.start && isDateDisabled(event.start, minDate, maxDate)) {
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

  const menuItems = {
    items: [],
  };

  const dropdownContent = useMemo(
    () => (
      <Menu className={calendarStyles.calendarMenu}>
        <Checkbox.Group options={getLayerOptions(items)} onChange={onChange} defaultValue={defaultVisibleLayers} />
      </Menu>
    ),
    [calendarStyles.calendarMenu, items, onChange, defaultVisibleLayers]
  );

  const renderLegend = () => (
    <div className={calendarStyles.calendarLegendContainer}>
      {items?.map((layer) =>
        layer.showLegend ? (
          <div key={layer.id} className={calendarStyles.calendarLegendItem}>
            <div
              className={calendarStyles.calendarLegendColor}
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: (layer.color) || primaryColor,
                borderRadius: '2px',
                display: 'inline-block',
                flexShrink: 0,
                border: '1px solid rgba(0,0,0,0.1)',
                marginRight: '8px',
              }}
            />
            <span className={calendarStyles.calendarLegendLabel}>{layer.label}</span>
          </div>
        ) : null
      )}
    </div>
  );

  const renderHeader = () => (
    <div className={calendarStyles.calendarHeader}>
      {renderLegend()}
      <Dropdown menu={menuItems} dropdownRender={() => dropdownContent}>
        <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
          Views <DownOutlined />
        </a>
      </Dropdown>
    </div>
  );

  const exposedData = useMemo(() => Promise.resolve({
    events: updatedEvents,
    defaultView,
    startDate: startDate,
    endDate: endDate,
    visibleLayers: defaultVisibleLayers,
  }), [updatedEvents, defaultView, startDate, endDate, defaultVisibleLayers]);

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
          events={dummyEvent ? updatedEvents.concat(dummyEvent) : updatedEvents}
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
