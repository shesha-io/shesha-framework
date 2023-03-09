import { IConfigurableItemBase } from '../../../../providers/itemListConfigurator/contexts';
import { IConfigurableFormComponent } from '../../../../interfaces';
import { StepProps } from 'antd';

//type ButtonActionType = 'executeScript' | 'dispatchAnEvent';

export interface IWizardStepProps extends IConfigurableItemBase {}

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
  direction?: 'vertical' | 'horizontal';
  labelPlacement?: 'vertical' | 'horizontal';
  size?: 'default' | 'small';
  buttonsLayout?: 'left' | 'right' | 'spaceBetween';
}
