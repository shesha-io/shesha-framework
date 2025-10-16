export const ArrayFormats = {
  /** Simple values (stored as Json) */
  simple: 'simple',
  /** Referencing entities */
  entityReference: 'entity',
  /** Many to many Entities */
  manyToManyEntities: 'many-entity',
  /** Child Entities (regular Entity but used only as part of parent Entity) */
  childEntities: 'child-entity',
  /** Child objects (any Json object) */
  childObjects: 'object',
  /**  Multi value Reference list item */
  multivalueReferenceList: 'multivalue-reference-list',
};

export const ObjectFormats = {
  object: 'object',
  interface: 'interface',
};

export const StringFormats = {
  singleline: 'singleline',
  multiline: 'multiline',
  html: 'html',
  json: 'json',
  javascript: 'javascript',
  password: 'password',
  emailAddress: 'email',
  phoneNumber: 'phone',
  url: 'url',
};

export const NumberFormats = {
  float: 'float',
  double: 'double',
  int32: 'int32',
  int64: 'int64',
  decimal: 'decimal',
};

export const DataTypes = {
  guid: 'guid',
  string: 'string',
  number: 'number',
  date: 'date',
  time: 'time',
  dateTime: 'date-time',
  entityReference: 'entity',
  file: 'file',
  referenceListItem: 'reference-list-item',
  boolean: 'boolean',
  array: 'array',
  object: 'object',
  geometry: 'geometry',
  advanced: 'advanced',
  specification: 'specification',
  context: 'context',
  function: 'function',
  any: 'any',
  AllowedComponents: (dataType: string, dataFormat: string): string[] => {
    switch (dataType) {
      case DataTypes.string:
        if (dataFormat === StringFormats.multiline || dataFormat === StringFormats.html || dataFormat === StringFormats.javascript || dataFormat === StringFormats.json)
          return ['textArea', 'text'];
        return ['textField', 'text', 'dropdown'];
      case DataTypes.number:
        return ['numberField', 'slider', 'text', 'textField'];
      case DataTypes.date:
      case DataTypes.dateTime:
        return ['dateField', 'text', 'textField'];
      case DataTypes.time:
        return ['timePicker', 'text', 'textField'];
      case DataTypes.boolean:
        return ['switch', 'checkbox', 'text', 'textField'];
      case DataTypes.entityReference:
        return ['autocomplete', 'entityPicker', 'entityReference'];
      case DataTypes.referenceListItem:
        return ['radio', 'dropdown'];
      case DataTypes.file:
        return ['fileUpload'];
      case DataTypes.object:
        return ['subForm'];
      case DataTypes.advanced:
        return [dataFormat];
      case DataTypes.array:
        switch (dataFormat) {
          case ArrayFormats.entityReference:
            return ['autocomplete', 'entityPicker'];
          case ArrayFormats.manyToManyEntities:
            return ['autocomplete', 'entityPicker'];
          case ArrayFormats.childObjects:
            return ['childEntitiesTagGroup'];
          case ArrayFormats.multivalueReferenceList:
            return ['dropdown'];
        }
    }
    return [];
  },
  allowedCompoenentsCode: `
  const allowedComponents = (dataType, dataFormat) => {
    switch (dataType) {
      case 'string': 
        if (dataFormat === 'multiline' || dataFormat === 'html' || dataFormat === 'javascript' || dataFormat === 'json')
          return ['textArea', 'text'];
        return ['textField', 'text', 'dropdown'];
      case 'number':
          return ['numberField', 'slider', 'text', 'textField'];
      case 'date':
      case 'date-time':
        return ['dateField', 'text', 'textField'];
      case 'time':
        return ['timePicker', 'text', 'textField'];
      case 'boolean':
        return ['switch', 'checkbox', 'text', 'textField'];
      case 'entity':
        return ['autocomplete', 'entityPicker', 'entityReference'];
      case 'reference-list-item':
        return ['radio', 'dropdown'];
      case 'file':
        return ['fileUpload'];
      case 'object':
        return ['subForm'];
      case 'advanced':
          return [dataFormat];
      case 'array':
        switch (dataFormat) {
          case 'entity':
            return ['autocomplete','entityPicker'];
          case 'many-entity':
            return ['autocomplete','entityPicker'];
          case 'object':
            return ['childEntitiesTagGroup'];
          case 'multivalue-reference-list':
            return ['dropdown'];
        }
    }
    return [];
  }`,
};
