import { DataTypes } from '@/interfaces/dataTypes';
import { isNullOrWhiteSpace } from '@/utils/nullables';
import { VariableDataTypeResolver } from './types';

interface VarNode {
  var: string;
}

export const isVarNode = (node: unknown): node is VarNode =>
  typeof node === 'object' && node !== null && 'var' in node && typeof (node as VarNode).var === 'string';

/** The one data type shared by every `var` among the siblings, or undefined when they disagree or there are none. */
export const getSiblingDataType = (siblings: unknown[], getVariableDataType: VariableDataTypeResolver | undefined): string | undefined => {
  if (!getVariableDataType) return undefined;
  let dataType: string | undefined;
  for (const sibling of siblings) {
    if (!isVarNode(sibling)) continue;
    const candidate = getVariableDataType(sibling.var);
    if (dataType !== undefined && dataType !== candidate) return undefined;
    dataType = candidate;
  }
  return dataType;
};

/** Coerces a resolved expression value to the type of the property it is compared with. */
export const coerceToDataType = (value: unknown, dataType: string | undefined): unknown => {
  switch (dataType) {
    case DataTypes.number: {
      if (typeof value === 'number') return value;
      if (typeof value === 'string' && !isNullOrWhiteSpace(value)) {
        const parsed = Number(value);
        return Number.isFinite(parsed) ? parsed : null;
      }
      return null;
    }
    case DataTypes.referenceListItem: {
      if (typeof value === 'number') return value;
      if (typeof value === 'string' && /^\s*-?\d+\s*$/.test(value)) return parseInt(value, 10);
      return null;
    }
    case DataTypes.boolean:
      return typeof value === 'string' ? !isNullOrWhiteSpace(value) && value.toLowerCase() === 'true' : Boolean(value);
    default:
      return value;
  }
};
