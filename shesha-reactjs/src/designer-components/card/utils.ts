import { IStyleValue } from "@/providers/form/models";

export const defaultStyles = (): IStyleValue => {
  return {
    border: { hideBorder: false, radiusType: 'all', borderType: 'all', border: { all: { width: '1px', style: 'solid', color: '#d9d9d9' } }, radius: { all: 8 } },
    dimensions: { width: 'auto', height: 'fit-content', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
    background: {
      type: 'color',
      color: '#fff',
      repeat: 'no-repeat',
      size: 'cover',
      position: 'center',
      gradient: { direction: 'to right', colors: [] },
      url: '',
    },
    font: { color: '#000', type: 'Segoe UI', align: 'left', size: 14, weight: '400' },
    shadow: { offsetX: 0, offsetY: 0, color: '#000', blurRadius: 0, spreadRadius: 0 },
    stylingBoxJson: { _type: 'styleBox', paddingLeft: '0', paddingBottom: '0', paddingTop: '0', paddingRight: '0', marginLeft: '0', marginBottom: '5', marginTop: '0', marginRight: '0' },
  };
};
