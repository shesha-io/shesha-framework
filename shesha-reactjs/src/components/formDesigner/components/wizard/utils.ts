export const EXPOSED_VARIABLES = [
  {
    name: 'data',
    description: 'The form data',
    type: 'object',
  },
  { name: 'formMode', description: 'The form mode', type: "'readonly' | 'edit' | 'designer'" },
  {
    name: 'globalState',
    description: 'The global state of the application',
    type: 'object',
  },
  {
    name: 'http',
    description: 'axios instance used to make http requests',
    type: 'object',
  },
  {
    name: 'message',
    description:
      'This is the Ant API for displaying toast messages. See: https://ant.design/components/message/#header',
    type: 'object',
  },
  {
    name: 'setGlobalState',
    description: 'Setting the global state of the application',
    type: '(payload: { key: string, data: any } ) => void',
  },
  ,
  {
    name: 'moment',
    description: 'The moment.js object',
    type: 'object',
  },
];
