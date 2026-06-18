import { IConfigurableFormComponent, IStyleType } from '@/interfaces';
import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { FormInstance } from 'antd';
import { Steps } from 'antd';
import { ComponentProps } from 'react';

type StepsProps = ComponentProps<typeof Steps>;
type StepProps = Required<StepsProps>['items'][number];
type StepStatus = 'wait' | 'process' | 'finish' | 'error';

export interface IStepFooterContainer {
  id: string;
  components?: IConfigurableFormComponent[];
}

export interface IWizardStepProps extends IStyleType {
  id: string;
  icon?: string | undefined;
  key: string;
  title: string;
  subTitle: string;
  description: string;
  allowCancel?: boolean | undefined;
  status?: StepStatus | undefined;

  label?: string | undefined;
  name?: string | undefined;
  tooltip?: string | undefined;

  cancelButtonText?: string | undefined;
  nextButtonText?: string | undefined;
  backButtonText?: string | undefined;
  doneButtonText?: string | undefined;

  cancelButtonCustomEnabled?: string | undefined;
  nextButtonCustomEnabled?: string | undefined;
  backButtonCustomEnabled?: string | undefined;
  doneButtonCustomEnabled?: string | undefined;

  showBackButton?: boolean | undefined;
  showDoneButton?: boolean | undefined;
  hasCustomFooter?: boolean | undefined;

  cancelButtonActionConfiguration?: IConfigurableActionConfiguration | undefined;
  nextButtonActionConfiguration?: IConfigurableActionConfiguration | undefined;
  backButtonActionConfiguration?: IConfigurableActionConfiguration | undefined;
  doneButtonActionConfiguration?: IConfigurableActionConfiguration | undefined;

  customVisibility?: string | undefined;
  customEnabled?: string | undefined;
  permissions?: string[] | undefined;
  components?: IConfigurableFormComponent[] | undefined;
  childItems?: IWizardStepProps[] | undefined;
  stepFooter?: IStepFooterContainer | undefined;

  onBeforeRenderActionConfiguration?: IConfigurableActionConfiguration | undefined;

  beforeNextActionConfiguration?: IConfigurableActionConfiguration | undefined;
  afterNextActionConfiguration?: IConfigurableActionConfiguration | undefined;

  beforeBackActionConfiguration?: IConfigurableActionConfiguration | undefined;
  afterBackActionConfiguration?: IConfigurableActionConfiguration | undefined;

  beforeCancelActionConfiguration?: IConfigurableActionConfiguration | undefined;
  afterCancelActionConfiguration?: IConfigurableActionConfiguration | undefined;

  beforeDoneActionConfiguration?: IConfigurableActionConfiguration | undefined;
  afterDoneActionConfiguration?: IConfigurableActionConfiguration | undefined;
}

export interface IWizardSequence {
  finished?: string;
  active?: string;
  pending?: string;
}

export interface IStepProps extends StepProps {
  content?: string;
  bodyContent?: React.JSX.Element;
}

export interface IWizardComponentProps extends IConfigurableFormComponent, IStyleType {
  status?: StepStatus | undefined;
  steps: IWizardStepProps[];
  wizardType?: 'default' | 'navigation' | undefined;
  form?: FormInstance | undefined;
  hidden?: boolean | undefined;
  customVisibility?: string | undefined;
  defaultActiveStep?: string | number | undefined;
  defaultActiveValue?: string | undefined;
  direction?: 'vertical' | 'horizontal' | undefined;
  labelPlacement?: 'vertical' | 'horizontal' | undefined;
  buttonsLayout?: 'left' | 'right' | 'spaceBetween' | undefined;
  showStepStatus?: boolean | undefined;
  sequence?: IWizardSequence | undefined;
  primaryTextColor?: React.CSSProperties['color'] | undefined;
  primaryBgColor?: React.CSSProperties['color'] | undefined;
  secondaryBgColor?: React.CSSProperties['color'] | undefined;
  secondaryTextColor?: React.CSSProperties['color'] | undefined;
  stepWidth?: string | undefined;
}
