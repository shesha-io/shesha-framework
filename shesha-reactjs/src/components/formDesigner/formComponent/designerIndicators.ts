import { IComponentModelProps } from "@/providers";
import { isPropertySettings } from "@/designer-components/_settings/utils/utils";
import { isNonEmptyArray } from "@/utils/array";

/** Which of the designer's "secondary information" indicators a component should show. */
export interface IDesignerIndicators {
  /** Padlock: visibility and/or interaction mode are governed by permissions. */
  showPermissions: boolean;
  /** FX: visibility and/or interaction mode are governed by a code expression. */
  showCustomLogic: boolean;
  /** Crossed-out eye: Visible is switched off outright. */
  showHidden: boolean;
}

/**
 * Works out the indicator set for a component from its *source* model - the configured settings, before
 * code expressions are evaluated - because the designer reports how a component is configured rather
 * than how it would behave for the current user.
 */
export const getDesignerIndicators = (model: IComponentModelProps): IDesignerIndicators => {
  // ToDo: AS - remove `hidden` after migration of all components
  const hiddenFx = (isPropertySettings(model.hidden) && model.hidden._mode === 'code') ||
    (isPropertySettings(model.visible) && model.visible._mode === 'code');
  const editModeFx = isPropertySettings(model.editMode) && model.editMode._mode === 'code';

  const hiddenPs = isNonEmptyArray(model.visiblePermissions);
  const editModePs = isNonEmptyArray(model.editModePermissions);

  const visibleValue = isPropertySettings(model.visible) && model.visible._mode === 'value'
    ? model.visible._value !== false
    : model.visible !== false;
  const hiddenValue = isPropertySettings(model.hidden) && model.hidden._mode === 'value'
    ? model.hidden._value === true
    : model.hidden === true;

  const showHidden = !hiddenFx && (!visibleValue || hiddenValue);

  /**
   * A component whose Visible is switched off is never shown at runtime, so visibility permissions
   * cannot change that outcome and the padlock would only add noise next to the crossed-out eye.
   * Edit-mode permissions still earn a padlock: they say something the eye does not.
   */
  const showPermissions = (hiddenPs && !showHidden) || editModePs;

  return {
    showPermissions,
    showCustomLogic: hiddenFx || editModeFx,
    showHidden,
  };
};
