import { isDefined } from "@/utils/nullables";
import { StyleBoxValue } from "../../providers/form/models";
import { jsonSafeParse } from "@/utils/object";

export const isStyleBoxValue = (value: object | undefined): value is StyleBoxValue => {
  return isDefined(value) && typeof value === 'object' && !Array.isArray(value) &&
    (('_type' in value && value._type === 'styleBox') ||
      'marginTop' in value || 'marginBottom' in value || 'marginLeft' in value || 'marginRight' in value ||
      'paddingTop' in value || 'paddingBottom' in value || 'paddingLeft' in value || 'paddingRight' in value
    );
};

export const getStyleBoxValue = (value: string | StyleBoxValue | undefined | null): StyleBoxValue => {
  if (typeof value === 'string') {
    const parsed = jsonSafeParse<object>(value);
    return isStyleBoxValue(parsed) ? { ...parsed, _type: 'styleBox' } : { _type: 'styleBox' };
  }
  if (isDefined(value) && typeof value === 'object' && isStyleBoxValue(value))
    return { ...value, _type: 'styleBox' };
  return { _type: 'styleBox' };
};
