import { IDateSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import React, { FC } from 'react';
import { DatePickerWrapper } from '@/designer-components/dateField/datePickerWrapper';

export const DateWrapper: FC<IDateSettingsInputProps> = (props) => {
  const { value, readOnly, propertyName, id, onChange } = props;
  return (
    <DatePickerWrapper
      value={value}
      onChange={onChange}
      readOnly={readOnly}

      type="date"
      id={id}
      propertyName={propertyName}
      hideBorder={false}
      range={false}
      showTime={false}
      showNow={false}
      picker="date"
      defaultToMidnight={false}
      resolveToUTC={false}
      dateFormat={undefined}
      timeFormat={undefined}
      additionalStyles={undefined}
    />
  );
};
