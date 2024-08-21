export const EXPOSED_VARIABLES = [
  {
    id: 'd430d31c-9360-4b57-96cc-3c322de31e58',
    name: 'value',
    description: 'Item value (if this is rendered in a SubForm)',
    type: 'any',
  },
  {
    id: 'd430d31c-9360-4b57-96cc-3c322de31e57',
    name: 'formMode',
    description: 'Selected form values',
    type: "'edit' | 'readonly' | 'designer'",
  },
  {
    id: 'd430d31c-9360-4b57-96cc-3c322de31e59',
    name: 'data',
    description: 'Selected form values',
    type: 'object',
  },
  {
    id: '5a367dfe-70e4-4521-96ba-bdee1336592a',
    name: 'globalState',
    description: 'The global state of the application',
    type: 'object',
  },
  {
    id: '5a367dfe-70e4-4521-96ba-bdee1336592b',
    name: "form",
    description: "Form instance",
    type: "FormInstance"
  },
  {
    id: '5a367dfe-70e4-4521-96ba-bdee1336592c',
    name: "globalState",
    description: "The global state of the application",
    type: "object"
  },
  {
    id: '5a367dfe-70e4-4521-96ba-bdee1336592d',
    name: "http",
    description: "axios instance used to make http requests",
    type: "object"
  },
  {
    id: '5a367dfe-70e4-4521-96ba-bdee1336592e',
    name: "message",
    description: "This is the Ant API for displaying toast messages. See: https://ant.design/components/message/#header",
    type: "object"
  },
  {
    id: '5a367dfe-70e4-4521-96ba-bdee1336592f',
    name: "setFormData",
    description: "A function used to update the form data",
    type: "({ values: object, mergeValues: boolean}) => void"
  },
  {
    id: '5a367dfe-70e4-4521-96ba-bdee1336592g',
    name: "setGlobalState",
    description: "Setting the global state of the application",
    type: "(payload: { key: string, data: any } ) => void"
  },
   {
    id: '5a367dfe-70e4-4521-96ba-bdee1336592h',
    name: "option",
    description: "Meta data of component current value",
    type: "object"
  },
];
