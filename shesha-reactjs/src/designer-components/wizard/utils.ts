import { findLastIndex } from 'lodash';
import { nanoid } from '@/utils/uuid';
import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { IWizardSequence, IWizardStepProps } from './models';
import { IStyleType } from '@/index';

export const EXPOSED_VARIABLES = [
  { id: nanoid(), name: 'data', description: 'The form data', type: 'object' },
  { id: nanoid(), name: 'formMode', description: 'The form mode', type: "'readonly' | 'edit' | 'designer'" },
  { id: nanoid(), name: 'globalState', description: 'The global state of the application', type: 'object' },
  { id: nanoid(), name: 'http', description: 'axios instance used to make http requests', type: 'object' },
  {
    id: nanoid(),
    name: 'message',
    description:
      'This is the Ant API for displaying toast messages. See: https://ant.design/components/message/#header',
    type: 'object',
  },
  {
    id: nanoid(),
    name: 'setGlobalState',
    description: 'Setting the global state of the application',
    type: '(payload: { key: string, data: any } ) => void',
  },
  { id: nanoid(), name: 'moment', description: 'The moment.js object', type: 'object' },
];

export const getStepDescritpion =
  (show: boolean, sequence: IWizardSequence, currentIndex: number) => (description: string, index: number) => {
    if (show) {
      switch (true) {
        case index === currentIndex:
          return sequence?.active || '';

        case index > currentIndex:
          return sequence?.pending || '';

        case index > currentIndex:
          return sequence?.finished || '';

        default:
          return sequence?.finished || '';
      }
    }

    return description;
  };

export const getWizardButtonStyle =
  (buttonsLayout: 'left' | 'right' | 'spaceBetween') => (type: 'back' | 'cancel' | 'next') => {
    const left = { marginLeft: '8px' };
    const right = { marginRight: '8px' };

    switch (type) {
      case 'back':
        if (buttonsLayout === 'right') {
          return {};
        }

        return right;

      case 'cancel':
        if (buttonsLayout === 'left') {
          return right;
        }

        if (buttonsLayout === 'right') {
          return left;
        }

        return {};

      case 'next':
        if (buttonsLayout === 'left') {
          return {};
        }

        return left;

      default:
        return {};
    }
  };


export const getWizardStep = (steps: IWizardStepProps[], current: number, type: 'back' | 'next' | 'reset') => {
  switch (type) {
    case 'reset':
      return 0;

    case 'next':
      return steps.findIndex((_, index) => index > current);

    case 'back':
      return findLastIndex(steps, (_, index) => index < current);

    default:
      return steps.findIndex((_, index) => index > current);
  }
};

export const isEmptyArgument = (args: IConfigurableActionConfiguration) => {
  if (!args)
    return true;

  const fields = Object.getOwnPropertyNames(args)
    .filter((key) => !['handleSuccess', 'handleFail'].includes(key));
  return fields?.length > 0
    ? fields.some((key) => !args[key])
    : true;
};

export const onAddNewItem = (items) => {
  const count = (items ?? []).length;
  const buttonProps: IWizardStepProps = {
    id: nanoid(),
    name: `step${count + 1}`,
    label: `Step ${count + 1}`,
    key: `stepKey${count + 1}`,
    title: `Step ${count + 1}`,
    subTitle: `Sub title ${count + 1}`,
    description: `Description ${count + 1}`,
    nextButtonText: 'Next',
    backButtonText: 'Back',
    components: [],
    status: undefined,
  };
  return buttonProps;
};


export const defaultStyles = (): IStyleType => {
  return {
    background: { type: 'color', color: '#ffffff00' },
    font: { weight: '400', size: 16, color: '#fff', type: 'Segoe UI' },
    dimensions: { width: 'auto', height: 'auto', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
    border: { hideBorder: true, radiusType: 'all', borderType: 'all', radius: { all: 8 } },
    stylingBox: "{\"marginBottom\":\"5\",\"paddingBottom\":\"16\",\"paddingTop\":\"16\",\"paddingLeft\":\"16\",\"paddingRight\":\"16\"}",
  };
};