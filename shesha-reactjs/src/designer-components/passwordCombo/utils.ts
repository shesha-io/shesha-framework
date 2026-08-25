import { IConfigurableFormComponent } from '@/interfaces';
import { IStyleValue } from '@/providers/form/models';

export interface IPasswordComponentProps extends IConfigurableFormComponent, IStyleValue {
  placeholder?: string | undefined;
  confirmDescription?: string | undefined;
  confirmPlaceholder?: string | undefined;
  confirmLabel?: string | undefined;
  hideBorder?: boolean | undefined;
  minLength?: number | undefined;
  message?: string | undefined;
  repeatPropertyName?: string | undefined;
}

export const defaultStyles = (): IStyleValue => {
  return {
    background: { type: 'color', color: '#fff' },
    font: {
      weight: '400',
      size: 14,
      color: '#000',
      type: 'Segoe UI',
    },
    border: {
      border: {
        all: {
          width: 1,
          style: 'solid',
          color: '#d9d9d9',
        },
      },
      radius: { all: 8 },
    },
    dimensions: {
      width: '100%',
      height: '32px',
      minHeight: '0px',
      maxHeight: 'auto',
      minWidth: '0px',
      maxWidth: 'auto',
    },
  };
};
