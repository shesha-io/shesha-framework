import React from 'react';
import { FieldKind } from '../../catalogue/fields';
import { OperatorDef } from '../../catalogue/operators';
import { BooleanEditor } from './booleanEditor';
import { DateEditor, EntityEditor, ListEditor, NumberEditor, RefListEditor, TextEditor, TimeEditor } from './scalarEditors';
import { EditorProps } from './types';

/** One place that decides which control edits a constant value for a field kind and operator. */
export const resolveValueEditor = (kind: FieldKind | undefined, operator: OperatorDef | undefined): React.FC<EditorProps> => {
  if (operator?.list === true)
    return kind === 'refList' ? RefListEditor : ListEditor;

  switch (kind) {
    case 'number':
      return NumberEditor;
    case 'date':
    case 'datetime':
      return DateEditor;
    case 'time':
      return TimeEditor;
    case 'boolean':
      return BooleanEditor;
    case 'refList':
      return RefListEditor;
    case 'entityReference':
      return EntityEditor;
    default:
      return TextEditor;
  }
};
