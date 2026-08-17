import { IDateSettingsInputProps } from '@/designer-components/settingsInput/interfaces';
import { FCUnwrapped } from '@/providers/form/models';
import { DatePickerWrapper } from '@/designer-components/dateField/datePickerWrapper';

export const DateWrapper: FCUnwrapped<IDateSettingsInputProps> = (props) => {
  const { value, readOnly, propertyName, id, onChange } = props;
  return (
    <DatePickerWrapper
      value={value}
      onChange={onChange}
      readOnly={readOnly}

      type="date"
      id={id ?? ""}
      propertyName={propertyName}
      hideBorder={false}
      range={false}
      selectionType="date"
      defaultToMidnight={false}
      resolveToUTC={false}
      dateFormat={undefined}
      timeFormat={undefined}
      additionalStyles={undefined}
    />
  );
};
