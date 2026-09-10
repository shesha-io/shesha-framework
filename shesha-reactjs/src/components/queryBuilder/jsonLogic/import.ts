import { JsonLogicFilter } from '@/interfaces/jsonLogic';
import { createEmptyTree } from '../model/factories';
import { QueryTree } from '../model/types';

/**
 * Loads saved JsonLogic into the model.
 *
 * Deliberately not implemented yet: the renderer is being evaluated on its own first. A saved
 * filter opens as an empty query until the importer lands.
 */
export const importFromJsonLogic = (_logic: JsonLogicFilter | undefined): QueryTree => createEmptyTree();
