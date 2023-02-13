import { render } from '@testing-library/react';
import React from 'react';
import { filterGenericModelData, handleGenericFiltering } from '../utils';

const title = 'Hello React';

function SimpleComponent() {
  return <div>{title}</div>;
}

describe('SimpleComponent', () => {
  test('renders SimpleComponent component', () => {
    render(<SimpleComponent />);
  });
});

test('test handleGenericFiltering if it filters boolean to Yes/No', () => {
  expect(
    handleGenericFiltering(
      {
        id: 'ed911abc-08f2-4076-8187-72defa0ccd88',
        firstName: 'John',
        lastName: 'Smith',
        isMarried: false,
        isEmployed: true,
      },
      {
        boolean: [
          { origin: true, mutate: 'Yes' },
          { origin: false, mutate: 'No' },
        ],
      }
    )
  ).toEqual({
    id: 'ed911abc-08f2-4076-8187-72defa0ccd88',
    firstName: 'John',
    lastName: 'Smith',
    isMarried: 'No',
    isEmployed: 'Yes',
  });
});

test('test handleGenericFiltering if it filters boolean to Yep/Nah', () => {
  expect(
    handleGenericFiltering(
      {
        id: 'ed911abc-08f2-4076-8187-72defa0ccd88',
        firstName: 'John',
        lastName: 'Smith',
        isMarried: false,
        isEmployed: true,
      },
      {
        boolean: [
          { origin: true, mutate: 'Yep' },
          { origin: false, mutate: 'Nah' },
        ],
      }
    )
  ).toEqual({
    id: 'ed911abc-08f2-4076-8187-72defa0ccd88',
    firstName: 'John',
    lastName: 'Smith',
    isMarried: 'Nah',
    isEmployed: 'Yep',
  });
});

test('test filterGenericModelDala if it filters empty array', () => {
  expect(
    filterGenericModelData([], {
      boolean: [
        { origin: true, mutate: 'Y' },
        { origin: false, mutate: 'N' },
      ],
    })
  ).toEqual([]);
});

test('test filterGenericModelDala if it filters boolean to Y/N in array', () => {
  expect(
    filterGenericModelData(
      [
        {
          isStarted: true,
          isFinished: false,
          isLoading: true,
          isError: false,
        },
        {
          isStarted: true,
          isFinished: true,
          isLoading: false,
          isError: false,
        },
        {
          isStarted: false,
          isFinished: false,
          isLoading: false,
          isError: false,
        },
      ],
      {
        boolean: [
          { origin: true, mutate: 'Y' },
          { origin: false, mutate: 'N' },
        ],
      }
    )
  ).toEqual([
    {
      isStarted: 'Y',
      isFinished: 'N',
      isLoading: 'Y',
      isError: 'N',
    },
    {
      isStarted: 'Y',
      isFinished: 'Y',
      isLoading: 'N',
      isError: 'N',
    },
    {
      isStarted: 'N',
      isFinished: 'N',
      isLoading: 'N',
      isError: 'N',
    },
  ]);
});

test('test filterGenericModelDala if it filters data that should not be filtered', () => {
  expect(
    filterGenericModelData(
      {
        id: '08eb800f-4c58-481c-bd91-df8d67bc702e',
        firstName: 'Paul',
        lastName: 'Williams',
      },
      {
        boolean: [
          { origin: true, mutate: 'Y' },
          { origin: false, mutate: 'N' },
        ],
      }
    )
  ).toEqual({
    id: '08eb800f-4c58-481c-bd91-df8d67bc702e',
    firstName: 'Paul',
    lastName: 'Williams',
  });
});

test('test filterGenericModelDala if it filters data that should not be filtered but has empty boolean array value', () => {
  expect(
    filterGenericModelData(
      {
        id: '4e927c97-1fcd-40f7-b7fd-5ba28128b702',
        firstName: 'Jack',
        lastName: 'Sanders',
        isMarried: true,
        isEmployed: true,
      },
      {
        boolean: [],
      }
    )
  ).toEqual({
    id: '4e927c97-1fcd-40f7-b7fd-5ba28128b702',
    firstName: 'Jack',
    lastName: 'Sanders',
    isMarried: true,
    isEmployed: true,
  });
});

test('test filterGenericModelDala if it filters data that should not be filtered but has empty filters', () => {
  expect(
    filterGenericModelData(
      {
        id: '590f144b-f73e-4356-bbc9-62c0f56a6f49',
        firstName: 'Molly',
        lastName: 'Jenkins',
        isMarried: true,
        isEmployed: true,
      },
      {}
    )
  ).toEqual({
    id: '590f144b-f73e-4356-bbc9-62c0f56a6f49',
    firstName: 'Molly',
    lastName: 'Jenkins',
    isMarried: true,
    isEmployed: true,
  });
});
