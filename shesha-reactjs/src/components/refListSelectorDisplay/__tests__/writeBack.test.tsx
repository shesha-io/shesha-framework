import { act, render } from '@testing-library/react';
import { FC, useState } from 'react';
import { IReferenceListItem } from '@/interfaces/referenceList';
import { IRefListItemFormModel } from '../provider/models';

const refListItems: IReferenceListItem[] = [
  { id: 'male-id', item: 'Male', itemValue: 1, description: null, orderIndex: 0, color: null, icon: null, shortAlias: null },
  { id: 'female-id', item: 'Female', itemValue: 2, description: null, orderIndex: 1, color: null, icon: null, shortAlias: null },
];

const getReferenceList = vi.fn(() => ({ promise: Promise.resolve({ items: refListItems }) }));

vi.mock('@/providers/referenceListDispatcher', () => ({
  useReferenceListDispatcher: () => ({ getReferenceList }),
}));

// Stand-in for the real item settings form: writes an action onto the selected item, the way
// RefListItemProperties does through its debounced updateItem.
vi.mock('../options/configurator', async () => {
  const { useRefListItemGroupConfigurator: useCfg } = await import('../provider');
  const Stub: FC = () => {
    const { selectedItemId, updateItem } = useCfg();
    if (selectedItemId === undefined) return null;
    return (
      <button
        type="button"
        onClick={() => updateItem({
          id: selectedItemId,
          settings: {
            id: selectedItemId,
            actionConfiguration: { actionOwner: 'x', actionName: 'Show Dialog', handleSuccess: false, handleFail: false, _type: undefined },
          },
        })}
      >
        set action
      </button>
    );
  };
  return { default: Stub };
});

import RefListItemSelectorSettingsModal from '../options/modal';

/**
 * The stored shape of an item: the reference list's own fields travel with it, but only `item` and
 * `itemValue` are part of the declared item type.
 */
type SerializedItem = IRefListItemFormModel & { orderIndex?: number | undefined };

/**
 * A previously saved list, as it comes back from the form configuration: the reference list's
 * blank display data (colour, icon, alias) was dropped when it was serialised.
 */
const savedItems: SerializedItem[] = [
  { id: 'male-id', item: 'Male', itemValue: 1, orderIndex: 0 },
  { id: 'female-id', item: 'Female', itemValue: 2, orderIndex: 1 },
];

/** Stands in for the settings form: the value it holds is what the configurator reports back to it. */
const ControlledHost: FC<{ initialValue: SerializedItem[]; onValue: (value: IRefListItemFormModel[]) => void }> = ({ initialValue, onValue }) => {
  const [value, setValue] = useState<IRefListItemFormModel[]>(initialValue);

  return (
    <RefListItemSelectorSettingsModal
      value={value}
      onChange={(newValue) => {
        setValue(newValue ?? []);
        onValue(newValue ?? []);
      }}
      readOnly={false}
      referenceList={{ name: 'Gender', module: 'Core' }}
    />
  );
};

const clickButton = async (matches: (button: HTMLButtonElement) => boolean): Promise<void> => {
  const button = Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find(matches);
  expect(button).toBeDefined();
  await act(async () => {
    button!.click();
    await Promise.resolve();
  });
};

describe('RefList items write-back', () => {
  beforeEach(() => {
    getReferenceList.mockClear();
  });

  it('reports nothing when the reference list only fills in blank display data', async () => {
    const onValue = vi.fn();
    await act(async () => {
      render(<ControlledHost initialValue={savedItems} onValue={onValue} />);
      await Promise.resolve();
    });

    expect(onValue).not.toHaveBeenCalled();
  });

  it('propagates a first-step configuration to the host form value', async () => {
    const onValue = vi.fn<(value: IRefListItemFormModel[]) => void>();
    await act(async () => {
      render(<ControlledHost initialValue={[]} onValue={onValue} />);
      await Promise.resolve();
    });

    const lastValue = (): IRefListItemFormModel[] | undefined => onValue.mock.lastCall?.[0];

    // the empty list the host already holds must not be written back; only the items read from
    // the reference list are reported
    expect(onValue).toHaveBeenCalledTimes(1);
    expect(lastValue()).toHaveLength(2);

    // open the FIRST step's configuration modal
    const gears = Array.from(document.querySelectorAll<HTMLButtonElement>('.sha-toolbar-item button'));
    expect(gears).toHaveLength(2);
    await act(async () => {
      gears[0]!.click();
      await Promise.resolve();
    });

    await clickButton((b) => b.textContent === 'set action');

    expect(lastValue()?.find((i) => i.itemValue === 1)).toMatchObject({ actionConfiguration: { actionName: 'Show Dialog' } });

    // saving the step modal closes it and re-renders the host from the value it now holds, which
    // must still carry the configuration
    const reportsBeforeSave = onValue.mock.calls.length;
    await clickButton((b) => b.textContent === 'Save' && b.closest('.ant-modal') !== null);

    expect(lastValue()?.find((i) => i.itemValue === 1)).toMatchObject({ actionConfiguration: { actionName: 'Show Dialog' } });
    // the round trip through the host is settled: saving reports nothing new
    expect(onValue.mock.calls).toHaveLength(reportsBeforeSave);
    expect(getReferenceList).toHaveBeenCalledTimes(1);
  });
});
