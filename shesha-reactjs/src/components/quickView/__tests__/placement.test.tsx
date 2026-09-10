import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { GenericQuickView, QUICKVIEW_PLACEMENT } from '..';

// antd's popup aligner needs ResizeObserver, which jsdom does not provide
class ResizeObserverStub {
  observe(): void {}

  unobserve(): void {}

  disconnect(): void {}
}
vi.stubGlobal('ResizeObserver', ResizeObserverStub);

vi.mock('@/providers/configurationItemsLoader', () => ({
  useConfigurationItemsLoader: () => ({ getEntityFormIdAsync: () => Promise.reject(new Error('no form')) }),
}));

describe('QuickView popover placement (#4973)', () => {
  it('anchors to the left edge of the trigger rather than centring on the full-width button', async () => {
    render(<GenericQuickView entityType={{ name: 'Address', module: 'Shesha' }} formType="Details" displayName="Short" displayProperty="name" />);
    const trigger = await screen.findByLabelText('Quickview configuration error');
    fireEvent.mouseEnter(trigger);
    await waitFor(() => expect(document.querySelector('.ant-popover')).not.toBeNull());
    expect(document.querySelector('.ant-popover')?.className).toContain(`ant-popover-placement-${QUICKVIEW_PLACEMENT}`);
  });
});
