import { act, render } from '@testing-library/react';
import { FC } from 'react';
import { IReferenceListItem } from '@/interfaces/referenceList';
import { RefListGroupItemProps } from '../provider/models';

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
    return (
      <button
        type="button"
        onClick={() => updateItem({ id: selectedItemId!, settings: { actionConfiguration: { actionName: 'Show Dialog' } } as RefListGroupItemProps })}
      >
        set action
      </button>
    );
  };
  return { default: Stub };
});

import RefListItemSelectorSettingsModal from '../options/modal';

/**
 * A previously saved list, as it comes back from the form configuration: the reference list's
 * blank display data (colour, icon, alias) was dropped when it was serialised.
 * `orderIndex` is carried on the stored items but is not part of the declared item type.
 */
const savedItems = [
  { id: 'male-id', item: 'Male', itemValue: 1, orderIndex: 0 },
  { id: 'female-id', item: 'Female', itemValue: 2, orderIndex: 1 },
] as unknown as RefListGroupItemProps[];

describe('RefList items write-back', () => {
  beforeEach(() => {
    getReferenceList.mockClear();
  });

  it('reports nothing when the reference list only fills in blank display data', async () => {
    const onChange = vi.fn();
    await act(async () => {
      render(
        <RefListItemSelectorSettingsModal
          value={savedItems}
          onChange={onChange}
          readOnly={false}
          referenceList={{ name: 'Gender', module: 'Core' }}
        />,
      );
      await Promise.resolve();
    });

    expect(onChange).not.toHaveBeenCalled();
  });

  it('propagates a first-step configuration to the host form value', async () => {
    const onChange = vi.fn();
    await act(async () => {
      render(
        <RefListItemSelectorSettingsModal
          value={[]}
          onChange={onChange}
          readOnly={false}
          referenceList={{ name: 'Gender', module: 'Core' }}
        />,
      );
      await Promise.resolve();
    });

    const calls = (): RefListGroupItemProps[][] => onChange.mock.calls.map((c) => c[0] as RefListGroupItemProps[]);

    // the empty list the host already holds must not be written back; only the items read from
    // the reference list are reported
    expect(calls()).toHaveLength(1);
    expect(calls()[0]).toHaveLength(2);

    // open the FIRST step's configuration modal
    const gears = Array.from(document.querySelectorAll<HTMLButtonElement>('.sha-toolbar-item button'));
    expect(gears).toHaveLength(2);
    await act(() => {
      gears[0]!.click();
    });

    const setAction = Array.from(document.querySelectorAll<HTMLButtonElement>('button')).find((b) => b.textContent === 'set action');
    await act(() => {
      setAction!.click();
    });

    const last = calls()[calls().length - 1];
    expect(last?.find((i) => i.itemValue === 1)).toMatchObject({ actionConfiguration: { actionName: 'Show Dialog' } });

    // ... and it survives saving the step modal, which closes it and re-renders the host
    const save = Array.from(document.querySelectorAll<HTMLButtonElement>('.ant-modal button')).find((b) => b.textContent === 'Save');
    expect(save).toBeDefined();
    await act(async () => {
      save!.click();
      await Promise.resolve();
    });

    const afterSave = calls()[calls().length - 1];
    expect(afterSave?.find((i) => i.itemValue === 1)).toMatchObject({ actionConfiguration: { actionName: 'Show Dialog' } });
    expect(getReferenceList).toHaveBeenCalledTimes(1);
  });
});
