import { render } from '@testing-library/react';
import { vi } from 'vitest';
import * as React from 'react';
import { IReferenceListItem } from '@/interfaces/referenceList';

/**
 * Covers the three ways the appearance switches used to be inert:
 *  - Show Icon did nothing on the designer canvas, which always took the placeholder branch;
 *  - the tag vanished altogether once both Show Icon and Show Reference List Item Name were off;
 *  - Show Solid Background did nothing for an item with no colour configured.
 */

const item: IReferenceListItem = {
  id: '1',
  item: 'Male',
  itemValue: 1,
  description: null,
  orderIndex: 0,
  color: null,
  icon: 'UserOutlined',
  shortAlias: null,
};

let currentItem: IReferenceListItem | undefined = item;
let currentList: IReferenceListItem[] = [item];

vi.mock('@/providers/referenceListDispatcher', () => ({
  useReferenceListItem: () => ({ data: currentItem, loading: false, error: undefined }),
  useReferenceList: () => ({ data: { name: 'Gender', items: currentList }, loading: false, error: undefined }),
}));

vi.mock('@/providers', () => ({
  useThemeState: () => ({ theme: { application: { primaryColor: '#1890ff' } } }),
}));

import { RefListStatus } from '../index';

const renderStatus = (props: Partial<React.ComponentProps<typeof RefListStatus>>): HTMLElement => {
  const { container } = render(
    <RefListStatus referenceListId={{ module: 'Shesha', name: 'Gender' }} value={1} {...props} />,
  );
  return container;
};

const tagOf = (container: HTMLElement): HTMLElement | null => container.querySelector('.ant-tag');

/** The designer branch is the one with no value to resolve, so `useReferenceListItem` returns nothing. */
const renderDesigner = (props: Partial<React.ComponentProps<typeof RefListStatus>>): HTMLElement => {
  currentItem = undefined;
  return renderStatus({ ...props, isDesigner: true });
};

beforeEach(() => {
  currentItem = item;
  currentList = [item];
});

describe('RefListStatus', () => {
  describe('showIcon', () => {
    it('renders the item icon', () => {
      expect(tagOf(renderStatus({ showIcon: true }))?.querySelector('.anticon-user')).not.toBeNull();
    });

    it('renders no icon when off', () => {
      expect(tagOf(renderStatus({ showIcon: false, showReflistName: true }))?.querySelector('.anticon')).toBeNull();
    });

    it('is honoured by the designer placeholder, which has no item to read an icon from', () => {
      expect(tagOf(renderDesigner({ showIcon: true }))?.querySelector('.anticon')).not.toBeNull();
      expect(tagOf(renderDesigner({ showIcon: false }))?.querySelector('.anticon')).toBeNull();
    });

    it('uses a generic tag icon on the canvas, never one lifted from another item', () => {
      currentList = [{ ...item, icon: 'SmileOutlined' }];
      const tag = tagOf(renderDesigner({ showIcon: true }));

      expect(tag?.querySelector('.anticon-tag')).not.toBeNull();
      expect(tag?.querySelector('.anticon-smile')).toBeNull();
    });
  });

  describe('with neither the name nor an icon shown', () => {
    it('still renders the tag', () => {
      expect(tagOf(renderStatus({ showIcon: false, showReflistName: false }))).not.toBeNull();
    });

    it('names the tag for screen readers, since it carries no text', () => {
      expect(tagOf(renderStatus({ showIcon: false, showReflistName: false }))?.getAttribute('aria-label')).toBe('Male');
    });
  });

  describe('the designer placeholder text', () => {
    it('names the component by its property name', () => {
      expect(tagOf(renderDesigner({ showReflistName: true, propertyName: 'gender' }))?.textContent).toBe('gender');
    });

    it('falls back to a stand-in when the component is unbound', () => {
      expect(tagOf(renderDesigner({ showReflistName: true }))?.textContent).toBe('N/A');
    });
  });

  describe('a display driven by JS', () => {
    // The canvas has no data to evaluate the expression against, and it could resolve differently
    // per row, so one neutral shape stands for all of them.
    it('previews one fixed shape on the canvas', () => {
      const tag = tagOf(renderDesigner({ displayIsDynamic: true, propertyName: 'gender' }));

      expect(tag?.textContent).toBe('Reference List Item');
      expect(tag?.querySelector('.anticon-tag')).not.toBeNull();
      expect(tag?.style.backgroundColor).toBe('rgb(140, 140, 140)');
      expect(tag?.style.color).toBe('rgb(255, 255, 255)');
    });

    it('ignores the solid background switch and the list colour, which it does not govern', () => {
      currentList = [{ ...item, color: '#ff0000' }];
      const tag = tagOf(renderDesigner({ displayIsDynamic: true, solidBackground: false }));

      expect(tag?.className).toContain('ant-tag-solid');
      expect(tag?.style.backgroundColor).toBe('rgb(140, 140, 140)');
    });
  });

  describe('read only', () => {
    // Read only is a status tag's natural state. Rendering it as plain text through
    // ReadOnlyDisplayFormItem threw away everything the component displays.
    it('still renders the tag, with its icon and colour', () => {
      currentItem = { ...item, color: '#ff0000' };
      const tag = tagOf(renderStatus({ readOnly: true, showIcon: true, showReflistName: true, solidBackground: true }));

      expect(tag).not.toBeNull();
      expect(tag?.querySelector('.anticon-user')).not.toBeNull();
      expect(tag?.style.backgroundColor).toBe('rgb(255, 0, 0)');
    });
  });

  describe('solidBackground', () => {
    it('paints the item colour when it has one', () => {
      currentItem = { ...item, color: '#ff0000' };
      const tag = tagOf(renderStatus({ solidBackground: true, showReflistName: true }));

      expect(tag?.className).toContain('ant-tag-solid');
      expect(tag?.style.backgroundColor).toBe('rgb(255, 0, 0)');
    });

    it('falls back to grey for an item with no colour', () => {
      currentItem = { ...item, color: null };
      const tag = tagOf(renderStatus({ solidBackground: true, showReflistName: true }));

      expect(tag?.className).toContain('ant-tag-solid');
      expect(tag?.style.backgroundColor).toBe('rgb(140, 140, 140)');
    });

    it('forces the text white, over the configured font colour', () => {
      currentItem = { ...item, color: '#ff0000' };
      const tag = tagOf(renderStatus({
        solidBackground: true,
        showReflistName: true,
        style: { color: '#000000' },
      }));

      expect(tag?.style.color).toBe('rgb(255, 255, 255)');
    });

    it('reads as plain text when off, with no tag chrome', () => {
      currentItem = { ...item, color: '#ff0000' };
      const tag = tagOf(renderStatus({ solidBackground: false, showReflistName: true }));

      expect(tag?.textContent).toBe('Male');
      expect(tag?.style.background).toBe('transparent');
      expect(tag?.style.borderStyle).toBe('none');
      expect(tag?.style.padding).toBe('0px');
    });

    it('strips the chrome from the designer placeholder too when off', () => {
      const tag = tagOf(renderDesigner({ solidBackground: false, showReflistName: true }));

      expect(tag?.style.background).toBe('transparent');
      expect(tag?.style.borderStyle).toBe('none');
    });
  });
});
