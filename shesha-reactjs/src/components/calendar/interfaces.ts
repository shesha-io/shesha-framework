import { IConfigurableActionConfiguration } from "@/index";

export interface ICalendarEvent {
    id?: string;
    start: Date;
    end: Date;
    title: string;
    icon?: string;
    iconColor?: string;
    showIcon?: boolean;
    color?: string;
    onSelect?: IConfigurableActionConfiguration;
    onDblClick?: IConfigurableActionConfiguration;
    [key: string]: any;
}

export interface IEventComponentProps {
    event: ICalendarEvent;
}