import { migrateNavigateAction } from "@/designer-components/_common-migrations/migrate-navigate-action";
import { IWizardComponentProps } from "../models";

export const migrateWizardActions = (props: IWizardComponentProps): IWizardComponentProps => {
  const steps = (props.steps ?? []).map((step) => {
    return {
      ...step,
      cancelButtonActionConfiguration: migrateNavigateAction(step.cancelButtonActionConfiguration),
      nextButtonActionConfiguration: migrateNavigateAction(step.nextButtonActionConfiguration),
      backButtonActionConfiguration: migrateNavigateAction(step.backButtonActionConfiguration),
      doneButtonActionConfiguration: migrateNavigateAction(step.doneButtonActionConfiguration),
      onBeforeRenderActionConfiguration: migrateNavigateAction(step.onBeforeRenderActionConfiguration),
      beforeNextActionConfiguration: migrateNavigateAction(step.beforeNextActionConfiguration),
      afterNextActionConfiguration: migrateNavigateAction(step.afterNextActionConfiguration),
      beforeBackActionConfiguration: migrateNavigateAction(step.beforeBackActionConfiguration),
      afterBackActionConfiguration: migrateNavigateAction(step.afterBackActionConfiguration),
      beforeCancelActionConfiguration: migrateNavigateAction(step.beforeCancelActionConfiguration),
      afterCancelActionConfiguration: migrateNavigateAction(step.afterCancelActionConfiguration),
      beforeDoneActionConfiguration: migrateNavigateAction(step.beforeDoneActionConfiguration),
      afterDoneActionConfiguration: migrateNavigateAction(step.afterDoneActionConfiguration),
    };
  });

  return { ...props, steps: steps };
};
