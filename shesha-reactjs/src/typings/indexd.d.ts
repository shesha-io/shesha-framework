declare module 'shesha' {
  export type NumberOrString = number | string;

  export type IncidentFormKeys =
    | 'channels'
    | 'requestTypes'
    | 'address'
    | 'description'
    | 'firstName'
    | 'lastName'
    | 'mobileNumber'
    | 'emailAddress';

  // export type ColumnFilter = [] | string | number | Moment;
}
