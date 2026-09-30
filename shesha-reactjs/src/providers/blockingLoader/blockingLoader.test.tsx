
import { screen, renderHook, act } from '@testing-library/react';
import { BlockingLoaderProvider, useBlockingLoader } from './index';
import React from 'react';
import { ILoaderInstance } from './instance';

describe('BlockingLoaderProvider', () => {
  it('should show loader when showLoader action is executed', () => {
    const message = 'Loading...';
    const secondMessage = 'Closing...';
    const block = true;

    const wrapper = ({ children }: { children: React.ReactNode }): React.JSX.Element => <BlockingLoaderProvider level="page">{children}</BlockingLoaderProvider>;
    const { result } = renderHook(() => useBlockingLoader('page'), { wrapper });
    expect(result.current).toBeDefined();

    let loader: ILoaderInstance | null = null;

    // Execute the showLoader action
    act(() => {
      loader = result.current.showLoader(message, block);
    });

    // Check if the loader is displayed
    expect(screen.getByRole('status')).toBeDefined();
    // Check if the loader message is correct
    expect(screen.getByText(message)).toBeDefined();

    // update message
    act(() => {
      loader?.updateMessage(secondMessage);
    });
    // Check if the loader message is correct
    expect(screen.getByText(secondMessage)).toBeDefined();

    // Execute the hideLoaders action
    act(() => {
      result.current.hideLoaders();
    });
    // Check if the loader is hidden
    expect(screen.queryByRole('status')).toBeNull();
  });
});
