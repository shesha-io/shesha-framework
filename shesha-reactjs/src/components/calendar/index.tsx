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
import { evaluateString, executeScript, useAvailableConstantsData, useConfigurableActionDispatcher, useForm, useFormData, useGlobalState, useHttpClient, useSheshaApplication, useTheme } from '@/index';
import { ICalendarLayersProps } from '@/providers/layersProvider/models';
import { ICalendarProps } from '@/designer-components/calendar/interfaces';

moment.locale('en-za');
const localizer = momentLocalizer(moment);

export const CalendarControl: FC<ICalendarProps> = (props) => {
  const { executeAction } = useConfigurableActionDispatcher();
  const { items, displayPeriod, minDate, maxDate, onSlotClick, onViewChange, externalStartDate, externalEndDate, styles } = props;
  const [points, setPoints] = useState<any>([]);
  const [defaultView, setDefaultView] = useState<View>(displayPeriod?.[0]);
  const allData = useAvailableConstantsData();
  const { theme } = useTheme();
  const primaryColor = theme.application.primaryColor;
  // Add refs for click handling
  const clickTimeoutRef = useRef<number | null>(null);
  const lastClickedEventRef = useRef<ICalendarLayersProps | null>(null);
  const { backendUrl } = useSheshaApplication();
  const httpClient = useHttpClient();
  const { data } = useFormData();
  const form = useForm();
  const { globalState } = useGlobalState();
  const [internalStartDate, setInternalStartDate] = useState<string>(externalStartDate);
  const [internalEndDate, setInternalEndDate] = useState<string>(externalEndDate);

  useEffect(() => {
    executeScript(externalStartDate, { data, globalState, httpClient, form, backendUrl }).then(res => {
      setInternalStartDate(res);
    });
    executeScript(externalEndDate, { data, globalState, httpClient, form, backendUrl }).then(res => {
      setInternalEndDate(res ? res : internalStartDate);
    });
  }, [externalStartDate, externalEndDate, data, globalState, httpClient, form, backendUrl]);

  const { layerMarkers, fetchData, fetchDefaultCalendarView, updateDefaultCalendarView } = useMetaMapMarker(items);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchDefaultCalendarView()
      .then((response) => setDefaultView(response.result ? response.result : displayPeriod?.[0]))
      .catch(() => setDefaultView(displayPeriod?.[0]));
  }, []);

  useEffect(() => {
    if (displayPeriod?.length && defaultView && !displayPeriod.includes(defaultView)) {
      setDefaultView(displayPeriod[0]);
    }
  }, [displayPeriod, defaultView]);

  const defaultChecked = getLayerMarkerOptions(items)?.map((item) => item.value);

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

  const dummyEvent = {
    "start": new Date(internalStartDate),
    "end": new Date(internalEndDate),
    "color": primaryColor,
  };

  const updatedPoints = useMemo(() =>
    points.map((point: any) => ({
      ...point,
      title: evaluateString(point.title, point),
    })),
    [points]
  );

  const onChange = (checked: string[]) => {
    setPoints(getMarkerPoints(layerMarkers, checked as string[]));
  };

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

  const menu = (
    <Menu style={{ display: 'block', padding: '20px', opacity: 0.9 }}>
      <Checkbox.Group options={getLayerMarkerOptions(items)} onChange={onChange} defaultValue={defaultChecked} />
    </Menu>
  );

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


  return (
    <>
      {displayPeriod?.length ? (
        <>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px',
            }}
          >
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
            <Dropdown overlay={menu}>
              <a className="ant-dropdown-link" onClick={(e) => e.preventDefault()}>
                Views <DownOutlined />
              </a>
            </Dropdown>
          </div>
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
            dayPropGetter={(newDate: Date) => {
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
            }}
          />
        </>
      ) : (
        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={'No Selected Calendar Views!'} />
      )}
    </>
  );
};

export default CalendarControl;
