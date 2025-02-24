import { nanoid } from "@/utils/uuid";
import { ISizableColumnInputProps } from "./interfaces";

export const defaultStyles = (): ISizableColumnInputProps => {
  return {
    dimensions: { width: '100%', height: 'auto', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
    columns: [
      { id: nanoid(), size: 50, components: [] },
      { id: nanoid(), size: 50, components: [] },
    ],
    stylingBox: "{\"marginBottom\":\"5\"}"
  };
};