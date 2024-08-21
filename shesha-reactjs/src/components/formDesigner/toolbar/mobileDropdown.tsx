import React, { FC } from 'react';
import { Dropdown, MenuProps, Select } from 'antd';
import { useCanvasConfig } from '@/providers';
import { TabletOutlined } from '@ant-design/icons';

export interface IPreviewButtonProps {
  refLink: React.LegacyRef<HTMLSpanElement>;
  customEditRef?: React.LegacyRef<HTMLSpanElement> | any;
}

export const MobileOptions: FC<IPreviewButtonProps> = ({ refLink, customEditRef }) => {
  const { setCanvasWidth, width, activeDevice } = useCanvasConfig();

  const items: MenuProps['items'] = [
    {
      label: (
        <div style={{ width: '11rem' }}>
          <h5 style={{ marginTop: '-5px', textDecorationLine: 'underline' }}> Dimensions: Responsive</h5>
          <Select
            showSearch
            placeholder="Select a device"
            optionFilterProp="label"
            defaultValue={'428'}
            value={activeDevice === 'mobile' ? width.toString() : '428'}
            style={{ width: '100%' }}
            onChange={(val) => {
              if (val === '545') {
                customEditRef.current.click();
              } else {
                setCanvasWidth(parseInt(val, 10), 'mobile');
              }
            }}
            options={[
              {
                value: '375',
                label: 'iPhone SE',
              },
              {
                value: '414',
                label: 'iPhone XR',
              },
              {
                value: '390',
                label: 'iPhone 12 Pro',
              },
              {
                value: '430',
                label: 'iPhone 14 Pro Max',
              },
              {
                value: '412',
                label: 'Pixel 7',
              },
              {
                value: '360',
                label: 'Samsung Galaxy S8+',
              },
              {
                value: '412',
                label: 'Samsung Galaxy S20 Ultra',
              },
              {
                value: '768',
                label: 'iPad Mini',
              },
              {
                value: '820',
                label: 'iPad Air',
              },
              {
                value: '1024',
                label: 'iPad Pro',
              },
              {
                value: '912',
                label: 'Surface Pro 7',
              },
              {
                value: '540',
                label: 'Surface Duo',
              },
              {
                value: '344',
                label: 'Galaxy Z Fold 5',
              },
              {
                value: '853',
                label: 'Asus Zenbook Fold',
              },
              {
                value: '412',
                label: 'Samsung Galaxy A51/71',
              },
              {
                value: '1024',
                label: 'Nest Hub',
              },
              {
                value: '1280',
                label: 'Nest Hub Max',
              },
              {
                value: '322',
                label: 'iPhone 4',
              },
              {
                value: '545',
                label: 'Edit...',
              },
            ]}
          />
        </div>
      ),
      key: '1',
      disabled: true,
    },
  ];

  const menuProps = {
    items,
    title: 'Responsive',
  };

  return (
    <Dropdown menu={menuProps} placement="bottom" trigger={['click']} overlayStyle={{ border: '1px dashed gray' }}>
      <TabletOutlined ref={refLink} onClick={(e) => e.preventDefault()} />
    </Dropdown>
  );
};
