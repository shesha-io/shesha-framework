import { IConfigurableFormComponent, IStyleType } from '@/interfaces';
import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { FormInstance, StepProps } from 'antd';

export interface IWizardStepProps extends IStyleType {
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
}

export interface IWizardSequence {
  finished?: string;
  active?: string;
  pending?: string;
}

export interface IStepProps extends StepProps {
  content?: JSX.Element;
}

export interface IWizardComponentProps extends Omit<IConfigurableFormComponent, 'size'>, Pick<StepProps, 'status'>, Omit<IStyleType, 'size'> {
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
}
