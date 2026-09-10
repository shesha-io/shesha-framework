import { JsonLogicFilter } from '@/interfaces/jsonLogic';
import { QueryTree } from '../model/types';

/**
 * Serialises the model to the JsonLogic the backend parses.
 *
 * Deliberately not implemented yet: the renderer is being evaluated on its own first. Until the
 * serializer lands, edits stay in memory and nothing is written back to the form value.
 */
export const exportToJsonLogic = (_tree: QueryTree): JsonLogicFilter | undefined => undefined;
