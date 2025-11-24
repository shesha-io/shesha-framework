import { ITableComponentProps } from "../models";
import { SettingsMigrationContext } from "@/interfaces";

export const migrateV12toV13 = (props: ITableComponentProps, _context: SettingsMigrationContext): ITableComponentProps => {
  // Convert old useMultiselect boolean to new selectionMode property
  const hasUseMultiselect = 'useMultiselect' in props;

  if (hasUseMultiselect) {
    const useMultiselect = props.useMultiselect;

    // If useMultiselect was explicitly set
    if (typeof useMultiselect === 'boolean') {
      // If useMultiselect was true, set selectionMode to 'multiple'
      // If useMultiselect was false, set selectionMode to 'single'
      const newSelectionMode = useMultiselect ? 'multiple' : 'single';

      // Remove the old useMultiselect property and set the new selectionMode
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { useMultiselect: removed, ...propsWithoutUseMultiselect } = props;

      return {
        ...propsWithoutUseMultiselect,
        selectionMode: newSelectionMode,
      };
    }
  }

  // If no useMultiselect property exists or it's not a boolean,
  // ensure selectionMode has a default value
  return {
    ...props,
    selectionMode: props.selectionMode || 'none',
  };
};
