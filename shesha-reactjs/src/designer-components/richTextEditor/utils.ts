import { IStyleValue } from "@/providers/form/models";

export const defaultStyles = (): IStyleValue => {
  return {
    dimensions: { width: '100%', height: '500px', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
  };
};
