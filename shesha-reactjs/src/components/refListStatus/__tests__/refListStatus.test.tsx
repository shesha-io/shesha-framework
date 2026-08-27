import { render } from '@testing-library/react';
import { vi } from 'vitest';
import * as React from 'react';
import { IReferenceListItem } from '@/interfaces/referenceList';

/**
 * Covers the ways the appearance switches used to be inert: the tag vanished altogether once both
 * Show Icon and Show Reference List Item Name were off, and Show Solid Background did nothing for
 * an item with no colour configured.
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

let currentItem: IReferenceListItem = item;

vi.mock('@/providers/referenceListDispatcher', () => ({
  useReferenceListItem: () => ({ data: currentItem, loading: false, error: undefined }),
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

beforeEach(() => {
  currentItem = item;
});

describe('RefListStatus', () => {
  describe('showIcon', () => {
    it('renders the item icon', () => {
      expect(tagOf(renderStatus({ showIcon: true }))?.querySelector('.anticon-user')).not.toBeNull();
    });

    it('renders no icon when off', () => {
      expect(tagOf(renderStatus({ showIcon: false, showReflistName: true }))?.querySelector('.anticon')).toBeNull();
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
  });
});
