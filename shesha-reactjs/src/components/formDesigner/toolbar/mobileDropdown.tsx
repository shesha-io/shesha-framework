import React, { FC } from 'react';
import { Dropdown, MenuProps, Select } from 'antd';
import { useCanvas } from '@/providers';
import { TabletOutlined } from '@ant-design/icons';

export interface IPreviewButtonProps {
  refLink: React.LegacyRef<HTMLSpanElement>;
  customEditRef?: React.LegacyRef<HTMLSpanElement> | any;
}

export const MobileOptions: FC<IPreviewButtonProps> = ({ refLink, customEditRef }) => {
  const { setCanvasWidth, designerWidth: width, designerDevice: activeDevice } = useCanvas();

  const items: MenuProps['items'] = [
    {
      label: (
        <div style={{ width: '11rem' }}>
          <h5 style={{ marginTop: '-5px', textDecorationLine: 'underline' }}> Dimensions: Responsive</h5>
          <Select
            showSearch
            placeholder="Select a device"
            optionFilterProp="label"
            defaultValue="428"
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
                value: '375px',
                label: 'iPhone SE',
              },
              {
                value: '414px',
                label: 'iPhone XR',
              },
              {
                value: '390px',
                label: 'iPhone 12 Pro',
              },
              {
                value: '430px',
                label: 'iPhone 14 Pro Max',
              },
              {
                value: '360px',
                label: 'Samsung Galaxy S8+',
              },
              {
                value: '412px',
                label: 'Samsung Galaxy S20 Ultra',
              },
              {
                value: '768px',
                label: 'iPad Mini',
              },
              {
                value: '820px',
                label: 'iPad Air',
              },
              {
                value: '1024px',
                label: 'iPad Pro',
              },
              {
                value: '912px',
                label: 'Surface Pro 7',
              },
              {
                value: '540px',
                label: 'Surface Duo',
              },
              {
                value: '344px',
                label: 'Galaxy Z Fold 5',
              },
              {
                value: '853px',
                label: 'Asus Zenbook Fold',
              },
              {
                value: '1280px',
                label: 'Nest Hub Max',
              },
              {
                value: '322px',
                label: 'iPhone 4',
              },
              {
                value: '545px',
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
