import { IComponentMetadata } from "@/index";
import { IComponentWrapperProps } from "./interfaces";
import { YesNoInheritJs } from "../interfaces";

interface ICrudOptions {
  canEdit?: YesNoInheritJs;
  canAdd?: YesNoInheritJs;
  canDelete?: YesNoInheritJs;
  inlineEditMode?: 'all-at-once' | 'one-by-one';
}

export const adjustWidth = (crudOptions: ICrudOptions) => {
  const { canEdit, canAdd, canDelete, inlineEditMode } = crudOptions;
  
  const isEditEnabled = canEdit === "yes";
  const isAddEnabled = canAdd === "yes";
  const isDeleteEnabled = canDelete === "yes";

  if (inlineEditMode === 'all-at-once' &&  isDeleteEnabled) {
    return { minWidth: 100, maxWidth: 100 };
  }

  if (inlineEditMode === 'all-at-once' && !isDeleteEnabled) {
    return { minWidth: 90, maxWidth: 90 };
  }
  
  if (isAddEnabled) {
    return { minWidth: 70, maxWidth: 70 };
  }
  
  if (isEditEnabled && isDeleteEnabled) {
    return { minWidth: 70, maxWidth: 70 };
  }

    if (isEditEnabled && !isDeleteEnabled) {
    return { minWidth: 70, maxWidth: 70 };
  }
  
  if (isEditEnabled || isDeleteEnabled) {
    return { minWidth: 35, maxWidth: 35 };
  }
  
  return { minWidth: 0, maxWidth: 0 };
};

export const getInjectables = ({ defaultRow, defaultValue }: IComponentWrapperProps) => {
  let result: IComponentMetadata = {};

  /** Adds injectedTableRow to result if applicable **/
  if (defaultRow) result = { ...result, injectedTableRow: defaultRow };

  /** Adds injectedDefaultValue to result if applicable **/
  if (defaultValue) result = { ...result, injectedDefaultValue: defaultValue };

  return result;
};

export const asNumber = (value: any): number => {
  return typeof value === 'number' ? value : null;
};