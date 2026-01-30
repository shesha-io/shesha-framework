import { IConfigurableFormComponent } from '@/interfaces';
import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { FormInstance, StepProps } from 'antd';

/**
 * Footer container for wizard steps.
 * Stored at wizard level and mapped to steps via stepId.
 */
export interface IStepFooterContainer {
  id: string;
  stepId: string; // Maps this footer to a specific step
  components?: IConfigurableFormComponent[];
}

export interface IWizardStepProps {
  id: string;
  icon?: string;
  key: string;
  title: string;
  subTitle: string;
  description: string;
  allowCancel?: boolean;
  status?: StepProps['status'];

  label?: string;
  name?: string;
  tooltip?: string;

  cancelButtonText?: string;
  nextButtonText?: string;
  backButtonText?: string;
  doneButtonText?: string;

  cancelButtonCustomEnabled?: string;
  nextButtonCustomEnabled?: string;
  backButtonCustomEnabled?: string;
  doneButtonCustomEnabled?: string;

  showBackButton?: boolean;
  showDoneButton?: boolean;

  cancelButtonActionConfiguration?: IConfigurableActionConfiguration;
  nextButtonActionConfiguration?: IConfigurableActionConfiguration;
  backButtonActionConfiguration?: IConfigurableActionConfiguration;
  doneButtonActionConfiguration?: IConfigurableActionConfiguration;

  customVisibility?: string;
  customEnabled?: string;
  permissions?: string[];
  components?: IConfigurableFormComponent[];
  childItems?: IWizardStepProps[];

  onBeforeRenderActionConfiguration?: IConfigurableActionConfiguration;

  beforeNextActionConfiguration?: IConfigurableActionConfiguration;
  afterNextActionConfiguration?: IConfigurableActionConfiguration;

  beforeBackActionConfiguration?: IConfigurableActionConfiguration;
  afterBackActionConfiguration?: IConfigurableActionConfiguration;

  beforeCancelActionConfiguration?: IConfigurableActionConfiguration;
  afterCancelActionConfiguration?: IConfigurableActionConfiguration;

  beforeDoneActionConfiguration?: IConfigurableActionConfiguration;
  afterDoneActionConfiguration?: IConfigurableActionConfiguration;

  customActions?: boolean; // Enable custom footer actions instead of default buttons
}

export interface IWizardSequence {
  finished?: string;
  active?: string;
  pending?: string;
}

export interface IStepProps extends StepProps {
  content?: JSX.Element;
}

export interface IWizardComponentProps extends Omit<IConfigurableFormComponent, 'size'>, Pick<StepProps, 'status'> {
  steps: IWizardStepProps[];
  stepFooters?: IStepFooterContainer[]; // Footer containers mapped to steps by stepId
  wizardType?: 'default' | 'navigation';
  form?: FormInstance<any>;
  hidden?: boolean;
  customVisibility?: string;
  defaultActiveStep?: string;
  defaultActiveValue?: string;
  direction?: 'vertical' | 'horizontal';
  labelPlacement?: 'vertical' | 'horizontal';
  size?: 'default' | 'small';
  buttonsLayout?: 'left' | 'right' | 'spaceBetween';
  showStepStatus?: boolean;
  sequence?: IWizardSequence;
  showBackButton?: boolean;
  showDoneButton?: boolean;
}
