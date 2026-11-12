import { useMemo, useEffect, useState } from "react";
import { EntityData, GetAllResponse, IGetAllPayload } from "@/interfaces/gql";
import { camelcaseDotNotation } from "@/utils/string";
import { GENERIC_ENTITIES_ENDPOINT } from "@/shesha-constants";
import { getValueByPropertyName, setValueByPropertyName } from "./object";
import { IEntityTypeIdentifier } from "@/providers/sheshaApplication/publicApi/entities/models";
import { getEntityTypeIdentifierQueryParams, isEntityTypeIdentifier, isEntityTypeIdEqual } from "@/providers/metadataDispatcher/entities/utils";
import { IEntityTypeIdentifierQueryParams } from "@/interfaces/metadata";
import { extractAjaxResponse, IAjaxResponse, IEntityReferenceDto } from "@/interfaces";
import { isDefined, isNullOrWhiteSpace } from "./nullables";
import { OwnerEntityReference } from "@/interfaces/entity";
import { useHttpClient } from "@/providers";
import { buildUrl } from "./url";
import { useDeepCompareMemoKeepReference } from "@/hooks/useDeepCompareMemo";

export const isEntityReferenceId = (data: unknown): data is IEntityReferenceDto => {
  if (!isDefined(data) || typeof data !== "object" || Array.isArray(data))
    return false;

  const candidate = data as { id?: unknown; _className?: unknown };
  return typeof candidate.id === "string" && typeof candidate._className === "string";
};

export interface IUseEntityDisplayTextProps {
  entityType: string | IEntityTypeIdentifier | undefined;
  propertyName: string;
  selection?: string | string[] | undefined;
}

interface IGetEntityPayload extends IGetAllPayload, IEntityTypeIdentifierQueryParams {
}

const buildFilterById = (value: string | string[] | undefined): string | undefined => {
  if (!isDefined(value) || value.length === 0) return undefined;

  const ids = Array.isArray(value) ? value : [value];
  const expression = { in: [{ var: 'Id' }, ids] };
  return JSON.stringify(expression);
};

const normalizePropertyName = (propName: string): string => {
  return !propName || propName.startsWith('_') ? propName : camelcaseDotNotation(propName);
};

export interface IEntitySelectionResult {
  rows: EntityData[] | null;
  loading: boolean;
}

/** Result of the last completed request, used to skip re-fetching a selection that is already loaded */
interface ILoadedSelection {
  entityType: string | IEntityTypeIdentifier;
  gqlFields: string;
  /** ids that were requested (not returned), so ids missing on the server don't trigger a re-fetch */
  requestedIds: string[];
  rows: EntityData[];
}

const toIdKey = (id: unknown): string => String(id).toLowerCase();

export const useEntitySelectionData = (props: IUseEntityDisplayTextProps): IEntitySelectionResult => {
  const { propertyName } = props;
  // Compare by content: callers often pass a new array/object on every render (e.g. the form designer),
  // which would otherwise rebuild the request payload and re-fetch the selection in a loop
  const selection = useDeepCompareMemoKeepReference(() => props.selection, [props.selection]);
  const entityType = useDeepCompareMemoKeepReference(() => props.entityType, [props.entityType]);
  const [loaded, setLoaded] = useState<ILoadedSelection | undefined>(undefined);
  // url of the last request that failed: ends the loading state without marking the ids as loaded,
  // so the selection is fetched again when the request changes or the component remounts
  const [failedUrl, setFailedUrl] = useState<string | undefined>(undefined);

  const httpClient = useHttpClient();

  const displayProperty = normalizePropertyName(propertyName) || '_displayName';

  const fields = displayProperty.split('.');
  const gqlFields = fields.join('{') + '}'.repeat(fields.length - 1);

  const selectionIds = useMemo<string[]>(() => {
    if (!isDefined(selection) || selection.length === 0) return [];
    return (Array.isArray(selection) ? selection : [selection]).map(toIdKey);
  }, [selection]);

  // The selection is loaded when the last completed request was for the same entity type and display property
  // and covered every selected id (e.g. an item was removed from a multiple selection)
  const itemsAlreadyLoaded =
    isDefined(loaded) &&
    isDefined(entityType) &&
    isEntityTypeIdEqual(loaded.entityType, entityType) &&
    loaded.gqlFields === gqlFields &&
    selectionIds.every((id) => loaded.requestedIds.includes(id));

  const getValuePayload = useMemo<IGetEntityPayload>(() => ({
    skipCount: 0,
    maxResultCount: 1000,
    ...(isDefined(entityType) ? getEntityTypeIdentifierQueryParams(entityType) : {}),
    properties: `id ${gqlFields}`,
    filter: buildFilterById(selection),
  }), [entityType, selection, gqlFields]);
  const url = useMemo(() => buildUrl(`${GENERIC_ENTITIES_ENDPOINT}/GetAll`, getValuePayload), [getValuePayload]);

  const mustFetch = selectionIds.length > 0 && isDefined(entityType) && !itemsAlreadyLoaded;

  // A new request attempt starts whenever the url changes or a fetch becomes required again (the effect below re-runs).
  // Clear the failure of the previous attempt so a retry of the same url is shown as loading again.
  // Adjusted during render (not in the effect) to avoid an extra render: https://react.dev/learn/you-might-not-need-an-effect#adjusting-some-state-when-a-prop-changes
  const attemptKey = mustFetch ? url : undefined;
  const [lastAttemptKey, setLastAttemptKey] = useState<string | undefined>(attemptKey);
  if (lastAttemptKey !== attemptKey) {
    setLastAttemptKey(attemptKey);
    setFailedUrl(undefined);
  }

  useEffect(() => {
    if (!mustFetch || !isDefined(entityType)) return undefined;

    // the payload changes when the display property or selection changes: drop responses of superseded requests
    let isCurrent = true;
    httpClient.get<IAjaxResponse<GetAllResponse<EntityData>>>(url)
      .then((response) => {
        const rows = extractAjaxResponse(response.data).items;
        if (isCurrent)
          setLoaded({ entityType, gqlFields, requestedIds: selectionIds, rows });
      })
      .catch((error) => {
        console.error('Failed to fetch entities', error);
        if (isCurrent)
          setFailedUrl(url);
      });

    return () => {
      isCurrent = false;
    };
  }, [httpClient, url, mustFetch, entityType, gqlFields, selectionIds]);

  const result = useMemo<EntityData[] | null>(() => {
    if (!isDefined(entityType) || isNullOrWhiteSpace(propertyName) || selectionIds.length === 0) return null;
    if (!itemsAlreadyLoaded || loaded.rows.length === 0) return null;

    return loaded.rows
      .filter((ent) => selectionIds.includes(toIdKey(ent.id)))
      .map<EntityData>((ent) => {
        return setValueByPropertyName({ id: ent.id }, displayProperty, getValueByPropertyName(ent, displayProperty));
      });
  }, [displayProperty, entityType, itemsAlreadyLoaded, loaded, propertyName, selectionIds]);

  return {
    rows: result,
    loading: mustFetch && failedUrl !== url,
  };
};

