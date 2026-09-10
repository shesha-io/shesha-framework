import { QueryField } from '../../catalogue/fields';
import { OperatorDef } from '../../catalogue/operators';
import { ScalarValue } from '../../model/types';

export type EditorValue = ScalarValue | ScalarValue[] | undefined;

export interface EditorProps {
  field: QueryField | undefined;
  operator: OperatorDef | undefined;
  value: EditorValue;
  onChange: (value: EditorValue) => void;
  readOnly: boolean;
  placeholder: string;
}

export const asScalar = (value: EditorValue): ScalarValue | undefined => Array.isArray(value) ? value[0] : value;

export const asList = (value: EditorValue): ScalarValue[] => Array.isArray(value) ? value : (value === undefined || value === null ? [] : [value]);
