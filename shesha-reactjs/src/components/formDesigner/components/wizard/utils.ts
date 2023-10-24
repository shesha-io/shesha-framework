import { IWizardSequence } from './models';

export const EXPOSED_VARIABLES = [
  {
    name: 'data',
    description: 'The form data',
    type: 'object',
  },
  { name: 'formMode', description: 'The form mode', type: "'readonly' | 'edit' | 'designer'" },
  {
    name: 'globalState',
    description: 'The global state of the application',
    type: 'object',
  },
  {
    name: 'http',
    description: 'axios instance used to make http requests',
    type: 'object',
  },
  {
    name: 'message',
    description:
      'This is the Ant API for displaying toast messages. See: https://ant.design/components/message/#header',
    type: 'object',
  },
  {
    name: 'setGlobalState',
    description: 'Setting the global state of the application',
    type: '(payload: { key: string, data: any } ) => void',
  },
  ,
  {
    name: 'moment',
    description: 'The moment.js object',
    type: 'object',
  },
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
          return sequence?.finshed || '';

        default:
          return sequence?.finshed || '';
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
