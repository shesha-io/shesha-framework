import { ITableComponentProps } from "../models";
import { SettingsMigrationContext } from "@/interfaces";

/**
 * Migration v25 to v26: Consolidate duplicate cell styling properties
 *
 * This migration addresses duplicate styling properties:
 * - cellTextColor → bodyFontColor (via desktop.font.color)
 * - cellBackgroundColor → rowBackgroundColor
 *
 * The duplicate properties have been deprecated and removed from the settings form.
 * This migration ensures existing configurations are preserved by mapping the old
 * properties to their replacements.
 */
export const migrateV25toV26 = (props: ITableComponentProps, _context: SettingsMigrationContext): ITableComponentProps => {
  const result = { ...props };

  // Migrate cellTextColor to desktop.font.color (bodyFontColor)
  if (result.cellTextColor) {
    // Ensure desktop.font exists
    if (!result.desktop) {
      result.desktop = {};
    }
    if (!result.desktop.font) {
      result.desktop.font = {};
    }

    // Only migrate if desktop.font.color is not already set
    if (!result.desktop.font.color) {
      result.desktop.font.color = result.cellTextColor;
    }

    // Remove the deprecated property
    delete result.cellTextColor;
  }

  // Migrate cellBackgroundColor to rowBackgroundColor
  if (result.cellBackgroundColor && !result.rowBackgroundColor) {
    result.rowBackgroundColor = result.cellBackgroundColor;
    // Remove the deprecated property
    delete result.cellBackgroundColor;
  }

  return result;
};
