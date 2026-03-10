import { createStyles } from "antd-style";

export const useCalendarStyles = createStyles(({ css, cx }) => {
  const calendarMenu = "calendar-menu";
  const calendarLegendContainer = "calendar-legend-container";
  const calendarLegendItem = "calendar-legend-item";
  const calendarLegendColor = "calendar-legend-color";
  const calendarLegendLabel = "calendar-legend-label";
  const calendarHeader = "calendar-header";
  const calendarDisabledDay = "calendar-disabled-day";
  const calendarDisabledDayPast = "calendar-disabled-day-past";

  const calendarStyles = cx("calendar-styles", css`
        .${calendarMenu} {
            display: block;
            padding: 20px;
            opacity: 0.9;
        }

        .${calendarLegendContainer} {
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
        }

        .${calendarLegendItem} {
            display: flex;
            align-items: center;
            gap: 5px;
        }

        .${calendarLegendColor} {
            width: 12px;
            height: 12px;
            border-radius: 2px;
        }

        .${calendarLegendLabel} {
            font-size: 14px;
        }

        .${calendarHeader} {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 10px;
        }

        .${calendarDisabledDay} {
            background-color: #d9d9d9;
            color: #666666;
            cursor: not-allowed;
        }

        .${calendarDisabledDayPast} {
            background-color: #d9d9d9;
            color: #666666;
            cursor: not-allowed;
            opacity: 0.6;
        }
    `);

  return {
    calendarStyles,
    calendarMenu,
    calendarLegendContainer,
    calendarLegendItem,
    calendarLegendColor,
    calendarLegendLabel,
    calendarHeader,
    calendarDisabledDay,
    calendarDisabledDayPast,
  };
});
