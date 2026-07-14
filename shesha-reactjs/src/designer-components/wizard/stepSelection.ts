/**
 * Pure step-selection helpers for the wizard.
 *
 * Kept free of any `@/...` imports (uses structural types only) so the logic can be
 * unit-tested in isolation without loading the wizard's provider graph.
 */

/** Minimal shape needed to resolve a step index - matches IWizardStepProps structurally. */
export interface IStepIdentity {
  id?: string;
}

/** True when `i` is a usable index into `tabs`. */
export const isValidStepIndex = (i: number | undefined, tabs: ReadonlyArray<IStepIdentity>): i is number =>
  typeof (i) === 'number' && i >= 0 && i < tabs.length;

/**
 * Resolve the configured default step: a numeric index, a step id (string), or 0 as a fallback.
 */
export const getDefaultStepIndex = (tabs: ReadonlyArray<IStepIdentity>, i: number | string | undefined): number => {
  if (typeof (i) === 'number' && i >= 0 && tabs.length > i)
    return i;

  if (typeof (i) === 'string') {
    const index = tabs.findIndex((item) => item.id === i);
    if (index > -1)
      return index;
  }

  return 0;
};

/**
 * Whether the wizard should persist its step. Opt-in, and never in the designer or inside a
 * modal (a modal won't reopen on refresh, so a restored step would apply out of context).
 */
export const shouldPersistStep = (
  persistCurrentStep: boolean,
  formMode: string | undefined,
  isInsideModal: boolean,
): boolean => persistCurrentStep && formMode !== 'designer' && !isInsideModal;

/**
 * Pick the step to open on mount: a valid persisted step when persistence is active,
 * otherwise the configured default step.
 */
export const getInitialStepIndex = (
  canPersist: boolean,
  storedStep: number | undefined,
  tabs: ReadonlyArray<IStepIdentity>,
  defaultActiveStep: number | string | undefined,
): number => {
  if (canPersist && isValidStepIndex(storedStep, tabs))
    return storedStep;
  return getDefaultStepIndex(tabs, defaultActiveStep);
};
