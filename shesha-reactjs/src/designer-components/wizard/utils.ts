import { findLastIndex } from 'lodash';
import { nanoid } from '@/utils/uuid';
import { IWizardSequence, IWizardStepProps } from './models';
import { IStyleType } from '@/index';
import { CSSProperties } from 'react';

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

type StepDescriptionGetter = (description: string, index: number) => string;
export const getStepDescritpion =
  (show: boolean, sequence: IWizardSequence, currentIndex: number): StepDescriptionGetter => (description: string, index: number): string => {
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

type ButtonStyleGetter = (type: 'back' | 'cancel' | 'next') => CSSProperties;
export const getWizardButtonStyle =
  (buttonsLayout: 'left' | 'right' | 'spaceBetween'): ButtonStyleGetter => (type: 'back' | 'cancel' | 'next') => {
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


export const getWizardStep = (steps: IWizardStepProps[], current: number, type: 'back' | 'next' | 'reset'): number => {
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

export const onAddNewItem = (items: IWizardStepProps[]): IWizardStepProps => {
  const count = (items ?? []).length;
  const id = nanoid();
  const buttonProps: IWizardStepProps = {
    id: id,
    name: `step${count + 1}`,
    key: id,
    title: `Step ${count + 1}`,
    subTitle: `Sub title ${count + 1}`,
    description: `Description ${count + 1}`,
    nextButtonText: 'Next',
    backButtonText: 'Back',
    showBackButton: true,
    showDoneButton: true,
    components: [],
    status: undefined,
  };
  return buttonProps;
};


export const defaultStyles = (): IStyleType => {
  return {
    background: { type: 'color', color: '' },
    font: { weight: '400', size: 16, color: '#000', type: 'Segoe UI' },
    dimensions: { width: 'auto', height: 'auto', minHeight: '0px', maxHeight: 'auto', minWidth: '0px', maxWidth: 'auto' },
    border: {
      radiusType: 'all',
      borderType: 'all',
      border: {
        all: {
          width: '1px',
          style: 'none',
          color: '#d9d9d9',
        },
      },
      radius: { all: 8 },
    },
    stylingBox: "{\"marginBottom\":\"5\",\"paddingBottom\":\"16\",\"paddingTop\":\"16\",\"paddingLeft\":\"16\",\"paddingRight\":\"16\"}",
  };
};
