import { ICalendarEvent, ICalendarLayersProps } from "@/providers/layersProvider/models";
import { NestedPropertyMetadatAccessor } from "./hooks";

export interface IEventComponentProps {
  event: ICalendarEvent;
}

export interface ILayerWithMetadata extends ICalendarLayersProps {
  metadata: NestedPropertyMetadatAccessor;
}
