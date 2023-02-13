import { Column } from 'react-table';

export const TEST_DATA = [
  {
    id: 0,
    firstName: 'paper-62ya2',
    lastName: 'wire-6566w',
    age: 6,
    visits: 35,
    progress: 41,
    status: 'complicated',
    subRows: [
      { firstName: 'magazine-19670', lastName: 'knee-849pl', age: 3, visits: 61, progress: 75, status: 'relationship' },
      { firstName: 'brass-g9osu', lastName: 'stop-0ge1u', age: 13, visits: 70, progress: 82, status: 'single' },
      { firstName: 'fly-nubay', lastName: 'coach-8mqfz', age: 27, visits: 73, progress: 90, status: 'complicated' },
    ],
  },
  {
    id: 1,
    firstName: 'republic-askah',
    lastName: 'point-1kszd',
    age: 25,
    visits: 68,
    progress: 28,
    status: 'complicated',
    subRows: [
      {
        firstName: 'record-7k0ob',
        lastName: 'version-ywvsu',
        age: 15,
        visits: 84,
        progress: 74,
        status: 'complicated',
      },
      { firstName: 'sand-ya9co', lastName: 'profit-yeayq', age: 15, visits: 9, progress: 99, status: 'single' },
      {
        firstName: 'cracker-9g39u',
        lastName: 'recording-infvu',
        age: 26,
        visits: 11,
        progress: 35,
        status: 'relationship',
      },
    ],
  },
  {
    id: 2,
    firstName: 'belief-7s7kt',
    lastName: 'voyage-5zeuq',
    age: 2,
    visits: 79,
    progress: 24,
    status: 'complicated',
    subRows: [
      { firstName: 'sweater-edzr9', lastName: 'aunt-3gaix', age: 11, visits: 68, progress: 46, status: 'single' },
      {
        firstName: 'spade-tnpn3',
        lastName: 'psychology-mb3uq',
        age: 26,
        visits: 92,
        progress: 87,
        status: 'complicated',
      },
      { firstName: 'account-9pd19', lastName: 'bean-z8vti', age: 28, visits: 51, progress: 98, status: 'single' },
    ],
  },
  {
    id: 3,
    firstName: 'concept-5lmq8',
    lastName: 'garbage-boea3',
    age: 21,
    visits: 45,
    progress: 28,
    status: 'relationship',
    subRows: [
      {
        firstName: 'freedom-8536f',
        lastName: 'kitten-4w73r',
        age: 18,
        visits: 94,
        progress: 74,
        status: 'complicated',
      },
      {
        firstName: 'replacement-m8cn0',
        lastName: 'director-140wy',
        age: 21,
        visits: 91,
        progress: 75,
        status: 'relationship',
      },
      {
        firstName: 'frogs-ro93c',
        lastName: 'application-3m541',
        age: 11,
        visits: 72,
        progress: 70,
        status: 'complicated',
      },
    ],
  },
  {
    id: 4,
    firstName: 'glove-8f112',
    lastName: 'force-zlkky',
    age: 26,
    visits: 75,
    progress: 55,
    status: 'single',
    subRows: [
      { firstName: 'poetry-9cl05', lastName: 'method-sj5r6', age: 16, visits: 60, progress: 16, status: 'complicated' },
      { firstName: 'noise-ziw2h', lastName: 'design-trjnf', age: 28, visits: 72, progress: 54, status: 'single' },
      { firstName: 'series-c8x1i', lastName: 'investment-qumvf', age: 24, visits: 67, progress: 7, status: 'single' },
    ],
  },
];

export const TEST_COLUMNS: Column<any>[] = [
  // {
  //   Header: 'Id',
  //   accessor: 'id',
  //   isVisible: false,
  //   width: 0
  // },
  {
    Header: 'First Name',
    accessor: 'firstName',
    // i: false,
  },
  {
    Header: 'Last Name',
    accessor: 'lastName',
  },

  {
    Header: 'Age',
    accessor: 'age',
  },
  {
    Header: 'Visits',
    accessor: 'visits',
    // width: 50,
  },
  {
    Header: 'Status',
    accessor: 'status',
    // width: 30,
  },
  {
    Header: 'Profile Progress',
    accessor: 'progress',
  },
];
