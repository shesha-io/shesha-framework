import { ITableComponentProps } from "../models";
import { SettingsMigrationContext } from "@/interfaces";

/**
 * Migration v17 to v18: Migrate useMultiselect to selectionMode
 *
 * This migration standardizes selection behavior to match the DataList component pattern.
 * - useMultiselect=true → selectionMode='multiple'
 * - useMultiselect=false → selectionMode='none'
 * - If selectionMode is already set, it takes precedence
 */
export const migrateV17toV18 = (props: ITableComponentProps, _context: SettingsMigrationContext): ITableComponentProps => {
  // If selectionMode is already set, keep it as-is
  if (props.selectionMode !== undefined) {
    return props;
  }

  // Migrate useMultiselect to selectionMode
  if (props.useMultiselect === true) {
    return {
      ...props,
      selectionMode: 'multiple',
    };
  } else if (props.useMultiselect === false) {
    return {
      ...props,
      selectionMode: 'none',
    };
  }

  // Default: if useMultiselect is undefined, don't set selectionMode
  // This allows the runtime default ('none') to take effect
  return props;
};
