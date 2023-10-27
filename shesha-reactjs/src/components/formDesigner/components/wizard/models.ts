import { IConfigurableItemBase } from '../../../../providers/itemListConfigurator/contexts';
import { IConfigurableFormComponent } from '../../../../interfaces';
import { IConfigurableActionConfiguration } from '../../../../interfaces/configurableAction';
import { StepProps } from 'antd';

//type ButtonActionType = 'executeScript' | 'dispatchAnEvent';

export interface IWizardStepProps extends IConfigurableItemBase {
  id: string;
  icon?: string;
  key: string;
  title: string;
  subTitle: string;
  description: string;
  allowCancel?: boolean;

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
  status?: StepProps['status'];

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
  finshed?: string;
  active?: string;
  pending?: string;
}

export interface IStepProps extends StepProps {
  content?: JSX.Element;
}

export interface IWizardComponentProps extends Omit<IConfigurableFormComponent, 'size'>, Pick<StepProps, 'status'> {
  steps: IWizardStepProps[];
  wizardType?: 'default' | 'navigation';
  visibility?: 'Yes' | 'No' | 'Removed';
  //uniqueStateId?: string;
  permissions?: string[];
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
}
