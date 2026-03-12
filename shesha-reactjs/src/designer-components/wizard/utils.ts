import { findLastIndex } from 'lodash';
import { nanoid } from '@/utils/uuid';
import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { IWizardSequence, IWizardStepProps } from './models';

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

const WIZARD_STEP_STORAGE_PREFIX = 'shesha_wizard_step_';

/**
 * Gets the storage key for a wizard instance
 */
export const getWizardStorageKey = (wizardId: string, componentName?: string): string => {
  const key = componentName ? `${wizardId}:${componentName}` : wizardId;
  return `${WIZARD_STEP_STORAGE_PREFIX}${key}`;
};

/**
 * Saves the current wizard step ID to sessionStorage
 * Using sessionStorage instead of localStorage to automatically clear stale data when browser tab closes
 */
export const saveWizardStep = (wizardId: string, stepId: string, componentName?: string): void => {
  try {
    const key = getWizardStorageKey(wizardId, componentName);
    sessionStorage.setItem(key, stepId);
  } catch (error) {
    console.warn('Failed to save wizard step to sessionStorage:', error);
  }
};

/**
 * Loads the saved wizard step ID from sessionStorage
 * Returns null if no saved step exists
 */
export const loadWizardStep = (wizardId: string, componentName?: string): string | null => {
  try {
    const key = getWizardStorageKey(wizardId, componentName);
    const saved = sessionStorage.getItem(key);
    return saved;
  } catch (error) {
    console.warn('Failed to load wizard step from sessionStorage:', error);
  }
  return null;
};

/**
 * Clears the saved wizard step from sessionStorage
 */
export const clearWizardStep = (wizardId: string, componentName?: string): void => {
  try {
    const key = getWizardStorageKey(wizardId, componentName);
    sessionStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to clear wizard step from sessionStorage:', error);
  }
};
