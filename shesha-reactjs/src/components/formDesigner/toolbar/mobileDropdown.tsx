import React, { FC } from 'react';
import { Tooltip } from 'antd';
import { useCanvas } from '@/providers';
import CustomDropdown from '@/designer-components/_settings/utils/CustomDropdown';
import { getDeviceTypeByWidth, screenSizeOptions } from '@/providers/canvas/utils';

export interface IPreviewButtonProps { }

export const DeviceOptions: FC<IPreviewButtonProps> = () => {
  const { setCanvasWidth, designerWidth } = useCanvas();

  return (
    <CustomDropdown
      placeholder="Select a device"
      optionFilterProp="label"
      defaultValue="1024px"
      style={{ width: '120px' }}
      size="small"
      customTooltip='Add a custom screen size e.g "1440px".'
      popupMatchSelectWidth={false}
      onChange={(val) => {
        const value = parseInt(val, 10);
        setCanvasWidth(value, getDeviceTypeByWidth(value));
      }}
      value={typeof designerWidth === 'number' ? `${designerWidth}px` : designerWidth}
      labelRender={({ label, value }) => {
        const option = screenSizeOptions.find((opt) => opt.value === value);
        const Icon = option?.icon;
        return (
          <Tooltip title={value}>
            {Icon ? <Icon /> : null} {label ?? value}
          </Tooltip>
        );
      }}
      options={screenSizeOptions.map((opt) => ({ ...opt, title: opt.value }))}
    />
  );
};
