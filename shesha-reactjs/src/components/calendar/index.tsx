import { DownOutlined } from '@ant-design/icons';
import { Checkbox, Dropdown, Empty, Menu } from 'antd';
import moment from "moment";
import "moment/min/locales"; // Imports ALL locales
import React, { FC, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, momentLocalizer, SlotInfo, View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useDeepCompareEffect, useEffectOnce } from 'react-use';
import { EventComponent } from './eventComponent';
import { useCalendarLayers } from './hooks';
import { getLayerOptions, getLayerEvents, isDateDisabled, getDayStyles } from './utils';
import { useCalendarStyles } from './styles/styles';
import { ICalendarProps } from '@/designer-components/calendar/interfaces';
import { DataContextProvider } from '@/providers/dataContextProvider';
import { ICalendarEvent } from '@/providers/layersProvider/models';
import { evaluateString, useAvailableConstantsData } from '@/providers/form/utils';
import { useActualContextExecution } from '@/hooks/formComponentHooks';
import { useConfigurableActionDispatcher } from '@/providers/configurableActionsDispatcher';
import { useTheme } from '@/providers/theme';
import { useCanvas } from '@/providers/canvas';
import { useFormState } from '@/providers/form';
import { isDefined } from '@/utils/nullables';
import { isNonEmptyArray } from '@/utils/array';