export const useEntityDisplayText = (props: IUseEntityDisplayTextProps): string | null => {
  const { propertyName } = props;
  const selection = useEntitySelectionData(props);
  const rows = selection.rows;

  const result = useMemo<string | null>(() => {
    if (!rows || !propertyName) return null;

    const result = rows.map((ent) => ent[normalizePropertyName(propertyName)] ?? 'unknown').join(',');
    return result;
  }, [propertyName, rows]);

  return result;
};

/**
 * Returns the value of the 'id' property if the given value is an object with an 'id' property of type string.
 * Otherwise, returns undefined.
 * @param val - The value to check for an 'id' property.
 * @returns The value of the 'id' property if it exists, otherwise undefined.
 */
export const getIdOrUndefined = (val: unknown): string | undefined => {
  if (!isDefined(val))
    return undefined;
  if (typeof val === 'string')
    return !isNullOrWhiteSpace(val) ? val : undefined;
  // note: any object with a string id qualifies, `_className` must not be required here (see isEntityReferenceId),
  // sources like form arguments and query params carry a plain { id } only
  if (typeof val !== 'object' || Array.isArray(val) || !('id' in val))
    return undefined;

  const id = val.id;
  return typeof id === 'string' && !isNullOrWhiteSpace(id) ? id : undefined;
};

/**
 * Returns the value of the '_className' property if the given value is an object with an '_className' property of type string.
 * Otherwise, returns undefined.
 * @param val - The value to check for an '_className' property.
 * @returns The value of the '_className' property if it exists, otherwise undefined.
 */
export const getClassNameOrUndefined = (val: unknown): string | undefined => {
  return isDefined(val) && typeof (val) === 'object' && "_className" in val && typeof (val._className) === 'string'
    ? val._className
    : undefined;
};

/**
 * Validates if an owner reference is valid.
 */
export const isOwnerReferenceValid = (value: OwnerEntityReference): boolean => {
  return !isNullOrWhiteSpace(value.ownerId) &&
    ((typeof (value.ownerType) === 'string' && !isNullOrWhiteSpace(value.ownerType)) || (isEntityTypeIdentifier(value.ownerType) && !isNullOrWhiteSpace(value.ownerType.name) && !isNullOrWhiteSpace(value.ownerType.module)));
};

/**
 * Convert an owner type to a string. To use for internal purposes only e.g. as a cache key
 * @param ownerType owner type. May be unset while the component is being configured in the designer
 * @returns string representation or owher type
 */
export const ownerTypeToString = (ownerType: string | IEntityTypeIdentifier | undefined): string =>
  !isDefined(ownerType)
    ? ""
    : typeof (ownerType) === 'string' ? ownerType : `${ownerType.module}/${ownerType.name}`;
