import { nanoid } from "@/utils/uuid";
import { IColumnsInputProps } from "./interfaces";

export const defaultStyles = (): IColumnsInputProps => {
    return {
      background: { type: 'color', color: '#fff' },
      dimensions: { width: '100%', height: 'auto', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
      columns: [
        { id: nanoid(), flex: 12, offset: 0, push: 0, pull: 0, components: [] },
        { id: nanoid(), flex: 12, offset: 0, push: 0, pull: 0, components: [] },
      ],
      gutterX: 12,
      gutterY: 12,
      stylingBox: "{\"marginBottom\":\"5\"}"
    };
};