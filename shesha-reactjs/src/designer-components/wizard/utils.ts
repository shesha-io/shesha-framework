import { findLastIndex } from 'lodash';
import { nanoid } from '@/utils/uuid';
import { IConfigurableActionConfiguration } from '@/interfaces/configurableAction';
import { IWizardSequence, IWizardStepProps } from './models';
import moment from 'moment';

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

// ========== New Wizard State Persistence (Form Data + Step) ==========

const WIZARD_STEP_STORAGE_PREFIX = 'shesha_wizard_step_';


export const getWizardStorageKey = (wizardId: string, componentName?: string): string => {
  const key = componentName ? `${wizardId}:${componentName}` : wizardId;
  return `${WIZARD_STEP_STORAGE_PREFIX}${key}`;
};

export const saveWizardStep = (wizardId: string, stepId: string, componentName?: string): void => {
  try {
    const key = getWizardStorageKey(wizardId, componentName);
    sessionStorage.setItem(key, stepId);
  } catch (error) {
    console.warn('Failed to save wizard step to sessionStorage:', error);
  }
};


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


export const clearWizardStep = (wizardId: string, componentName?: string): void => {
  try {
    const key = getWizardStorageKey(wizardId, componentName);
    sessionStorage.removeItem(key);
  } catch (error) {
    console.warn('Failed to clear wizard step from sessionStorage:', error);
  }
};


export interface IWizardPersistedState {
  stepId: string;              // Current step ID
  formData: unknown;           // Complete form field values
  visitedSteps?: string[];     // Optional: Completed steps tracking
}

const WIZARD_STATE_STORAGE_PREFIX = 'shesha_wizard_state_';

const isWizardPersistedState = (value: unknown): value is IWizardPersistedState => {
  if (typeof value !== 'object' || value === null) return false;

  const state = value as Record<string, unknown>;

  // Validate stepId is a non-empty string
  if (typeof state.stepId !== 'string' || state.stepId === '') return false;

  // Validate formData exists and is an object (not a primitive, null is allowed)
  if (!('formData' in state)) return false;
  if (state.formData !== null && typeof state.formData !== 'object') return false;

  // Validate visitedSteps if present
  if (state.visitedSteps !== undefined) {
    if (!Array.isArray(state.visitedSteps)) return false;
    if (!state.visitedSteps.every((step): step is string => typeof step === 'string')) return false;
  }

  return true;
};

export const getWizardStateStorageKey = (wizardId: string, componentName?: string): string => {
  const key = componentName ? `${wizardId}:${componentName}` : wizardId;
  return `${WIZARD_STATE_STORAGE_PREFIX}${key}`;
};

/**
 * Serialize form data, converting runtime types (moment, Date) to JSON-safe representations
 * with circular reference detection
 */
const serializeFormData = (data: unknown, visited: WeakSet<object> = new WeakSet()): unknown => {
  if (!data) return data;

  // Handle moment objects (check before Date since moment instances are also Date-like)
  if (moment.isMoment(data)) {
    return {
      __shesha_serialized_type: 'moment',
      __shesha_serialized_value: data.toISOString(),
    };
  }

  // Handle native Date objects
  if (data instanceof Date) {
    // Guard against invalid dates (new Date('invalid') creates Invalid Date)
    if (isNaN(data.getTime())) {
      return null;
    }
    return {
      __shesha_serialized_type: 'date',
      __shesha_serialized_value: data.toISOString(),
    };
  }

  // Handle arrays - check for circular references
  if (Array.isArray(data)) {
    if (visited.has(data)) {
      console.warn('Circular reference detected in wizard form data');
      return null; // Return null for circular references
    }
    visited.add(data);
    return data.map(item => serializeFormData(item, visited));
  }

  // Handle objects - check for circular references
  if (typeof data === 'object') {
    if (visited.has(data)) {
      console.warn('Circular reference detected in wizard form data');
      return null; // Return null for circular references
    }
    visited.add(data);

    const result: Record<string, unknown> = {};
    for (const key in data) {
      if (Object.hasOwn(data, key)) {
        result[key] = serializeFormData((data as Record<string, unknown>)[key], visited);
      }
    }
    return result;
  }

  return data;
};