type CalendarExposedData = {
  events: ICalendarEvent[];
  defaultView: View | undefined;
  startDate: string | undefined;
  endDate: string | undefined;
  visibleLayers: string[];
};

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
    momentLocale = 'en-za',
  } = props;

  const { executeAction } = useConfigurableActionDispatcher();
  const allData = useAvailableConstantsData();
  const { theme } = useTheme();
  const { styles: calendarStyles } = useCalendarStyles();
  const { layerEvents, fetchData, fetchDefaultCalendarView, updateDefaultCalendarView } = useCalendarLayers(items);

  const [events, setEvents] = useState<ICalendarEvent[]>([]);
  const [defaultView, setDefaultView] = useState<View | undefined>(displayPeriod?.[0]);
  const [localeLoaded, setLocaleLoaded] = useState(false);

  const clickTimeoutRef = useRef<number | null>(null);
  const lastClickedEventRef = useRef<ICalendarEvent | null>(null);

  const primaryColor = theme.application?.primaryColor;
  const defaultVisibleLayers = getLayerOptions(items).map((item) => item.value);

  const canvasContext = useCanvas();
  const canvasZoom = canvasContext.zoom;
  const { formMode } = useFormState();
  const isDesignerMode = formMode === 'designer';

  const startDate = useActualContextExecution<string | undefined>(externalStartDate, {}, undefined);
  const endDate = useActualContextExecution<string | undefined>(externalEndDate, {}, undefined);

  // Set locale (all locales bundled via moment-with-locales)
  useEffect(() => {
    const setMomentLocale = (): void => {
      const result = moment.locale(momentLocale);
      if (result !== momentLocale) {
        console.warn(`Locale ${momentLocale} not available, using fallback: ${result}`);
      }
      setLocaleLoaded(true);
    };

    setLocaleLoaded(false);
    setMomentLocale();
  }, [momentLocale]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const localizer = useMemo(() => momentLocalizer(moment), [localeLoaded]);

  const dummyEvent: ICalendarEvent | null =
    startDate
      ? (() => {
        const s = new Date(startDate);
        const e = new Date(endDate || startDate);
        if (Number.isNaN(s.getTime()) || Number.isNaN(e.getTime())) return null;

        // Check if this is an all-day event (both dates are at start of day with no time component)
        const startMoment = moment(s);
        const endMoment = moment(e);
        const startIsStartOfDay = startMoment.isSame(startMoment.clone().startOf('day'));
        const endIsStartOfDay = endMoment.isSame(endMoment.clone().startOf('day'));

        // react-big-calendar requires all-day events to have end date at midnight of the NEXT day
        const adjustedEnd = (startIsStartOfDay && endIsStartOfDay)
          ? endMoment.clone().add(1, 'day').startOf('day').toDate()
          : e;

        const dummy: ICalendarEvent = {
          id: '',
          title: '',
          start: s,
          end: adjustedEnd,
          color: dummyEventColor || primaryColor,
        };
        return dummy;
      })()
      : null;

  const updatedEvents = useMemo<ICalendarEvent[]>(() =>
    events.map<ICalendarEvent>((event) => ({
      ...event,
      title: evaluateString(event.titleTemplate || event.title, event),
    })),
  [events]);


  // Fetch initial data
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Load saved default calendar view
  useEffectOnce(() => {
    const defaultView = isNonEmptyArray(displayPeriod) ? displayPeriod[0] : undefined;
    fetchDefaultCalendarView()
      .then((view) => setDefaultView(view ?? defaultView))
      .catch(() => setDefaultView(defaultView));
  });

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

  const handleCustomSelect = (event: ICalendarEvent): void => {
    // Prevent selection if the event date is disabled
    if (isDefined(event.start) && isDateDisabled(event.start, minDate, maxDate)) {
      return;
    }

    // Store the clicked event and set a timeout to execute the single click action
    lastClickedEventRef.current = event;

    // Clear any existing timeout
    if (clickTimeoutRef.current) {
      window.clearTimeout(clickTimeoutRef.current);
    }

    // Set a timeout to execute the single click action after a delay
    clickTimeoutRef.current = window.setTimeout((): void => {
      // Only execute if this is still the last clicked event (no double click occurred)
      if (lastClickedEventRef.current === event) {
        if (isDefined(event.onSelect)) {
          const evaluationContext = {
            ...allData,
            events,
            selectedRow: event,
          };

          void executeAction({
            actionConfiguration: event.onSelect,
            argumentsEvaluationContext: evaluationContext,
          });
        }
      }
    }, 300); // 300ms delay to detect double clicks
  };

  const handleCustomDoubleClick = (event: ICalendarEvent): void => {
    // Prevent double click if the event date is disabled
    if (isDefined(event.start) && isDateDisabled(event.start, minDate, maxDate)) {
      return;
    }

    // Clear the single click timeout to prevent it from executing
    if (clickTimeoutRef.current) {
      window.clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
    }

    // Clear the last clicked event reference
    lastClickedEventRef.current = null;

    if (isDefined(event.onDblClick)) {
      const evaluationContext = {
        ...allData,
        events,
        selectedRow: event,
        event,
      };
      void executeAction({
        actionConfiguration: event.onDblClick,
        argumentsEvaluationContext: evaluationContext,
      });
    }
  };

  const handleViewChange = (view: View): void => {
    if (isDefined(onViewChange)) {
      const evaluationContext = {
        ...allData,
        event: view,
      };
      void executeAction({
        actionConfiguration: onViewChange,
        argumentsEvaluationContext: evaluationContext,
      });
    }
  };

  const handleSlotClick = (slotInfo: SlotInfo): void => {
    // Prevent slot click if the date is disabled
    if (isDateDisabled(slotInfo.start, minDate, maxDate)) {
      return;
    }
    if (!isDefined(onSlotClick))
      return;

    // Detect if this is an all-day selection (month view)
    // react-big-calendar sets end date to midnight of the next day for all-day selections
    // We need to adjust only for all-day selections, not time-based selections
    const startIsMidnight = moment(slotInfo.start).isSame(moment(slotInfo.start).startOf('day'));
    const endIsMidnight = moment(slotInfo.end).isSame(moment(slotInfo.end).startOf('day'));
    const spansWholeDays =
      moment(slotInfo.end).startOf('day').diff(moment(slotInfo.start).startOf('day'), 'days') >= 1;

    const isAllDayRange = startIsMidnight && endIsMidnight && spansWholeDays;

    const adjustedSlotInfo = isAllDayRange
      ? {
        ...slotInfo,
        end: moment(slotInfo.end).subtract(1, 'day').endOf('day').toDate(),
      }
      : slotInfo;

    const evaluationContext = {
      ...allData,
      event: adjustedSlotInfo,
    };
    void executeAction({
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
    [calendarStyles.calendarMenu, items, onChange, defaultVisibleLayers],
  );

  const renderLegend = (): React.JSX.Element => (
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
        ) : null,
      )}
    </div>
  );

  const renderHeader = (): React.JSX.Element => (
    <div className={calendarStyles.calendarHeader}>
      {renderLegend()}
      <Dropdown menu={menuItems} popupRender={(): React.JSX.Element => dropdownContent}>
        <a className="ant-dropdown-link" onClick={(e): void => e.preventDefault()}>
          Views <DownOutlined />
        </a>
      </Dropdown>
    </div>
  );

  const exposedData = useMemo((): Promise<CalendarExposedData> => Promise.resolve({
    events: updatedEvents,
    defaultView,
    startDate: startDate,
    endDate: endDate,
    visibleLayers: defaultVisibleLayers,
  } satisfies CalendarExposedData), [updatedEvents, defaultView, startDate, endDate, defaultVisibleLayers]);

  const calendarContent = (): React.JSX.Element => {
    if (!displayPeriod?.length) {
      return <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No Selected Calendar Views!" />;
    }

    return (
      <>
        {renderHeader()}
        <Calendar
          views={displayPeriod}
          onView={(view) => {
            updateDefaultCalendarView(view).catch((error) => {
              console.error('Failed to update default calendar view', error);
              throw error;
            });
            setDefaultView(view);
            handleViewChange(view);
          }}
          selectable
          localizer={localizer}
          defaultDate={new Date()}
          view={isDefined(displayPeriod)
            ? isDefined(defaultView) && displayPeriod.includes(defaultView)
              ? defaultView
              : displayPeriod[0]
            : undefined}
          events={isDefined(dummyEvent) ? updatedEvents.concat(dummyEvent) : updatedEvents}
          style={{
            ...styles,
            ...(isDesignerMode && canvasZoom ? { zoom: 100 / canvasZoom } : {}),
          }}
          onSelectEvent={handleCustomSelect}
          onDoubleClickEvent={handleCustomDoubleClick}
          onSelectSlot={handleSlotClick}
          eventPropGetter={(event) => ({
            style: { backgroundColor: event.color || primaryColor },
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
