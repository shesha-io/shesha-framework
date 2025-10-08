import { DownOutlined } from '@ant-design/icons';
import { Checkbox, Dropdown, Empty, Menu } from 'antd';
import moment from 'moment';
import React, { FC, useEffect, useMemo, useRef, useState } from 'react';
import { Calendar, momentLocalizer, SlotInfo, View } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useDeepCompareEffect } from 'react-use';
import { EventComponent } from './eventComponent';
import { useMetaMapMarker } from './hooks';
import { getLayerMarkerOptions, getMarkerPoints } from './utils';
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
    styles
  } = props;

  const { executeAction } = useConfigurableActionDispatcher();
  const allData = useAvailableConstantsData();
  const { theme } = useTheme();
  const { backendUrl } = useSheshaApplication();
  const httpClient = useHttpClient();
  const { data } = useFormData();
  const form = useForm();
  const { globalState } = useGlobalState();
  const { layerMarkers, fetchData, fetchDefaultCalendarView, updateDefaultCalendarView } = useMetaMapMarker(items);

  const [points, setPoints] = useState<any>([]);
  const [defaultView, setDefaultView] = useState<View>(displayPeriod?.[0]);
  const [internalStartDate, setInternalStartDate] = useState<string>(externalStartDate);
  const [internalEndDate, setInternalEndDate] = useState<string>(externalEndDate);

  const clickTimeoutRef = useRef<number | null>(null);
  const lastClickedEventRef = useRef<ICalendarLayersProps | null>(null);

  const primaryColor = theme.application.primaryColor;
  const defaultChecked = getLayerMarkerOptions(items)?.map((item) => item.value);

  const dummyEvent = {
    start: new Date(internalStartDate),
    end: new Date(internalEndDate),
    color: primaryColor,
  };

  const updatedPoints = useMemo(() =>
    points.map((point: any) => ({
      ...point,
      title: evaluateString(point.title, point),
    })),
    [points]
  );

  // Handle external date changes
  useEffect(() => {
    executeScript(externalStartDate, { data, globalState, httpClient, form, backendUrl }).then(res => {
      setInternalStartDate(res);
    });
    executeScript(externalEndDate, { data, globalState, httpClient, form, backendUrl }).then(res => {
      setInternalEndDate(res ? res : internalStartDate);
    });
  }, [externalStartDate, externalEndDate, data, globalState, httpClient, form, backendUrl]);

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

  // Update points when layer markers change
  useDeepCompareEffect(() => {
    setPoints(getMarkerPoints(layerMarkers, defaultChecked));
  }, [layerMarkers]);

  // Cleanup timeouts on unmount
  useEffect(() => {
    return () => {
      if (clickTimeoutRef.current) {
        window.clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  const isDateDisabled = (date: Date): boolean => {
    // Reset time to start of day for accurate date comparison
    const dateToCheck = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    if (minDate) {
      const minDateObj = new Date(minDate);
      const minDateReset = new Date(minDateObj.getFullYear(), minDateObj.getMonth(), minDateObj.getDate());
      if (dateToCheck < minDateReset) return true;
    }

    if (maxDate) {
      const maxDateObj = new Date(maxDate);
      const maxDateReset = new Date(maxDateObj.getFullYear(), maxDateObj.getMonth(), maxDateObj.getDate());
      if (dateToCheck > maxDateReset) return true;
    }

    return false;
  };

  const onChange = (checked: string[]) => {
    setPoints(getMarkerPoints(layerMarkers, checked as string[]));
  };

  const handleCustomSelect = (event: ICalendarLayersProps) => {
    // Prevent selection if the event date is disabled
    if (event.startTime && isDateDisabled(new Date(event.startTime))) {
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
          points,
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
    if (event.startTime && isDateDisabled(new Date(event.startTime))) {
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
      points,
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
    if (isDateDisabled(slotInfo.start)) {
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
    <Menu style={{ display: 'block', padding: '20px', opacity: 0.9 }}>
      <Checkbox.Group options={getLayerMarkerOptions(items)} onChange={onChange} defaultValue={defaultChecked} />
    </Menu>
  );

  const renderLegend = () => (
    <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
      {items?.map((layer) =>
        layer.showLegend ? (
          <div key={layer.id} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <div
              style={{
                width: '12px',
                height: '12px',
                backgroundColor: (layer.color as any) || primaryColor,
                borderRadius: '2px',
              }}
            />
            <span style={{ fontSize: '14px' }}>{layer.label}</span>
          </div>
        ) : null,
      )}
    </div>
  );

  const renderHeader = () => (
    <div
      style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '10px',
      }}
    >
      {renderLegend()}
      <Dropdown overlay={menu}>
        <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
          Views <DownOutlined />
        </a>
      </Dropdown>
    </div>
  );

  const getDayStyles = (newDate: Date) => {
    const dateToCheck = new Date(newDate.getFullYear(), newDate.getMonth(), newDate.getDate());
    const minDateObj = minDate ? new Date(minDate) : null;
    const maxDateObj = maxDate ? new Date(maxDate) : null;

    if (minDateObj) {
      const minDateReset = new Date(minDateObj.getFullYear(), minDateObj.getMonth(), minDateObj.getDate());
      if (dateToCheck < minDateReset) {
        return {
          style: { backgroundColor: '#d9d9d9', color: '#666666', cursor: 'not-allowed' },
        };
      }
    }

    if (maxDateObj) {
      const maxDateReset = new Date(maxDateObj.getFullYear(), maxDateObj.getMonth(), maxDateObj.getDate());
      if (dateToCheck > maxDateReset) {
        return {
          style: { backgroundColor: '#d9d9d9', color: '#666666', cursor: 'not-allowed', opacity: 0.6 },
        };
      }
    }

    return {};
  };

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
        events={updatedPoints.concat(dummyEvent)}
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
        dayPropGetter={getDayStyles}
      />
    </>
  );
};

export default CalendarControl;
