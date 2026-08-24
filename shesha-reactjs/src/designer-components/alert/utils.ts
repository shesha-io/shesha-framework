import { IStyleValue } from "@/providers/form/models";

export const defaultStyles = (): IStyleValue => {
  return {
    shadow: { color: '#000000', offsetX: 0, offsetY: 0, blurRadius: 0, spreadRadius: 0 },
    dimensions: { width: 'auto', height: 'auto', minHeight: '0px', maxHeight: 'none', minWidth: '0px', maxWidth: 'none' },
    stylingBoxJson: { _type: 'styleBox', paddingLeft: '8', paddingBottom: '8', paddingTop: '8', paddingRight: '8', marginLeft: '0', marginBottom: '5', marginTop: '5', marginRight: '0' },
  };
};
