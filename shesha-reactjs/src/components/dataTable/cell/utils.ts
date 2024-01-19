import { IComponentMetadata } from '@/providers';
import { IComponentWrapperProps, ICrudOptions, ITableCrudOptions } from './interfaces';
 
export const adjustWidth = (currentWidth: { minWidth: number; maxWidth: number }, crudOptions: ICrudOptions) => {
  const { canDoubleWidth, canDivideWidth, canTripleWidth, canDivideByThreeWidth } = crudOptions;
  if (canDoubleWidth && canDivideByThreeWidth) {
    if (currentWidth.minWidth % 3 == 0) {
      currentWidth.minWidth = (currentWidth.minWidth / 3) * 2;
      currentWidth.maxWidth = (currentWidth.maxWidth / 3) * 2;
    }
  } else if (canDivideWidth && canTripleWidth) {
    if (currentWidth.minWidth % 2 == 0) {
      currentWidth.minWidth = (currentWidth.minWidth / 2) * 3;
      currentWidth.maxWidth = (currentWidth.maxWidth / 2) * 3;
    }
  } else if (canDoubleWidth) {
    currentWidth.minWidth *= 2;
    currentWidth.maxWidth *= 2;
  } else if (canDivideWidth) {
    currentWidth.minWidth /= 2;
    currentWidth.maxWidth /= 2;
  } else if (canTripleWidth) {
    currentWidth.minWidth *= 3;
    currentWidth.maxWidth *= 3;
  } else if (canDivideByThreeWidth) {
    currentWidth.minWidth /= 3;
    currentWidth.maxWidth /= 3;
  }
 
  return currentWidth;
};
 
export const asNumber = (value: any): number => {
  return typeof value === 'number' ? value : null;
};
 
function change(changes: Object) {
  return Object.values(changes).some((value) => value === true);
}
 
export const getInjectables = ({ defaultRow, defaultValue }: IComponentWrapperProps) => {
  let result: IComponentMetadata = {};
 
  /** Adds injectedTableRow to result if applicable **/
  if (defaultRow) result = { ...result, injectedTableRow: defaultRow };
 
  /** Adds injectedDefaultValue to result if applicable **/
  if (defaultValue) result = { ...result, injectedDefaultValue: defaultValue };
 
  return result;
};
 
const getWidthMultiplier = ({ canEdit, canAdd, canDelete, inlineEditMode }: ITableCrudOptions) => {
  if (canEdit && canDelete && inlineEditMode === 'all-at-once') {
    return 3;
  } else if (canEdit || canAdd) {
    return 2;
  }
  return 1;
};
 
export const getCruadActionConditions = (
  currentOptions: ITableCrudOptions,
  prevCrudOptions: ITableCrudOptions
): ICrudOptions => {
  let canDoubleWidth = false;
  let canDivideWidth = false;
  let canTripleWidth = false;
  let canDivideByThreeWidth = false;
 
  const { canAdd, canEdit, canDelete, inlineEditMode, formMode } = currentOptions;
 
  const {
    canAdd: prevAdd,
    canEdit: prevEdit,
    canDelete: prevDelete,
    inlineEditMode: prevInLineEdit,
    formMode: prevFormMode,
  } = prevCrudOptions || {};
 
  const changes = {
    add: prevAdd !== canAdd,
    edit: prevEdit !== canEdit,
    delete: prevDelete !== canDelete,
    inlineEditMode: prevInLineEdit !== inlineEditMode,
    formMode: prevFormMode !== formMode,
  };
 
  const yesToNo = {
    add: prevAdd === true && canAdd === false,
    edit: prevEdit === true && canEdit === false,
    delete: prevDelete === true && canDelete === false,
    inlineEditMode: prevInLineEdit === 'all-at-once' && inlineEditMode !== 'all-at-once',
    formMode: prevFormMode === 'edit' && formMode !== 'edit',
  };
 
  const isAllAtOnce = inlineEditMode === 'all-at-once';
 
  const isMoreCrudChanges = Object.values(changes).filter((value) => value === true).length > 1;
 
  // In readonly mode or form designer loading
  if (!change(changes) || isMoreCrudChanges) {
    if (changes.formMode) {
      const prevWidthMultiplier = prevCrudOptions && getWidthMultiplier(prevCrudOptions);
      const currentWidthMultiplier =currentOptions && getWidthMultiplier(currentOptions);
 
      if (prevWidthMultiplier === 3) {
        if  (currentWidthMultiplier === 2) {
          canDoubleWidth = true;
          canDivideByThreeWidth = true;
        }else if(currentWidthMultiplier === 1){
          canDivideByThreeWidth = true;
        }
      } else if (prevWidthMultiplier === 2) {
        if (currentWidthMultiplier=== 3) {
          canTripleWidth = true;
          canDivideWidth = true;
        }else if(currentWidthMultiplier === 1){
          canDivideWidth = true;
        }
      } else {
        if (canEdit && isAllAtOnce && canDelete) {
          canTripleWidth = true;
        } else if (canEdit || canAdd) {
          canDoubleWidth = true;
        }
      }
    } else {
      if (canEdit && isAllAtOnce && canDelete) {
        canTripleWidth = true;
      } else if (canEdit || canAdd) {
        canDoubleWidth = true;
      }
    }
  } else {
    //Edit change
    if (changes?.edit) {
      if (!yesToNo.edit) {
        if (isAllAtOnce) {
          if (canDelete && !canAdd) {
            canTripleWidth = true;
          } else if (!canAdd) {
            canDoubleWidth = true;
          } else if (canAdd && canDelete) {
            canDivideWidth = true;
            canTripleWidth = true;
          }
        } else {
          if (!canAdd) {
            canDoubleWidth = true;
          }
        }
      } else if (yesToNo.edit) {
        if (isAllAtOnce) {
          if (canDelete && canAdd) {
            canDivideByThreeWidth = true;
            canDoubleWidth = true;
          } else if (!canAdd && canDelete) {
            canDivideByThreeWidth = true;
          }else if(!canDelete && !canAdd){
            canDivideWidth = true;
          }
        } else {
          if (!canAdd) {
            canDivideWidth = true;
          }
      }

    }
 
    }
 
    //Delete change
    if (changes?.delete) {
      if (!yesToNo?.delete) {
        if (canEdit) {
          if (isAllAtOnce) {
            canDivideWidth = true;
            canTripleWidth = true;
          }
        }
      } else if (yesToNo?.delete) {
        if (canEdit) {
          if (isAllAtOnce) {
            canDivideByThreeWidth = true;
            canDoubleWidth = true;
          }
        }
      }
    }
 
    //Add change
    if (changes?.add) {
      if (!canEdit) {
        if (!yesToNo?.add) {
          canDoubleWidth = true;
        } else {
          canDivideWidth = true;
        }
      }
    }
 
    //Edit mode change
    if (changes?.inlineEditMode && canEdit) {
      if (!yesToNo?.inlineEditMode) {
        if (canDelete) {
          canDivideWidth = true;
          canTripleWidth = true;
        }
      } else if (yesToNo?.inlineEditMode) {
        if (canDelete) {
          canDivideByThreeWidth = true;
          canDoubleWidth = true;
        }
      }
    }
  }
 
  return {
    canDoubleWidth,
    canDivideWidth,
    canTripleWidth,
    canDivideByThreeWidth,
  };
};