import { ITableComponentProps } from "../models";
import { SettingsMigrationContext } from "@/interfaces";
import { getTableDefaults } from "../utils";

export const migrateV15toV16 = (props: ITableComponentProps, _context: SettingsMigrationContext): ITableComponentProps => {
  const tableDefaults = getTableDefaults();

  return {
    ...props,
    // Add default values for styling properties if they don't exist
    rowHeight: props.rowHeight ?? tableDefaults.rowHeight,
    rowPadding: props.rowPadding ?? tableDefaults.rowPadding,
    rowBorder: props.rowBorder ?? tableDefaults.rowBorder,
    headerFontSize: props.headerFontSize ?? tableDefaults.headerFontSize,
    headerFontWeight: props.headerFontWeight ?? tableDefaults.headerFontWeight,
  };
};
