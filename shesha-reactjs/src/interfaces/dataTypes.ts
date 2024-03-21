/*
export const BaseDataTypes = {
    string: 'string',
    number: 'number',
    integer: 'integer',
    boolean: 'boolean',
    array: 'array',
    object: 'object'
}

export const DataFormats = {
    date: 'date', // full-date (see https://datatracker.ietf.org/doc/html/rfc3339#section-5.6)
    dateTime: 'date-time', // date-time (see https://datatracker.ietf.org/doc/html/rfc3339#section-5.6)
    time: 'time', // full-time (see https://datatracker.ietf.org/doc/html/rfc3339#section-5.6)
    uuid: 'uuid',
    entityReference: 'entity-reference',
    float: 'float',
    double: 'double',
    int32: 'int32',
    int64: 'int64',
    refListValue: 'ref-list-value',
}

export const DataTypes = {
    string: BaseDataTypes.string,
    date: `${BaseDataTypes.string}:${DataFormats.date}`,
    dateTime: `${BaseDataTypes.string}:${DataFormats.dateTime}`,
    time: `${BaseDataTypes.string}:${DataFormats.time}`,
    uuid: `${BaseDataTypes.string}:${DataFormats.uuid}`,
    entityReference: `${BaseDataTypes.string}:${DataFormats.entityReference}`,
    float: `${BaseDataTypes.number}:${DataFormats.float}`,
    double: `${BaseDataTypes.number}:${DataFormats.double}`,
    int32: `${BaseDataTypes.number}:${DataFormats.int32}`,
    int64: `${BaseDataTypes.number}:${DataFormats.int64}`,
    boolean: BaseDataTypes.boolean,
    refListValue: `${BaseDataTypes.number}:${DataFormats.refListValue}`,
    array: BaseDataTypes.array // not used, to be reviewed
}
*/
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
  objectReference: 'object-reference',
  specification: 'specification',
  context: 'context',
  function: 'function',
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
