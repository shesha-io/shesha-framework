import { IStyleValue } from "@/providers/form/models";

export const defaultStyles = (): IStyleValue => {
  return {
    dimensions: {
      width: '100%',
      height: '500px',
      minHeight: 'auto',
      maxHeight: 'auto',
      minWidth: 'auto',
      maxWidth: 'auto',
    },
  };
};
