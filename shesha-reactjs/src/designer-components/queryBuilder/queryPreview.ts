import { useEffect, useMemo, useState } from 'react';
import { useGet } from '@/hooks/useGet';
import { JsonLogicFilter } from '@/interfaces/jsonLogic';
import { isEntityMetadata } from '@/interfaces/metadata';
import { useMetadataOrUndefined } from '@/providers';
import { IEntityTypeIdentifier } from '@/providers/sheshaApplication/publicApi/entities/models';
import { getEntityTypeIdentifierQueryParams } from '@/providers/metadataDispatcher/entities/utils';
import { isDefined } from '@/utils/nullables';
import { isRecord } from '@/utils/object';

export const PREVIEW_DEBOUNCE_MS = 500;

interface EntitiesGetAllQueryParams {
  name?: string;
  module?: string;
  entityType?: string;
  filter?: string;
  maxResultCount?: number;
}

export type QueryPreviewState =
  { status: 'unavailable' } |
  { status: 'waiting' } |
  { status: 'idle' } |
  { status: 'loading' } |
  { status: 'ready'; totalCount: number } |
  { status: 'failed'; error: string };

export const hasRuntimeExpressions = (logic: unknown): boolean => {
  if (Array.isArray(logic)) return logic.some(hasRuntimeExpressions);
  if (!isRecord(logic)) return false;
  return Object.entries(logic).some(([key, args]) => key === 'evaluate' || hasRuntimeExpressions(args));
};

export const extractTotalCount = (data: unknown): number | undefined => {
  if (!isRecord(data)) return undefined;
  const result = isRecord(data['result']) ? data['result'] : data;
  const totalCount = result['totalCount'];
  return typeof totalCount === 'number' ? totalCount : undefined;
};

export const extractPreviewError = (payload: unknown): string => {
  if (isRecord(payload)) {
    const error = payload['error'];
    if (isRecord(error)) {
      const details = error['details'];
      if (typeof details === 'string' && details.trim()) return details.trim();
      const message = error['message'];
      if (typeof message === 'string' && message.trim()) return message.trim();
    }
  }
  if (payload instanceof Error) return payload.message;
  return 'The query could not be checked';
};

interface UseQueryPreviewArgs {
  logic: JsonLogicFilter | undefined;
  enabled: boolean;
  hasErrors: boolean;
}

export const useQueryPreview = ({ logic, enabled, hasErrors }: UseQueryPreviewArgs): QueryPreviewState => {
  const metadata = useMetadataOrUndefined()?.metadata;
  const entityTypeId = useMemo<string | IEntityTypeIdentifier | undefined>(() => {
    if (!isEntityMetadata(metadata) || typeof metadata.entityType !== 'string') return undefined;
    return typeof metadata.entityModule === 'string'
      ? { name: metadata.entityType, module: metadata.entityModule }
      : metadata.entityType;
  }, [metadata]);
  const { refetch } = useGet<unknown, unknown, EntitiesGetAllQueryParams>('/api/services/app/Entities/GetAll', { lazy: true });
  const [requestState, setRequestState] = useState<QueryPreviewState>({ status: 'idle' });
  const logicKey = isDefined(logic) ? JSON.stringify(logic) : '';
  const expressionsPresent = hasRuntimeExpressions(logic);

  useEffect(() => {
    if (!enabled || !isDefined(entityTypeId) || hasErrors || expressionsPresent) return undefined;

    const controller = new AbortController();
    const timer = setTimeout(() => {
      setRequestState({ status: 'loading' });
      const idParams = getEntityTypeIdentifierQueryParams(entityTypeId);
      const queryParams: EntitiesGetAllQueryParams = { maxResultCount: 1 };
      if (isDefined(idParams.name)) queryParams.name = idParams.name;
      if (isDefined(idParams.module)) queryParams.module = idParams.module;
      if (isDefined(idParams.entityType)) queryParams.entityType = idParams.entityType;
      if (logicKey) queryParams.filter = logicKey;
      refetch({ queryParams, signal: controller.signal })
        .then(async (data) => {
          if (controller.signal.aborted) return;
          const totalCount = extractTotalCount(data);
          if (totalCount !== undefined) {
            setRequestState({ status: 'ready', totalCount });
            return;
          }
          const payload: unknown = data instanceof Response ? await data.json().catch(() => undefined) : data;
          setRequestState({ status: 'failed', error: extractPreviewError(payload) });
        })
        .catch((error: unknown) => {
          if (controller.signal.aborted) return;
          setRequestState({ status: 'failed', error: extractPreviewError(error) });
        });
    }, PREVIEW_DEBOUNCE_MS);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [enabled, entityTypeId, hasErrors, expressionsPresent, logicKey, refetch]);

  if (!enabled || !isDefined(entityTypeId)) return { status: 'unavailable' };
  if (expressionsPresent) return { status: 'waiting' };
  return requestState;
};
