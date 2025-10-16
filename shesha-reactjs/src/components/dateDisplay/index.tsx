import React, { FC } from 'react';
import { Tooltip } from 'antd';
import moment from 'moment';
import { tolocalIsoDate } from '@/utils/date';
import { TooltipPlacement } from 'antd/lib/tooltip';

export interface IDateDisplayProps {
  /**
   * @deprecated - use children instead
   */
  date?: string;
  format?: string;
  children?: string;
  showTooltip?: boolean;
  dateAgo?: boolean;
  tooltipPlacement?: TooltipPlacement;
}

export const DateDisplay: FC<IDateDisplayProps> = ({
  dateAgo,
  date,
  children,
  showTooltip,
  format = 'lll',
  tooltipPlacement = 'top',
}) => {
  const dateString = tolocalIsoDate(children || date);

  const getDate = (): JSX.Element =>
    dateAgo ? <span>{moment(dateString).fromNow()}</span> : <span>{moment(dateString).format(format)}</span>;

  if (showTooltip) {
    return (
      <Tooltip placement={tooltipPlacement} title={moment(dateString).format(format)}>
        {getDate()}
      </Tooltip>
    );
  }

  return getDate();
};

export default DateDisplay;
