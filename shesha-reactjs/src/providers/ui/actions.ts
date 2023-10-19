import { createAction } from 'redux-actions';
import { ControlSize, IUiStateContext } from './contexts';

export enum UiActionEnums {
  SetControlsSize = 'SET_CONTROLS_SIZE',
  ToggleModalInvisible = 'TOGGLE_MODAL_INVISIBLE',
  ToggleRoleAppointmentVisible = 'TOGGLE_ROLE_APPOINTMENT_VISIBLE',
  TogglePersonPickerVisible = 'TOGGLE_PERSON_PICKER_VISIBLE',
  /* NEW_ACTION_TYPE_GOES_HERE */
}

export const setControlsSizeAction = createAction<IUiStateContext, ControlSize>(
  UiActionEnums.SetControlsSize,
  (size) => ({
    size,
  })
);

export const toggleModalInvisibleAction = createAction<IUiStateContext>(UiActionEnums.ToggleModalInvisible, () => ({
  isFinalizeApplicationStatusVisible: false,
  isManualVerReasonVisible: false,
  isApplicationCommentVisible: false,
  isRoleAppointmentVisible: false,
}));

export const toggleRoleAppointmentVisibleAction = createAction<IUiStateContext, boolean>(
  UiActionEnums.ToggleRoleAppointmentVisible,
  (isRoleAppointmentVisible) => ({ isRoleAppointmentVisible })
);

export const togglePersonPickerVisibleAction = createAction<IUiStateContext, boolean>(
  UiActionEnums.TogglePersonPickerVisible,
  (isPersonPickerVisible) => ({ isPersonPickerVisible })
);

/* NEW_ACTION_GOES_HERE */
