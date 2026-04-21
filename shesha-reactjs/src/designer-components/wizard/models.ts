import { IConfigurableFormComponent, IStyleType } from '@/interfaces';
import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { FormInstance, StepsProps } from 'antd';

export interface IStepFooterContainer {
  id: string;
  components?: IConfigurableFormComponent[];
}

export interface IWizardStepProps extends IStyleType {
  id: string;
  icon?: string;
  key: string;
  title: string;
  subTitle: string;
  description: string;
  allowCancel?: boolean;
  status?: StepsProps['status'];

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
  hasCustomFooter?: boolean;

  cancelButtonActionConfiguration?: IConfigurableActionConfiguration;
  nextButtonActionConfiguration?: IConfigurableActionConfiguration;
  backButtonActionConfiguration?: IConfigurableActionConfiguration;
  doneButtonActionConfiguration?: IConfigurableActionConfiguration;

  customVisibility?: string;
  customEnabled?: string;
  permissions?: string[];
  components?: IConfigurableFormComponent[];
  childItems?: IWizardStepProps[];
  stepFooter?: IStepFooterContainer;

  onBeforeRenderActionConfiguration?: IConfigurableActionConfiguration;

  beforeNextActionConfiguration?: IConfigurableActionConfiguration;
  afterNextActionConfiguration?: IConfigurableActionConfiguration;

  beforeBackActionConfiguration?: IConfigurableActionConfiguration;
  afterBackActionConfiguration?: IConfigurableActionConfiguration;

  beforeCancelActionConfiguration?: IConfigurableActionConfiguration;
  afterCancelActionConfiguration?: IConfigurableActionConfiguration;

  beforeDoneActionConfiguration?: IConfigurableActionConfiguration;
  afterDoneActionConfiguration?: IConfigurableActionConfiguration;
}

export interface IWizardSequence {
  finished?: string;
  active?: string;
  pending?: string;
}

type StepItem = NonNullable<StepsProps['items']>[number];

export interface IStepProps extends StepItem {
  bodyContent?: JSX.Element;
}

export interface IWizardComponentProps extends Omit<IConfigurableFormComponent, 'size'>, Pick<StepsProps, 'status'>, Omit<IStyleType, 'size'> {
  steps: IWizardStepProps[];
  wizardType?: 'default' | 'navigation';
  form?: FormInstance<any>;
  hidden?: boolean;
  customVisibility?: string;
  defaultActiveStep?: string;
  defaultActiveValue?: string;
  direction?: 'vertical' | 'horizontal';
  labelPlacement?: 'vertical' | 'horizontal';
  buttonsLayout?: 'left' | 'right' | 'spaceBetween';
  showStepStatus?: boolean;
  sequence?: IWizardSequence;
  primaryTextColor?: React.CSSProperties['color'];
  primaryBgColor?: React.CSSProperties['color'];
  secondaryBgColor?: React.CSSProperties['color'];
  secondaryTextColor?: React.CSSProperties['color'];
  stepWidth?: string;
}
