import { IPropertyMetadata } from '@/interfaces/metadata';
import { FormIdentifier } from '@/providers';

export interface EntityReferenceState {
  formIdentifier: FormIdentifier | null;
  properties: IPropertyMetadata[];
  displayText: string;
  loading: {
    formId: boolean;
    metadata: boolean;
    entityData: boolean;
  };
  error: {
    formId: string | null;
    metadata: string | null;
    entityData: string | null;
  };
  initialized: boolean;
}

export type EntityReferenceAction =
  | { type: 'SET_FORM_IDENTIFIER'; payload: FormIdentifier | null } |
  { type: 'SET_PROPERTIES'; payload: IPropertyMetadata[] } |
  { type: 'SET_DISPLAY_TEXT'; payload: string } |
  { type: 'SET_LOADING'; payload: { key: keyof EntityReferenceState['loading']; value: boolean } } |
  { type: 'SET_ERROR'; payload: { key: keyof EntityReferenceState['error']; value: string | null } } |
  { type: 'SET_INITIALIZED'; payload: boolean } |
  { type: 'RESET_STATE' } |
  { type: 'CLEAR_ERRORS' };

export const initialState: EntityReferenceState = {
  formIdentifier: null,
  properties: [],
  displayText: '',
  loading: {
    formId: false,
    metadata: false,
    entityData: false,
  },
  error: {
    formId: null,
    metadata: null,
    entityData: null,
  },
  initialized: false,
};

export const entityReferenceReducer = (
  state: EntityReferenceState,
  action: EntityReferenceAction,
): EntityReferenceState => {
  switch (action.type) {
    case 'SET_FORM_IDENTIFIER':
      return {
        ...state,
        formIdentifier: action.payload,
      };

    case 'SET_PROPERTIES':
      return {
        ...state,
        properties: action.payload,
      };

    case 'SET_DISPLAY_TEXT':
      return {
        ...state,
        displayText: action.payload,
      };

    case 'SET_LOADING':
      return {
        ...state,
        loading: {
          ...state.loading,
          [action.payload.key]: action.payload.value,
        },
      };

    case 'SET_ERROR':
      return {
        ...state,
        error: {
          ...state.error,
          [action.payload.key]: action.payload.value,
        },
      };

    case 'SET_INITIALIZED':
      return {
        ...state,
        initialized: action.payload,
      };

    case 'RESET_STATE':
      return {
        ...initialState,
      };

    case 'CLEAR_ERRORS':
      return {
        ...state,
        error: {
          formId: null,
          metadata: null,
          entityData: null,
        },
      };

    default:
      return state;
  }
};
