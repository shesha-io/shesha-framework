import { useMemo, useRef, useEffect, useState } from "react";
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

export const isEntityReferenceId = (data: unknown): data is IEntityReferenceDto => {
  if (data === null || typeof data !== "object" || Array.isArray(data))
    return false;

  const candidate = data as { id?: unknown; _className?: unknown };
  return typeof candidate.id === "string" && typeof candidate._className === "string";
};

export interface IUseEntityDisplayTextProps {
  entityType: string | IEntityTypeIdentifier;
  propertyName: string;
  selection?: string | string[];
}

interface IGetEntityPayload extends IGetAllPayload, IEntityTypeIdentifierQueryParams {
}

const buildFilterById = (value: string | string[] | undefined): string | undefined => {
  if (!value) return undefined;

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

interface ILoadedSelectionSummary {
  keys: string[];
  entityType: string | IEntityTypeIdentifier;
  propertyName: string;
}

export const useEntitySelectionData = (props: IUseEntityDisplayTextProps): IEntitySelectionResult => {
  const { entityType, propertyName, selection } = props;
  const lastSelection = useRef<ILoadedSelectionSummary>();
  const [fetchedEntities, setFetchedEntities] = useState<EntityData[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const httpClient = useHttpClient();
  const lastSelectionCurrent = lastSelection.current;

  const itemsAlreadyLoaded =
    selection &&
    Array.isArray(selection) &&
    isDefined(lastSelectionCurrent) &&
    isEntityTypeIdEqual(lastSelectionCurrent.entityType, entityType) &&
    lastSelectionCurrent.propertyName === propertyName &&
    !Boolean(selection.find((item) => !lastSelectionCurrent.keys.includes(item)));

  const displayProperty = normalizePropertyName(propertyName) || '_displayName';

  const fields = displayProperty.split('.');
  const gqlFields = fields.join('{') + '}'.repeat(fields.length - 1);

  const getValuePayload = useMemo<IGetEntityPayload>(() => ({
    skipCount: 0,
    maxResultCount: 1000,
    ...getEntityTypeIdentifierQueryParams(entityType),
    properties: `id ${gqlFields}`,
    filter: buildFilterById(selection),
  }), [entityType, selection, gqlFields]);

  const isEmptySelection = !selection || (Array.isArray(selection) && selection.length === 0);
  const mustFetch = !isEmptySelection && entityType && !itemsAlreadyLoaded;

  useEffect(() => {
    if (mustFetch) {
      setIsLoading(true);
      const url = buildUrl(`${GENERIC_ENTITIES_ENDPOINT}/GetAll`, getValuePayload);
      httpClient.get<IAjaxResponse<GetAllResponse<EntityData>>>(url)
        .then((response) => {
          const responseData = extractAjaxResponse(response.data);
          setFetchedEntities(responseData.items);
        })
        .finally(() => {
          setIsLoading(false);
        });
    }
  }, [httpClient, getValuePayload, mustFetch]);

  const result = useMemo<EntityData[] | null>(() => {
    if (!entityType || !propertyName || !selection) return null;
    if (fetchedEntities.length === 0) return null;

    const result = fetchedEntities
      .filter((ent) => !itemsAlreadyLoaded || (Array.isArray(selection) && selection.includes(ent.id.toString())))
      .map<EntityData>((ent) => {
        return setValueByPropertyName({ id: ent.id }, displayProperty, getValueByPropertyName(ent, displayProperty));
      });

    lastSelection.current =
      isLoading === false && selection && Array.isArray(selection)
        ? {
          keys: result.map((e) => e.id.toString()),
          entityType: entityType,
          propertyName: propertyName,
        }
        : undefined;

    return result;
  }, [displayProperty, entityType, itemsAlreadyLoaded, propertyName, selection, isLoading, fetchedEntities]);

  return {
    rows: result,
    loading: isLoading,
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
  return isDefined(val) && typeof (val) === 'object' && "id" in val && typeof (val.id) === 'string' ? val.id : undefined;
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
 * @param ownerType owner type
 * @returns string representation or owher type
 */
export const ownerTypeToString = (ownerType: string | IEntityTypeIdentifier): string => typeof (ownerType) === 'string' ? ownerType : `${ownerType.module}/${ownerType.name}`;
