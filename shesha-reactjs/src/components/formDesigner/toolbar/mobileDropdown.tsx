import React, { FC } from 'react';
import { Select, Tooltip } from 'antd';
import { useCanvas } from '@/providers';
import { DesktopOutlined, MobileOutlined, TabletOutlined } from '@ant-design/icons';

export interface IPreviewButtonProps { }

export const DeviceOptions: FC<IPreviewButtonProps> = ({ }) => {
  const { setCanvasWidth, setDesignerDevice, designerWidth: width, designerDevice: activeDevice } = useCanvas();

  const isDesktop = parseInt(width) > 1020;
  const isTablet = parseInt(width) > 425;

  const options = [
    {
      label: (
        <span>
          <DesktopOutlined /> Desktop
        </span>
      ),
      title: 'desktop',
      options: [
        {
          value: '1440px',
          label: 'Desktop'
        },
        {
          value: '1280px',
          label: 'Nest Hub Max',
        },
        {
          value: '1024px',
          label: 'Laptop Small',
        },
        {
          value: '853px',
          label: 'Asus Zenbook Fold',
        },
        {
          value: '912px',
          label: 'Surface Pro 7',
        },
      ],
    },
    {
      label: (
        <span>
          <MobileOutlined /> Mobile
        </span>
      ),
      title: 'mobile',
      options: [
        {
          value: '322px',
          label: 'iPhone 4',
        },
        {
          value: '344px',
          label: 'Galaxy Z Fold 5',
        },
        {
          value: '360px',
          label: 'Samsung Galaxy S8+',
        },
        {
          value: '375px',
          label: 'iPhone SE',
        },
        {
          value: '390px',
          label: 'iPhone 12 Pro',
        },
        {
          value: '412px',
          label: 'Samsung Galaxy S20 Ultra',
        },
        {
          value: '414px',
          label: 'iPhone XR',
        },
        {
          value: '430px',
          label: 'iPhone 14 Pro Max',
        },
      ],
    },
    {
      label: <span><TabletOutlined /> Tablet</span>,
      title: 'tablet',
      options: [
        {
          value: '540px',
          label: 'Tablet',
        },
        {
          value: '768px',
          label: 'iPad Mini',
        },
      ]
    }
  ];

  return (
    <Select
      showSearch
      placeholder="Select a device"
      optionFilterProp="label"
      defaultValue={'428'}
      value={activeDevice === 'mobile' ? width.toString() : width}
      // variant='borderless'
      style={{ width: '120px' }}
      size='small'
      popupMatchSelectWidth={false}
      onChange={(val) => {
        const value = parseInt(val, 10);
        setCanvasWidth(value, value > 850 ? 'desktop' : value > 430 ? 'tablet' : 'mobile');
        setDesignerDevice(value > 850 ? 'desktop' : value > 430 ? 'tablet' : 'mobile');
      }}
      labelRender={({ label, value }) => {
        const icon = isDesktop ? <DesktopOutlined /> :
          isTablet ? <TabletOutlined /> : <MobileOutlined />
        return <Tooltip title={value}>{icon} {label}</Tooltip>
      }
      }
      options={options}
    />
  );
};
