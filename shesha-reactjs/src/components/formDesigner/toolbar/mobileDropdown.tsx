import React, { FC } from 'react';
import { Select, Tooltip } from 'antd';
import { useCanvas } from '@/providers';
import { DesktopOutlined, MobileOutlined, TabletOutlined } from '@ant-design/icons';

export interface IPreviewButtonProps { }

export const DeviceOptions: FC<IPreviewButtonProps> = ({ }) => {
  const { setCanvasWidth } = useCanvas();

  const options = [
    {
      label: 'iPhone SE', value: '375px', icon: <MobileOutlined />
    },
    {
      label: 'iPhone XR/12/13/14', value: '414px', icon: <MobileOutlined />
    },
    {
      label: 'Pixel 5', value: '393px', icon: <MobileOutlined />
    },
    {
      label: 'Samsung Galaxy S8+', value: '360px', icon: <MobileOutlined />
    },
    {
      label: 'iPad Mini', value: '768px', icon: <TabletOutlined />
    },
    {
      label: 'iPad Air/Pro', value: '820px', icon: <TabletOutlined />
    },
    {
      label: 'Surface Duo', value: '540px', icon: <TabletOutlined />
    },
    {
      label: 'Surface Pro 7', value: '912px', icon: <DesktopOutlined />
    },
    {
      label: 'Desktop 1024', value: '1024px', icon: <DesktopOutlined />
    },
    {
      label: 'Desktop 1440', value: '1440px', icon: <DesktopOutlined />
    },
    {
      label: 'Desktop 1920', value: '1920px', icon: <DesktopOutlined />
    }
  ];

  return (
    <Select
      showSearch
      placeholder="Select a device"
      optionFilterProp="label"
      defaultValue={'1024px'}
      style={{ width: '120px' }}
      size='small'
      popupMatchSelectWidth={false}
      onChange={(val) => {
        const value = parseInt(val, 10);
        setCanvasWidth(value, value > 850 ? 'desktop' : value > 430 ? 'tablet' : 'mobile');
      }}
      labelRender={({ label, value }) => {
        const option = options.find(opt => opt.value === value);
        return <Tooltip title={value}>{option?.icon} {label}</Tooltip>
      }
      }
      options={options}
    />
  );
};
