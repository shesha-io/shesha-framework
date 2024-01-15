import { IComponentMetadata } from '@/providers';
import { IComponentWrapperProps, ICrudOptions, IGetCrudProps } from './interfaces';
import { InlineEditMode } from '@shesha/reactjs/dist/components/reactTable/interfaces';

export const adjustWidth = (currentWidth: { minWidth: number; maxWidth: number }, crudOptions: ICrudOptions) => {
  if (crudOptions.canTripeWidth && crudOptions.canDivideWidth) {
    currentWidth.minWidth = (currentWidth.minWidth / 2) * 3;
    currentWidth.maxWidth = (currentWidth.maxWidth / 2) * 3;
  } else if (crudOptions.singleButtonWidth && crudOptions.canDivideWidth) {
    currentWidth.minWidth /= 2;
    currentWidth.maxWidth /= 2;
  } else if (crudOptions.singleButtonWidth && crudOptions.canDivideByThree) {
    currentWidth.minWidth /= 3;
    currentWidth.maxWidth /= 3;
  } else if (crudOptions.canDivideByThree && crudOptions.canDoubleWidth) {
    if (currentWidth.minWidth % 3 == 0) {
      currentWidth.minWidth = (currentWidth.minWidth / 3) * 2;
      currentWidth.maxWidth = (currentWidth.maxWidth / 3) * 2;
    }
  } else if (crudOptions.canTripeWidth) {
    currentWidth.minWidth *= 3;
    currentWidth.maxWidth *= 3;
  } else if (crudOptions.canDoubleWidth) {
    currentWidth.minWidth *= 2;
    currentWidth.maxWidth *= 2;
  } else if (crudOptions.canDivideWidth) {
    if (currentWidth.minWidth % 2 == 0) {
      currentWidth.minWidth /= 2;
      currentWidth.maxWidth /= 2;
    }
  } else if (crudOptions.canDivideByThree) {
    if (currentWidth.minWidth % 3 == 0) {
      currentWidth.minWidth /= 3;
      currentWidth.maxWidth /= 3;
    }
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


export const getCruadActionWidth = (
  currentOptions: ICrudOptions,
  prevCrudOptions: ICrudOptions,
  inlineEditMode: InlineEditMode
): IGetCrudProps => {
  let canDoubleWidth = false;
  let canDivideWidth = false;
  let canTripeWidth = false;
  let canDivideByThree = false;
  let singleButtonWidth = false;

  const { canAdd, canEdit, canDelete } = currentOptions;

  const {
    canAdd: prevAdd,
    canEdit: prevEdit,
    canDelete: prevDelete,
    inlineEditMode: prevInLineEditMode,
  } = prevCrudOptions || {};

  const changes = {
    add: prevAdd !== canAdd,
    edit: prevEdit !== canEdit,
    delete: prevDelete !== canDelete,
    inlineEditMode: prevInLineEditMode !== inlineEditMode,
  };

  const yesToNo = {
    add: prevAdd === true && canAdd === false,
    edit: prevEdit === true && canEdit === false,
    delete: prevDelete === true && canDelete === false,
    inlineEditMode: prevInLineEditMode === 'all-at-once' && inlineEditMode !== 'all-at-once',
  };

  const isEditModeAll = inlineEditMode === 'all-at-once';

  if (changes.edit) {
    const noToYesEdit = !yesToNo.edit;
    if (noToYesEdit) {
      if (isEditModeAll) {
        if (canDelete && canAdd) {
          canDivideWidth = true;
          canTripeWidth = true;
        } else if (!canAdd && canDelete) {
          canTripeWidth = true;
        }
      } else {
        if (!canAdd && canDelete) {
          canDoubleWidth = true;
        }
      }
    } else {
      if (isEditModeAll) {
        if (canDelete && canAdd) {
          canDoubleWidth = true;
          canDivideByThree = true;
        } else if (!canAdd && canDelete) {
          canDivideByThree = true;
        }
      } else {
        if (!canAdd && canDelete) {
          canDivideWidth = true;
          singleButtonWidth = true;
        }
      }
    }
  }

  if (changes.add) {
    const noToYesAdd = !yesToNo.add;
    if (noToYesAdd) {
      if (isEditModeAll) {
        if (!canEdit && canDelete) {
          canDoubleWidth = true;
        }
      } else {
        if (!canEdit && canDelete) {
          canDoubleWidth = true;
        } else if (canEdit && !canDelete) {
          canDoubleWidth = true;
        }
      }
    } else {
      if (isEditModeAll) {
        if (!canEdit && canDelete) {
          canDivideWidth = true;
          singleButtonWidth = true;
        }
      } else {
        if (!canEdit && canDelete) {
          canDivideWidth = true;
          singleButtonWidth = true;
        } else if (canEdit && !canDelete) {
          canDivideWidth = true;
        }
      }
    }
  }

  if (changes.delete) {
    const noToYesDelete = !yesToNo.delete;
    if (noToYesDelete) {
      if (isEditModeAll) {
        if (canEdit) {
          canDivideWidth = true;
          canTripeWidth = true;
        }
      } else {
        if (canEdit && !canAdd) {
          canDoubleWidth = true;
        }
      }
    } else {
      if (isEditModeAll) {
        if (canEdit) {
          canDivideByThree = true;
          canDoubleWidth = true;
        }
      } else {
        if (canEdit && !canAdd) {
          canDivideWidth = true;
        }
      }
    }
  }

  if (changes.inlineEditMode && canEdit) {
    const noToYesInlineEdit = !yesToNo.inlineEditMode;
    if (noToYesInlineEdit) {
      if (canDelete) {
        canDivideWidth = true;
        canTripeWidth = true;
      } else if (!canDelete && !canAdd) {
        canDoubleWidth = true;
      }
    } else {
      if (canDelete) {
        canDoubleWidth = true;
        canDivideByThree = true;
      } else if (!canDelete && !canAdd) {
        canDivideWidth = true;
      }
    }
  }

  if (!change(changes)) {
    // In readonly mode or form designer loading
    if (canEdit && inlineEditMode === 'all-at-once' && canDelete) {
      canTripeWidth = true;
    } else if ((canEdit && (canAdd || canDelete)) || canAdd) {
      canDoubleWidth = true;
    }
  }

  return {
    canDoubleWidth,
    canDivideWidth,
    canTripeWidth,
    canDivideByThree,
    singleButtonWidth,
  };
};