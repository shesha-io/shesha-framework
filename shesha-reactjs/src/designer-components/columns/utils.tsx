import { nanoid } from "@/utils/uuid";
import { IColumnsInputProps } from "./interfaces";

export const defaultStyles = (): IColumnsInputProps => {
  return {
    background: { type: 'color', color: '', },
    dimensions: { width: 'auto', height: 'auto', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
    columns: [
      { id: nanoid(), flex: 12, offset: 0, push: 0, pull: 0, components: [] },
      { id: nanoid(), flex: 12, offset: 0, push: 0, pull: 0, components: [] },
    ],
    border: {
      borderType: 'all',
      radiusType: 'all',
      border: {
        all: { width: '0px', color: '#d3d3d3', style: 'solid' },
        bottom: { width: '0px', color: '#d3d3d3', style: 'solid' },
        left: { width: '0px', color: '#d3d3d3', style: 'solid' },
        right: { width: '0px', color: '#d3d3d3', style: 'solid' },
        top: { width: '0px', color: '#d3d3d3', style: 'solid' },
      },
      radius: { all: 0, bottomLeft: 0, bottomRight: 0, topLeft: 0, topRight: 0 },
      hideBorder: false,
    },
    borderRadius: 0,
    gutterX: 12,
    gutterY: 12,
    stylingBox: "{\"marginBottom\":\"5\"}"
  };
};