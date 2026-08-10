import { IStyleValue } from "@/providers/form/models";

export const defaultStyles = (): IStyleValue => {
  return {
    font: { weight: '400', size: 14, type: 'Segoe UI', align: 'left' },
    dimensions: { width: 'auto', height: 'auto', minHeight: '0px', maxHeight: 'none', minWidth: '0px', maxWidth: 'none' },
    stylingBoxJson: { _type: 'styleBox', paddingLeft: '0', paddingBottom: '0', paddingTop: '0', paddingRight: '0', marginLeft: '0', marginBottom: '0', marginTop: '0', marginRight: '0' },
  };
};
