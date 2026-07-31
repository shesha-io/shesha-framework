import { INestedStyleValue, IStyleValue } from "@/providers/form/models";

/**
 * Appearance defaults for an unconfigured dropdown.
 *
 * Includes the nested `tag` set: the migration that used to seed tag styles is guarded by
 * `isNew`, so a freshly dropped component gets its tag appearance from here instead.
 */
export const defaultStyles = (): INestedStyleValue<'tag'> => {
  return {
    tag: defaultTagStyles(),
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
          width: '1px',
          style: 'solid',
          color: '#d9d9d9',
        },
      },
      radius: { all: 8 },
      borderType: 'all',
      radiusType: 'all',
    },
    dimensions: {
      width: '100%',
      height: 'auto',
      minHeight: '32px',
      maxHeight: 'auto',
      minWidth: '0px',
      maxWidth: 'auto',
    },
  };
};

export const defaultTagStyles = (): IStyleValue => {
  return {
    background: { type: 'color', color: '#f0f0f0' },
    font: {
      weight: '400',
      size: 14,
      color: '#000',
      type: 'Segoe UI',
      align: 'center',
    },
    border: {
      border: {
        all: {
          width: '1px',
          style: 'solid',
          color: '#d9d9d9',
        },
      },
      radius: { all: 4 },
      borderType: 'all',
      radiusType: 'all',
    },
    dimensions: {
      width: 'auto',
      height: '22px',
      minHeight: '0px',
      maxHeight: 'auto',
      minWidth: '0px',
      maxWidth: 'auto',
    },

  };
};

export const presetColors = [
  {
    value: 'success',
    label: 'Success',
  },
  {
    value: 'warning',
    label: 'Warning',
  },
  {
    value: 'error',
    label: 'Error',
  },
  {
    value: 'magenta',
    label: 'Magenta',
  },
  {
    value: 'red',
    label: 'Red',
  },
  {
    value: 'orange',
    label: 'Orange',
  },
  {
    value: 'gold',
    label: 'Gold',
  },
  {
    value: 'lime',
    label: 'Lime',
  },
  {
    value: 'green',
    label: 'Green',
  },
  {
    value: 'cyan',
    label: 'Cyan',
  },
  {
    value: 'blue',
    label: 'Blue',
  },
  {
    value: 'geekblue',
    label: 'Geekblue',
  },
  {
    value: 'purple',
    label: 'Purple',
  },
];
