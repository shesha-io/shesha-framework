import { useEffect, useRef } from 'react';
import { IDataTableActionsContext, IDataTableStateContext } from '@/providers/dataTable/contexts';
import { BackendRepositoryType } from '@/providers/dataTable/repository/backendRepository';
import { IModelMetadata } from '@/interfaces/metadata';
import { IConfigurableColumnsProps, IDataColumnsProps } from '@/providers/datatableColumnsConfigurator/models';
import { isDefined, isNullOrWhiteSpace } from '@/utils/nullables';
import { isNonEmptyArray } from '@/utils/array';
import { calculateDefaultColumns } from './utils';

type DataTableStore = IDataTableStateContext & IDataTableActionsContext;

const asDataColumn = (propertyName: string, sortOrder: number): IDataColumnsProps => ({
  id: propertyName,
  caption: propertyName,
  columnType: 'data',
  itemType: 'item',
  sortOrder,
  isVisible: true,
  propertyName,
  accessor: propertyName,
  allowSorting: false,
});

/**
 * Registers the entity's fields as fetch columns for data-context consumers that don't configure
 * their own columns (e.g. Kanban, DataList). Without any registered columns the store fetches only
 * `id`, so those components receive rows with no usable data and render as empty. Columns already
 * provided by another consumer (e.g. a sibling DataTable) are left untouched.
 *
 * `requiredProperties` are appended even when the default set excludes them (e.g. a Kanban grouping
 * on a reference-list property, which the default column calculation filters out).
 */
export const useEnsureFetchColumns = (
  ownerId: string,
  store: DataTableStore | undefined,
  metadata: IModelMetadata | null | undefined,
  requiredProperties: (string | undefined)[] = [],
): void => {
  const doneRef = useRef(false);
  const storeRef = useRef(store);
  useEffect(() => {
    storeRef.current = store;
  }, [store]);

  const requiredKey = requiredProperties.filter((p) => !isNullOrWhiteSpace(p)).join(',');

  useEffect(() => {
    const currentStore = storeRef.current;
    if (doneRef.current || !isDefined(currentStore) || !isDefined(metadata))
      return;
    if (currentStore.getRepository().repositoryType !== BackendRepositoryType)
      return;
    if (isNonEmptyArray(currentStore.configurableColumns)) {
      doneRef.current = true;
      return;
    }

    doneRef.current = true;
    let cancelled = false;
    let settled = false;
    calculateDefaultColumns(metadata)
      .then((columns) => {
        settled = true;
        if (cancelled)
          return;

        const merged: IConfigurableColumnsProps[] = [...columns];
        const existing = new Set(
          columns.map((c) => (c as IDataColumnsProps).propertyName).filter(isDefined),
        );
        requiredKey.split(',').filter((p) => p !== '' && !existing.has(p)).forEach((propertyName) => {
          merged.push(asDataColumn(propertyName, merged.length));
        });

        if (!isNonEmptyArray(merged)) {
          doneRef.current = false; // metadata not ready yet, retry when it changes
          return;
        }
        storeRef.current?.registerConfigurableColumns(ownerId, merged);
      })
      .catch((error) => {
        settled = true;
        doneRef.current = false;
        console.error('Failed to register entity columns for data fetch', error);
      });

    return () => {
      cancelled = true;
      // If the deps changed before the calculation settled, this run never registered its columns;
      // reset so the replacement effect run retries instead of short-circuiting on `doneRef`.
      if (!settled)
        doneRef.current = false;
    };
  }, [metadata, ownerId, requiredKey]);
};
