import React from 'react';
import { render } from '@testing-library/react';

const title = 'Hello React';

function SimpleComponent() {
  return <div>{title}</div>;
}

describe('SimpleComponent', () => {
  test('renders SimpleComponent component', () => {
    render(<SimpleComponent />);
  });
});
