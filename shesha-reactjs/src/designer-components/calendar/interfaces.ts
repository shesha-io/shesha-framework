import { IConfigurableActionConfiguration } from "@/interfaces/configurableAction";
import { IConfigurableFormComponent } from "@/providers/form/models";
import { ICalendarLayersProps } from "@/providers/layersProvider/models";
import { View } from 'react-big-calendar';

export interface ICalendarProps extends IConfigurableFormComponent {
  styles?: React.CSSProperties | undefined;
  items?: ICalendarLayersProps[] | undefined;
  startDate?: string | undefined;
  externalStartDate?: string | undefined;
  endDate?: string | undefined;
  externalEndDate?: string | undefined;
  minDate?: string | undefined;
  maxDate?: string | undefined;
  displayPeriod?: View[] | undefined;
  onSlotClick?: IConfigurableActionConfiguration | undefined;
  onViewChange?: IConfigurableActionConfiguration | undefined;
  dummyEventColor?: string | undefined;
  momentLocale?: string | undefined;
}
