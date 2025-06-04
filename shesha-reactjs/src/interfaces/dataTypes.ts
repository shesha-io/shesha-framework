export const DataTypes = {
  guid: 'guid',
  string: 'string',
  number: 'number',

  // used only for ModelConfigurator and will be converted to Number + NumberFormat
  float: 'float',
  double: 'double',
  int32: 'int32',
  int64: 'int64',
  decimal: 'decimal',
  // ---

  date: 'date',
  time: 'time',
  dateTime: 'date-time',
  entityReference: 'entity',

  // used only for ModelConfigurator and will be converted to Array + other configs
  multiEntityReference: 'multi-entity',
  childEntityReference: "child-multi-entity",
  //---

  file: 'file',
  referenceListItem: 'reference-list-item',
  boolean: 'boolean',
  array: 'array',
  object: 'object',
  objectReference: 'object-reference',
  geometry: 'geometry',
  listOf: 'external-list',

  specification: 'specification',
  context: 'context',
  function: 'function',
  any: 'any',
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
}