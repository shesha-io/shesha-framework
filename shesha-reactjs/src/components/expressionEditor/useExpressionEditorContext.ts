import { useMemo } from 'react';
import { ExpressionContext, buildExpressionContextFromPaths } from './index';
import {
  ExpressionContextTree,
  buildExpressionContextFromMetadata,
  mergeExpressionContexts,
} from './contextMetadata';
import { useAsyncMemo } from '@/hooks/useAsyncMemo';
import { useAvailableConstantsMetadata } from '@/utils/metadata/hooks';
import { SheshaConstants } from '@/utils/metadata/standardProperties';
import { useMetadataOrUndefined } from '@/providers/metadata';
import { asPropertiesArray } from '@/interfaces/metadata';

const STANDARD_CONSTANTS = [SheshaConstants.application, SheshaConstants.form];

/**
 * Builds the autocomplete context for the {@link ExpressionEditor} by merging the current
 * form's metadata property paths with the standard application/form constants.
 *
 * Degrades gracefully: when rendered outside a metadata/constants provider the relevant
 * hooks return empty data, so the editor still works with an empty (no-suggestion) context.
 */
export const useExpressionEditorContext = (): ExpressionContext => {
  const availableConstants = useAvailableConstantsMetadata({ standardConstants: STANDARD_CONSTANTS });
  const formMetadata = useMetadataOrUndefined()?.metadata;

  const dataPathContext = useMemo<ExpressionContext>(() => {
    const properties = asPropertiesArray(formMetadata?.properties, []);
    const paths = properties.map((p) => p.path).filter(Boolean);
    return buildExpressionContextFromPaths(paths, { additionalRoots: [] });
  }, [formMetadata]);

  const constantsContext = useAsyncMemo<ExpressionContextTree>(
    () => buildExpressionContextFromMetadata(availableConstants),
    [availableConstants],
    {},
  );

  return useMemo<ExpressionContext>(
    () => mergeExpressionContexts(dataPathContext, constantsContext ?? {}),
    [dataPathContext, constantsContext],
  );
};
