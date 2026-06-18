import { InlineEditMode } from "@/components/reactTable/interfaces";
import { YesNoInheritJs } from "../interfaces";

interface ICrudOptions {
  canEdit?: YesNoInheritJs | undefined;
  canAdd?: YesNoInheritJs | undefined;
  canDelete?: YesNoInheritJs | undefined;
  inlineEditMode?: InlineEditMode | undefined;
}

export const adjustWidth = (crudOptions: ICrudOptions): { maxWidth: number; minWidth: number } => {
  const { canEdit, canAdd, canDelete, inlineEditMode } = crudOptions;

  const isEditEnabled = canEdit === "yes";
  const isAddEnabled = canAdd === "yes";
  const isDeleteEnabled = canDelete === "yes";

  if (inlineEditMode === 'all-at-once' && isDeleteEnabled) {
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

export const asNumber = (value: unknown): number | undefined => {
  return typeof value === 'number' ? value : undefined;
};
