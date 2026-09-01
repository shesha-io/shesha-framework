import { act, render } from '@testing-library/react';
import { FC, useEffect, useState } from 'react';
import { IReferenceListItem } from '@/interfaces/referenceList';
import { RefListItemGroupConfiguratorProvider, useRefListItemGroupConfigurator } from '../provider';
import { RefListGroupItemProps } from '../provider/models';

const refListItems: IReferenceListItem[] = [
  { id: 'male-id', item: 'Male', itemValue: 1, description: null, orderIndex: 0, color: null, icon: null, shortAlias: null },
  { id: 'female-id', item: 'Female', itemValue: 2, description: null, orderIndex: 1, color: null, icon: null, shortAlias: null },
];

const getReferenceList = vi.fn(() => ({ promise: Promise.resolve({ items: refListItems }) }));

vi.mock('@/providers/referenceListDispatcher', () => ({
  useReferenceListDispatcher: () => ({ getReferenceList }),
}));

interface IProbeHandle {
  items: RefListGroupItemProps[];
  configureFirstItem: () => void;
}

const Probe: FC<{ onReady: (handle: IProbeHandle) => void }> = ({ onReady }) => {
  const { items, updateItem } = useRefListItemGroupConfigurator();

  useEffect(() => {
    onReady({
      items,
      configureFirstItem: () => updateItem({
        id: 'male-id',
        settings: {
          hidden: true,
          tooltip: 'first step',
          actionConfiguration: { actionName: 'Show Dialog', actionOwner: 'x' },
        } as RefListGroupItemProps,
      }),
    });
  });

  return <div>{items.length}</div>;
};

/** Stands in for the settings-panel host, which re-renders whenever the configured value is written back. */
const Host: FC<{ onReady: (handle: IProbeHandle) => void; onRerender: (rerender: () => void) => void }> = ({ onReady, onRerender }) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    onRerender(() => setTick((tick) => tick + 1));
  });

  return (
    <RefListItemGroupConfiguratorProvider items={[]} referenceList={{ name: 'Gender', module: 'Core' }}>
      <Probe onReady={onReady} />
    </RefListItemGroupConfiguratorProvider>
  );
};

/** Stands in for the rendered component, whose items come from the saved component model. */
const Canvas: FC<{ items: RefListGroupItemProps[]; onReady: (handle: IProbeHandle) => void }> = ({ items, onReady }) => (
  <RefListItemGroupConfiguratorProvider items={items} referenceList={{ name: 'Gender', module: 'Core' }}>
    <Probe onReady={onReady} />
  </RefListItemGroupConfiguratorProvider>
);

describe('RefList item configurator', () => {
  it('keeps a step configuration when the host re-renders', async () => {
    let handle: IProbeHandle | undefined;
    let rerender = (): void => undefined;
    const captureHandle = (h: IProbeHandle): void => {
      handle = h;
    };
    const captureRerender = (fn: () => void): void => {
      rerender = fn;
    };

    await act(async () => {
      render(<Host onReady={captureHandle} onRerender={captureRerender} />);
      await Promise.resolve();
    });

    expect(handle?.items).toHaveLength(2);

    // configure the FIRST step: Hide, a tooltip and an action
    await act(() => {
      handle?.configureFirstItem();
    });

    expect(handle?.items[0]).toMatchObject({ hidden: true, tooltip: 'first step', actionConfiguration: { actionName: 'Show Dialog' } });

    await act(async () => {
      rerender();
      await Promise.resolve();
    });

    expect(handle?.items[0]).toMatchObject({ hidden: true, tooltip: 'first step', actionConfiguration: { actionName: 'Show Dialog' } });
    // the reference list is read once per identity, so a re-render must not read it again
    expect(getReferenceList).toHaveBeenCalledTimes(1);
  });

  it('adopts a configuration saved by the host without being re-created', async () => {
    let handle: IProbeHandle | undefined;
    const captureHandle = (h: IProbeHandle): void => {
      handle = h;
    };

    let rendered: ReturnType<typeof render> | undefined;
    await act(async () => {
      rendered = render(<Canvas items={[]} onReady={captureHandle} />);
      await Promise.resolve();
    });

    expect(handle?.items.map((i) => i.hidden)).toEqual([undefined, undefined]);

    // the designer saves "Hide" on the second step
    await act(async () => {
      rendered?.rerender(<Canvas items={[{ id: 'female-id', itemValue: 2, hidden: true } as RefListGroupItemProps]} onReady={captureHandle} />);
      await Promise.resolve();
    });

    expect(handle?.items.map((i) => i.hidden)).toEqual([undefined, true]);
    // the display data still comes from the reference list
    expect(handle?.items[1]).toMatchObject({ item: 'Female', itemValue: 2 });
  });
});
