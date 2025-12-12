import { ITableComponentProps } from "../models";
import { SettingsMigrationContext } from "@/interfaces";

/**
 * Migration v18 to v19: Consolidate padding configuration
 *
 * This migration converts the legacy cellPadding text field to the rowStylingBox visual editor format.
 * - Parses cellPadding string values (e.g., "8px 12px" or "8px 12px 8px 12px")
 * - Converts to structured rowStylingBox format with padding object
 * - Only migrates if cellPadding exists and rowStylingBox doesn't
 */
export const migrateV18toV19 = (props: ITableComponentProps, _context: SettingsMigrationContext): ITableComponentProps => {
  // If cellPadding doesn't exist or rowStylingBox already exists, no migration needed
  if (!props.cellPadding || props.rowStylingBox) {
    return props;
  }

  // Parse the cellPadding string (e.g., "8px 12px" or "8px 12px 8px 12px" or "8px")
  const paddingValue = props.cellPadding.trim();
  const parts = paddingValue.split(/\s+/);

  let top: number, right: number, bottom: number, left: number;

  // Parse based on CSS padding shorthand rules
  if (parts.length === 1) {
    // All sides the same: "8px"
    const val = parseFloat(parts[0]);
    top = right = bottom = left = val;
  } else if (parts.length === 2) {
    // top/bottom and left/right: "8px 12px"
    top = bottom = parseFloat(parts[0]);
    right = left = parseFloat(parts[1]);
  } else if (parts.length === 3) {
    // top, left/right, bottom: "8px 12px 4px"
    top = parseFloat(parts[0]);
    right = left = parseFloat(parts[1]);
    bottom = parseFloat(parts[2]);
  } else if (parts.length === 4) {
    // top, right, bottom, left: "8px 12px 4px 16px"
    top = parseFloat(parts[0]);
    right = parseFloat(parts[1]);
    bottom = parseFloat(parts[2]);
    left = parseFloat(parts[3]);
  } else {
    // Invalid format, skip migration
    return props;
  }

  // Create the rowStylingBox structure with nested padding object
  const rowStylingBox = {
    padding: {
      top: top.toString(),
      right: right.toString(),
      bottom: bottom.toString(),
      left: left.toString(),
    },
  };

  // Return props with rowStylingBox set and cellPadding removed
  const { cellPadding, ...restProps } = props;
  return {
    ...restProps,
    rowStylingBox,
  };
};
