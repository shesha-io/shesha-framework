import React, { FC, useState } from 'react';
import { Select, Space, Button, Input, Divider, Tooltip,  } from 'antd';
import { useCanvas } from '@/providers';
import { DesktopOutlined, MobileOutlined, PlusOutlined, QuestionCircleOutlined, TabletOutlined } from '@ant-design/icons';

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
      label: <span><TabletOutlined/> Tablet</span>,
      title: 'tablet',
      options: [
    {
      value: '768px',
      label: 'iPad Mini',
    },
    {
      value: '540px',
      label: 'Surface Duo',
    },
    {
      value: '1024px',
      label: 'iPad Pro',
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
      labelRender={({label})=> {
        const icon = isDesktop ? <DesktopOutlined /> :
        isTablet ? <TabletOutlined /> : <MobileOutlined />
        return <>{icon} {label}</>
      }
    }
      options={options}
    />
  );
};
