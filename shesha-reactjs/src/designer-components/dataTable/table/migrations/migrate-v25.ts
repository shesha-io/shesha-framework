import { ITableComponentProps } from "../models";
import { SettingsMigrationContext } from "@/interfaces";
import { defaultStyles } from "../utils";

export const migrateV24toV25 = (props: ITableComponentProps, _context: SettingsMigrationContext): ITableComponentProps => {
  const defaults = defaultStyles();
  const result = { ...props };

  const devices = ['desktop', 'mobile', 'tablet'] as const;

  devices.forEach((device) => {
    if (!result[device]) {
      result[device] = {};
    }

    // Font defaults
    if (result[device].font) {
      result[device].font = {
        type: result[device].font.type ?? defaults.font.type,
        size: result[device].font.size ?? defaults.font.size,
        weight: result[device].font.weight ?? defaults.font.weight,
        color: result[device].font.color ?? defaults.font.color,
        align: result[device].font.align ?? defaults.font.align,
      };
    } else {
      result[device].font = { ...defaults.font };
    }

    // Dimensions defaults
    if (result[device].dimensions) {
      result[device].dimensions = {
        width: result[device].dimensions.width ?? defaults.dimensions.width,
        height: result[device].dimensions.height ?? defaults.dimensions.height,
        minWidth: result[device].dimensions.minWidth ?? defaults.dimensions.minWidth,
        maxWidth: result[device].dimensions.maxWidth ?? defaults.dimensions.maxWidth,
        minHeight: result[device].dimensions.minHeight ?? defaults.dimensions.minHeight,
        maxHeight: result[device].dimensions.maxHeight ?? defaults.dimensions.maxHeight,
      };
    } else {
      result[device].dimensions = { ...defaults.dimensions };
    }

    // Background defaults
    if (result[device].background) {
      result[device].background = {
        type: result[device].background.type ?? defaults.background.type,
        color: result[device].background.color ?? defaults.background.color,
      };
    } else {
      result[device].background = { ...defaults.background };
    }

    // Shadow defaults
    if (result[device].shadow) {
      result[device].shadow = {
        offsetX: result[device].shadow.offsetX ?? defaults.shadow.offsetX,
        offsetY: result[device].shadow.offsetY ?? defaults.shadow.offsetY,
        blurRadius: result[device].shadow.blurRadius ?? defaults.shadow.blurRadius,
        spreadRadius: result[device].shadow.spreadRadius ?? defaults.shadow.spreadRadius,
        color: result[device].shadow.color ?? defaults.shadow.color,
      };
    } else {
      result[device].shadow = { ...defaults.shadow };
    }
  });

  // Top-level header font defaults
  if (!result.headerFont) {
    result.headerFont = {};
  }
  result.headerFont = {
    type: result.headerFont.type ?? 'Segoe UI',
    size: result.headerFont.size ?? 14,
    weight: result.headerFont.weight ?? '500',
    color: result.headerFont.color,
    align: result.headerFont.align ?? 'left',
  };

  // Row padding defaults (if not already set by previous migrations)
  result.rowPaddingTop ??= '8px';
  result.rowPaddingRight ??= '12px';
  result.rowPaddingBottom ??= '8px';
  result.rowPaddingLeft ??= '12px';

  // Fix hoverHighlight default - migration v20 set it to true, but new default is false
  result.hoverHighlight = true;

  return result;
};
