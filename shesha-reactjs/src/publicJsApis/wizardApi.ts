export interface IWizardActions {
  next: () => Promise<void>;
  back: () => void;
  cancel: () => void;
  done: () => Promise<void>;
  setStep: (stepIndex) => void;
  content: (description: string, index: number) => string;
}

export interface IWizardStepProps {
  id: string;
  icon?: string;
  key: string;
  title: string;
  subTitle: string;
  description: string;
  allowCancel?: boolean;
  label?: string;
  name?: string;
  tooltip?: string;
  permissions?: string[];
  childItems?: IWizardStepProps[];
}

export interface IWizardApi {
  api?: IWizardActions;
  current?: number;
  visibleSteps?: IWizardStepProps[];
}
