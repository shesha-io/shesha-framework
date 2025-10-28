import { IConfigurableActionConfiguration, IConfigurableFormComponent } from "@/index";
import { ICalendarLayersProps } from "@/providers/layersProvider/models";
import { View } from 'react-big-calendar';

export interface ICalendarProps extends IConfigurableFormComponent {
    styles: React.CSSProperties;
    items?: ICalendarLayersProps[];
    startDate?: string;
    externalStartDate?: string;
    endDate?: string;
    externalEndDate?: string;
    minDate?: string;
    maxDate?: string;
    displayPeriod?: View[];
    onSlotClick?: IConfigurableActionConfiguration;
    onViewChange?: IConfigurableActionConfiguration;
    dummyEventColor?: string;
}