/**
 * Deserialize form data, reconstructing runtime types (moment, Date) from JSON
 * with circular reference detection and validation
 */
const deserializeFormData = (data: unknown, visited: WeakSet<object> = new WeakSet()): unknown => {
  if (!data) return data;

  // Handle serialized type markers
  if (typeof data === 'object') {
    const obj = data as Record<string, unknown>;
    const serializedType = obj.__shesha_serialized_type;
    const serializedValue = obj.__shesha_serialized_value;

    // Handle moment marker objects with validation
    if (serializedType === 'moment' && typeof serializedValue === 'string') {
      const m = moment(serializedValue);
      if (!m.isValid()) {
        console.warn('Invalid moment value in wizard state:', serializedValue);
        return null;
      }
      return m;
    }

    // Handle Date marker objects with validation
    if (serializedType === 'date' && typeof serializedValue === 'string') {
      const date = new Date(serializedValue);
      if (isNaN(date.getTime())) {
        console.warn('Invalid date value in wizard state:', serializedValue);
        return null;
      }
      return date;
    }
  }

  // Handle arrays - check for circular references
  if (Array.isArray(data)) {
    if (visited.has(data)) {
      console.warn('Circular reference detected in wizard state data');
      return null;
    }
    visited.add(data);
    return data.map(item => deserializeFormData(item, visited));
  }

  // Handle objects - check for circular references
  if (typeof data === 'object') {
    if (visited.has(data)) {
      console.warn('Circular reference detected in wizard state data');
      return null;
    }
    visited.add(data);

    const result: Record<string, unknown> = {};
    for (const key in data) {
      if (Object.hasOwn(data, key)) {
        result[key] = deserializeFormData((data as Record<string, unknown>)[key], visited);
      }
    }
    return result;
  }

  return data;
};

export const saveWizardState = (
  wizardId: string,
  stepId: string,
  formData: unknown,
  componentName?: string,
  visitedSteps?: string[]
): void => {
  try {
    // Normalize formData to ensure it's always serialized (undefined -> null)
    const normalizedFormData = formData === undefined ? null : formData;

    // Serialize form data to handle runtime types (moment, Date)
    const serializedFormData = serializeFormData(normalizedFormData);

    const state: IWizardPersistedState = {
      stepId,
      formData: serializedFormData,
      visitedSteps,
    };

    const key = getWizardStateStorageKey(wizardId, componentName);
    sessionStorage.setItem(key, JSON.stringify(state));
  } catch (error) {
    console.warn('Failed to save wizard state to sessionStorage:', error);
  }
};

export const loadWizardState = (
  wizardId: string,
  componentName?: string
): IWizardPersistedState | null => {
  try {
    const key = getWizardStateStorageKey(wizardId, componentName);
    const saved = sessionStorage.getItem(key);

    if (!saved) {
      return null;
    }

    const state: unknown = JSON.parse(saved);

    // Validate state structure
    if (!isWizardPersistedState(state)) {
      console.warn('Invalid wizard state structure. Clearing corrupted data.');
      sessionStorage.removeItem(key);
      return null;
    }

    // Deserialize form data to reconstruct runtime types (moment, Date)
    const deserializedFormData = deserializeFormData(state.formData);

    return {
      ...state,
      formData: deserializedFormData,
    };
  } catch (error) {
    console.warn('Failed to load wizard state from sessionStorage:', error);
    // Try to clear corrupted data
    try {
      const key = getWizardStateStorageKey(wizardId, componentName);
      sessionStorage.removeItem(key);
    } catch (clearError) {
      console.warn('Failed to clear corrupted wizard state:', clearError);
    }
    return null;
  }
};

export const clearWizardState = (wizardId: string, componentName?: string): void => {
  try {
    const stateKey = getWizardStateStorageKey(wizardId, componentName);
    sessionStorage.removeItem(stateKey);
  } catch (error) {
    console.warn('Failed to clear wizard state from sessionStorage:', error);
  }
};
