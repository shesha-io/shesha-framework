import { useCallback, useEffect, useReducer, useRef } from 'react';
import { entitiesGet } from '@/apis/entities';
import { isPropertiesArray } from '@/interfaces/metadata';
import { useConfigurationItemsLoader, useMetadataDispatcher, useSheshaApplication, FormIdentifier } from '@/providers';
import { get } from '@/utils/fetchers';
import { entityReferenceReducer, initialState, EntityReferenceState } from '../state/reducer';

interface UseEntityReferenceDataProps {
  entityType?: string;
  entityId?: string;
  value?: unknown;
  displayProperty: string;
  placeholder?: string;
  getEntityUrl?: string;
  formSelectionMode: 'name' | 'dynamic';
  formIdentifier?: FormIdentifier | null;
  formType?: string;
  entityReferenceType?: string;
}

interface UseEntityReferenceDataReturn extends EntityReferenceState {
  refetchFormId: () => void;
  refetchMetadata: () => void;
  refetchEntityData: () => void;
  isLoading: boolean;
  hasErrors: boolean;
}

export const useEntityReferenceData = (
  props: UseEntityReferenceDataProps,
): UseEntityReferenceDataReturn => {
  const [state, dispatch] = useReducer(entityReferenceReducer, initialState);
  const { getEntityFormIdAsync } = useConfigurationItemsLoader();
  const { backendUrl, httpHeaders } = useSheshaApplication();
  const { getMetadata } = useMetadataDispatcher();

  // Refs to track active requests for cancellation
  const formIdController = useRef<AbortController | null>(null);
  const metadataController = useRef<AbortController | null>(null);
  const entityDataController = useRef<AbortController | null>(null);

  // Cleanup function to abort all active requests
  const cleanup = useCallback(() => {
    if (formIdController.current) {
      formIdController.current.abort();
      formIdController.current = null;
    }
    if (metadataController.current) {
      metadataController.current.abort();
      metadataController.current = null;
    }
    if (entityDataController.current) {
      entityDataController.current.abort();
      entityDataController.current = null;
    }
  }, []);

  // Fetch form ID based on entity type and form type
  const fetchFormId = useCallback(async (): Promise<void> => {
    if (
      props.formSelectionMode !== 'dynamic' ||
      !props.entityType ||
      !props.formType ||
      !props.entityReferenceType
    ) {
      if (formIdController.current) {
        formIdController.current.abort();
        formIdController.current = null;
      }
      return;
    }

    // Cancel previous request
    if (formIdController.current) {
      formIdController.current.abort();
    }

    formIdController.current = new AbortController();
    dispatch({ type: 'SET_LOADING', payload: { key: 'formId', value: true } });
    dispatch({ type: 'SET_ERROR', payload: { key: 'formId', value: null } });

    try {
      const formid = await getEntityFormIdAsync(props.entityType, props.formType, formIdController.current.signal);

      // Check if request was cancelled
      if (formIdController.current?.signal.aborted) {
        return;
      }

      dispatch({
        type: 'SET_FORM_IDENTIFIER',
        payload: { name: formid.name, module: formid.module },
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error fetching form ID:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: { key: 'formId', value: error.message || 'Failed to fetch form ID' },
        });
      } else if (!(error instanceof Error)) {
        console.error('Error fetching form ID:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: { key: 'formId', value: String(error) || 'Failed to fetch form ID' },
        });
      }
    } finally {
      if (!formIdController.current?.signal.aborted) {
        dispatch({ type: 'SET_LOADING', payload: { key: 'formId', value: false } });
      }
      formIdController.current = null;
    }
  }, [props.entityType, props.formType, props.formSelectionMode, props.entityReferenceType, getEntityFormIdAsync]);

  // Fetch metadata based on entity type
  const fetchMetadata = useCallback(async (): Promise<void> => {
    if (!props.entityType) {
      if (metadataController.current) {
        metadataController.current.abort();
        metadataController.current = null;
      }
      return;
    }

    // Cancel previous request
    if (metadataController.current) {
      metadataController.current.abort();
    }

    metadataController.current = new AbortController();
    dispatch({ type: 'SET_LOADING', payload: { key: 'metadata', value: true } });
    dispatch({ type: 'SET_ERROR', payload: { key: 'metadata', value: null } });

    try {
      const res = await getMetadata({ modelType: props.entityType, dataType: null, signal: metadataController.current.signal });

      // Check if request was cancelled
      if (metadataController.current?.signal.aborted) {
        return;
      }

      dispatch({
        type: 'SET_PROPERTIES',
        payload: isPropertiesArray(res?.properties) ? res.properties : [],
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error fetching metadata:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: { key: 'metadata', value: error.message || 'Failed to fetch metadata' },
        });
      } else if (!(error instanceof Error)) {
        console.error('Error fetching metadata:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: { key: 'metadata', value: String(error) || 'Failed to fetch metadata' },
        });
      }
    } finally {
      if (!metadataController.current?.signal.aborted) {
        dispatch({ type: 'SET_LOADING', payload: { key: 'metadata', value: false } });
      }
      metadataController.current = null;
    }
  }, [props.entityType, getMetadata]);

  // Fetch entity data for display
  const fetchEntityData = useCallback(async (): Promise<void> => {
    if (!props.entityId || !props.entityType) {
      // Set display text from existing value or placeholder
      const displayValue = props.value && typeof props.value === 'object' && props.value !== null
        ? (props.value as any)?.[props.displayProperty] || (props.value as any)?._displayName || props.placeholder || ''
        : props.placeholder || '';
      dispatch({ type: 'SET_DISPLAY_TEXT', payload: displayValue });
      dispatch({ type: 'SET_INITIALIZED', payload: true });
      if (entityDataController.current) {
        entityDataController.current.abort();
        entityDataController.current = null;
      }
      return;
    }

    // If we already have a complete value object, use it
    if (props.value && typeof props.value === 'object' && props.value !== null && (props.value as any)[props.displayProperty]) {
      const displayValue = (props.value as any)[props.displayProperty] || (props.value as any)._displayName || '';
      dispatch({ type: 'SET_DISPLAY_TEXT', payload: displayValue });
      dispatch({ type: 'SET_INITIALIZED', payload: true });
      if (entityDataController.current) {
        entityDataController.current.abort();
        entityDataController.current = null;
      }
      return;
    }

    // Cancel previous request
    if (entityDataController.current) {
      entityDataController.current.abort();
    }

    entityDataController.current = new AbortController();
    dispatch({ type: 'SET_LOADING', payload: { key: 'entityData', value: true } });
    dispatch({ type: 'SET_ERROR', payload: { key: 'entityData', value: null } });

    try {
      const queryParams = {
        id: props.entityId,
        properties: `id ${props.displayProperty ? props.displayProperty : ''} _displayName`,
      };

      const fetchPromise = props.getEntityUrl
        ? get(props.getEntityUrl, queryParams, {
          base: backendUrl,
          headers: httpHeaders,
        }, entityDataController.current.signal)
        : entitiesGet({
          ...queryParams,
          entityType: props.entityType,
        }, {
          base: backendUrl,
          headers: httpHeaders,
        }, entityDataController.current.signal);

      const resp = await fetchPromise;

      // Check if request was cancelled
      if (entityDataController.current?.signal.aborted) {
        return;
      }

      // Type guard: Ensure resp.result is a valid object before accessing properties
      let displayValue: string;
      if (resp && typeof resp.result === 'object' && resp.result !== null && !Array.isArray(resp.result)) {
        const result = resp.result;
        displayValue = result[props.displayProperty] ||
          result._displayName ||
          props.placeholder ||
          'No Display Name';
      } else {
        // Fallback when result is not a valid object
        displayValue = props.placeholder || 'No Display Name';
      }

      dispatch({ type: 'SET_DISPLAY_TEXT', payload: displayValue });
      dispatch({ type: 'SET_INITIALIZED', payload: true });
    } catch (error: unknown) {
      if (error instanceof Error && error.name !== 'AbortError') {
        console.error('Error fetching entity data:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: { key: 'entityData', value: error.message || 'Failed to fetch entity data' },
        });
        dispatch({ type: 'SET_INITIALIZED', payload: true });
      } else if (!(error instanceof Error)) {
        console.error('Error fetching entity data:', error);
        dispatch({
          type: 'SET_ERROR',
          payload: { key: 'entityData', value: String(error) || 'Failed to fetch entity data' },
        });
        dispatch({ type: 'SET_INITIALIZED', payload: true });
      }
    } finally {
      if (!entityDataController.current?.signal.aborted) {
        dispatch({ type: 'SET_LOADING', payload: { key: 'entityData', value: false } });
      }
      entityDataController.current = null;
    }
  }, [props.entityId, props.entityType, props.value, props.displayProperty, props.placeholder, props.getEntityUrl, backendUrl, httpHeaders]);

  // Reset state when key props change - runs BEFORE fetch effects
  useEffect(() => {
    cleanup();
    dispatch({ type: 'RESET_STATE' });
  }, [props.entityType, props.entityId, cleanup]);

  // Effect to set initial form identifier
  useEffect(() => {
    if (props.formSelectionMode === 'name' && props.formIdentifier) {
      dispatch({ type: 'SET_FORM_IDENTIFIER', payload: props.formIdentifier });
    }
  }, [props.formIdentifier, props.formSelectionMode]);

  // Effect to fetch form ID when in dynamic mode
  useEffect(() => {
    if (props.formSelectionMode === 'dynamic') {
      fetchFormId();
    }
  }, [fetchFormId]);

  // Effect to fetch metadata
  useEffect(() => {
    fetchMetadata();
  }, [fetchMetadata]);

  // Effect to fetch entity data
  useEffect(() => {
    fetchEntityData();
  }, [fetchEntityData]);

  // Cleanup on unmount
  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const isLoading = state.loading.formId || state.loading.metadata || state.loading.entityData;
  const hasErrors = Boolean(state.error.formId || state.error.metadata || state.error.entityData);

  return {
    ...state,
    refetchFormId: fetchFormId,
    refetchMetadata: fetchMetadata,
    refetchEntityData: fetchEntityData,
    isLoading,
    hasErrors,
  };
};
