import { FormMarkup } from '@/providers/form/models';
import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import wizardNextArgumentsJson from './wizard-next-arguments.json';
import wizardBackArgumentsJson from './wizard-back-arguments.json';
import wizardDoneArgumentsJson from './wizard-done-arguments.json';
import wizardCancelArgumentsJson from './wizard-cancel-arguments.json';

export interface IWizardNextActionArguments {
  nextButtonText?: string;
  nextButtonCustomEnabled?: string;
  beforeNextActionConfiguration?: IConfigurableActionConfiguration;
  afterNextActionConfiguration?: IConfigurableActionConfiguration;
}

export interface IWizardBackActionArguments {
  backButtonText?: string;
  backButtonCustomEnabled?: string;
  beforeBackActionConfiguration?: IConfigurableActionConfiguration;
  afterBackActionConfiguration?: IConfigurableActionConfiguration;
}

export interface IWizardDoneActionArguments {
  doneButtonText?: string;
  doneButtonCustomEnabled?: string;
  beforeDoneActionConfiguration?: IConfigurableActionConfiguration;
  afterDoneActionConfiguration?: IConfigurableActionConfiguration;
}

export interface IWizardCancelActionArguments {
  cancelButtonText?: string;
  cancelButtonCustomEnabled?: string;
  beforeCancelActionConfiguration?: IConfigurableActionConfiguration;
  afterCancelActionConfiguration?: IConfigurableActionConfiguration;
}

export const wizardNextArgumentsForm = wizardNextArgumentsJson as any as FormMarkup;
export const wizardBackArgumentsForm = wizardBackArgumentsJson as any as FormMarkup;
export const wizardDoneArgumentsForm = wizardDoneArgumentsJson as any as FormMarkup;
export const wizardCancelArgumentsForm = wizardCancelArgumentsJson as any as FormMarkup;
